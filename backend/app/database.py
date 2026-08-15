import logging
import asyncio
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.config import settings

logger = logging.getLogger("silverhands.database")

# In-Memory Async Mongo Collection Mock for standalone / offline resilience
class InMemoryAsyncCollection:
    def __init__(self, name: str):
        self.name = name
        self._docs: List[Dict[str, Any]] = []

    def _matches_filter(self, doc: Dict[str, Any], filter_doc: Dict[str, Any]) -> bool:
        if not filter_doc:
            return True
        for k, v in filter_doc.items():
            if k == "$or":
                if not any(self._matches_filter(doc, sub_f) for sub_f in v):
                    return False
                continue
            if k == "$and":
                if not all(self._matches_filter(doc, sub_f) for sub_f in v):
                    return False
                continue
            
            doc_val = doc.get(k)
            if isinstance(v, dict):
                # Handle operators like $in, $ne, $gte, $lte, $regex
                if "$in" in v:
                    if isinstance(doc_val, list):
                        if not any(item in v["$in"] for item in doc_val):
                            return False
                    elif doc_val not in v["$in"]:
                        return False
                if "$ne" in v and doc_val == v["$ne"]:
                    return False
                if "$gte" in v and (doc_val is None or doc_val < v["$gte"]):
                    return False
                if "$lte" in v and (doc_val is None or doc_val > v["$lte"]):
                    return False
                if "$regex" in v:
                    import re
                    pattern = v["$regex"]
                    options = v.get("$options", "")
                    flags = re.IGNORECASE if "i" in options else 0
                    if not doc_val or not re.search(pattern, str(doc_val), flags):
                        return False
            else:
                if isinstance(doc_val, list):
                    if v not in doc_val:
                        return False
                elif str(doc_val) != str(v):
                    return False
        return True

    async def insert_one(self, document: Dict[str, Any]):
        doc_copy = dict(document)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(ObjectId())
        else:
            doc_copy["_id"] = str(doc_copy["_id"])
        self._docs.append(doc_copy)
        class InsertResult:
            inserted_id = doc_copy["_id"]
        return InsertResult()

    async def insert_many(self, documents: List[Dict[str, Any]]):
        inserted_ids = []
        for doc in documents:
            res = await self.insert_one(doc)
            inserted_ids.append(res.inserted_id)
        class InsertManyResult:
            pass
        res = InsertManyResult()
        res.inserted_ids = inserted_ids
        return res

    async def find_one(self, filter_doc: Optional[Dict[str, Any]] = None, sort: Optional[List] = None):
        filter_doc = filter_doc or {}
        docs = [d for d in self._docs if self._matches_filter(d, filter_doc)]
        if not docs:
            return None
        if sort:
            # Simple single field sort
            key, direction = sort[0]
            docs.sort(key=lambda x: x.get(key, ""), reverse=(direction < 0))
        return dict(docs[0])

    def find(self, filter_doc: Optional[Dict[str, Any]] = None):
        filter_doc = filter_doc or {}
        matched = [dict(d) for d in self._docs if self._matches_filter(d, filter_doc)]
        
        class Cursor:
            def __init__(self, items):
                self._items = items
                self._sort_key = None
                self._sort_dir = 1
                self._skip_n = 0
                self._limit_n = None

            def sort(self, key_or_list, direction=1):
                if isinstance(key_or_list, list):
                    self._sort_key, self._sort_dir = key_or_list[0]
                else:
                    self._sort_key = key_or_list
                    self._sort_dir = direction
                return self

            def skip(self, n: int):
                self._skip_n = n
                return self

            def limit(self, n: int):
                self._limit_n = n
                return self

            async def to_list(self, length: Optional[int] = None):
                res = list(self._items)
                if self._sort_key:
                    res.sort(key=lambda x: (x.get(self._sort_key) is None, x.get(self._sort_key)), reverse=(self._sort_dir < 0))
                if self._skip_n:
                    res = res[self._skip_n:]
                if self._limit_n is not None:
                    res = res[:self._limit_n]
                elif length is not None:
                    res = res[:length]
                return res

            def __aiter__(self):
                self._iter = iter(self._items)
                return self

            async def __anext__(self):
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration

        return Cursor(matched)

    async def update_one(self, filter_doc: Dict[str, Any], update_doc: Dict[str, Any], upsert: bool = False):
        found_idx = None
        for i, d in enumerate(self._docs):
            if self._matches_filter(d, filter_doc):
                found_idx = i
                break
        
        class UpdateResult:
            matched_count = 0
            modified_count = 0
            upserted_id = None

        res = UpdateResult()
        if found_idx is not None:
            doc = self._docs[found_idx]
            if "$set" in update_doc:
                doc.update(update_doc["$set"])
            if "$inc" in update_doc:
                for k, v in update_doc["$inc"].items():
                    doc[k] = doc.get(k, 0) + v
            if "$push" in update_doc:
                for k, v in update_doc["$push"].items():
                    if k not in doc or not isinstance(doc[k], list):
                        doc[k] = []
                    doc[k].append(v)
            if "$pull" in update_doc:
                for k, v in update_doc["$pull"].items():
                    if k in doc and isinstance(doc[k], list):
                        doc[k] = [x for x in doc[k] if x != v]
            self._docs[found_idx] = doc
            res.matched_count = 1
            res.modified_count = 1
            return res
        elif upsert:
            new_doc = dict(filter_doc)
            if "$set" in update_doc:
                new_doc.update(update_doc["$set"])
            insert_res = await self.insert_one(new_doc)
            res.upserted_id = insert_res.inserted_id
            return res
        return res

    async def delete_one(self, filter_doc: Dict[str, Any]):
        for i, d in enumerate(self._docs):
            if self._matches_filter(d, filter_doc):
                self._docs.pop(i)
                class DeleteResult:
                    deleted_count = 1
                return DeleteResult()
        class DeleteResult:
            deleted_count = 0
        return DeleteResult()

    async def delete_many(self, filter_doc: Dict[str, Any]):
        initial_len = len(self._docs)
        self._docs = [d for d in self._docs if not self._matches_filter(d, filter_doc)]
        class DeleteResult:
            deleted_count = initial_len - len(self._docs)
        return DeleteResult()

    async def count_documents(self, filter_doc: Optional[Dict[str, Any]] = None) -> int:
        filter_doc = filter_doc or {}
        return sum(1 for d in self._docs if self._matches_filter(d, filter_doc))

    async def distinct(self, key: str, filter_doc: Optional[Dict[str, Any]] = None) -> List[Any]:
        filter_doc = filter_doc or {}
        values = set()
        for d in self._docs:
            if self._matches_filter(d, filter_doc) and key in d:
                val = d[key]
                if isinstance(val, list):
                    for item in val:
                        values.add(item)
                else:
                    values.add(val)
        return list(values)


class InMemoryAsyncDatabase:
    def __init__(self, db_name: str):
        self.name = db_name
        self.collections: Dict[str, InMemoryAsyncCollection] = {}

    def __getitem__(self, collection_name: str) -> InMemoryAsyncCollection:
        if collection_name not in self.collections:
            self.collections[collection_name] = InMemoryAsyncCollection(collection_name)
        return self.collections[collection_name]

    def get_collection(self, name: str) -> InMemoryAsyncCollection:
        return self[name]


class DatabaseManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Any = InMemoryAsyncDatabase(settings.DATABASE_NAME)
        self.is_connected: bool = True
        self.is_in_memory: bool = True

    async def connect(self):
        try:
            logger.info("Attempting connection to MongoDB at %s...", settings.MONGODB_URI)
            client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=1000,
                connectTimeoutMS=1000
            )
            # Verify connection with quick ping
            await client.admin.command('ping')
            self.client = client
            self.db = self.client[settings.DATABASE_NAME]
            self.is_connected = True
            self.is_in_memory = False
            logger.info("Successfully connected to live MongoDB (%s)", settings.DATABASE_NAME)
        except Exception as e:
            logger.warning("Live MongoDB not reachable (%s). Using resilient in-memory async store.", str(e))
            self.db = InMemoryAsyncDatabase(settings.DATABASE_NAME)
            self.is_connected = True
            self.is_in_memory = True
            logger.info("In-memory MongoDB-compatible store active.")

    async def disconnect(self):
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB connection.")
        self.is_connected = False

    def get_collection(self, collection_name: str):
        if self.db is None:
            self.db = InMemoryAsyncDatabase(settings.DATABASE_NAME)
            self.is_in_memory = True
            self.is_connected = True
        return self.db[collection_name]

db_manager = DatabaseManager()

def get_db():
    return db_manager.db
