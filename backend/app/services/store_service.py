import datetime
import logging
import random
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from bson import ObjectId

from app.database import db_manager
from app.schemas.store import (
    ProductCreateRequest,
    ProductResponse,
    ProductReviewItem,
    OrderItem,
    OrderCreateRequest,
    OrderResponse,
    OrderStatusUpdateRequest,
    AISuggestProductRequest,
    AISuggestProductResponse
)
from app.ai.product_ai import product_ai

logger = logging.getLogger("silverhands.store_service")

class StoreService:
    def _products_col(self):
        return db_manager.get_collection("products")

    def _orders_col(self):
        return db_manager.get_collection("orders")

    def _senior_col(self):
        return db_manager.get_collection("senior_profiles")

    def _build_id_filter(self, id_str: str) -> Dict[str, Any]:
        filters = [{"_id": id_str}, {"id": id_str}]
        if ObjectId.is_valid(id_str):
            filters.append({"_id": ObjectId(id_str)})
        return {"$or": filters}

    async def list_products(
        self,
        city: Optional[str] = None,
        category: Optional[str] = None,
        locality: Optional[str] = None,
        festival: Optional[str] = None,
        search: Optional[str] = None,
        max_price: Optional[int] = None
    ) -> List[ProductResponse]:
        col = self._products_col()
        filter_doc: Dict[str, Any] = {}

        if city and city.lower() != "all":
            filter_doc["city"] = {"$regex": city, "$options": "i"}

        if category and category.lower() != "all":
            filter_doc["category"] = category

        if locality and locality.lower() != "all":
            filter_doc["locality"] = locality

        if festival:
            filter_doc["is_festival_special"] = True

        if search and search.strip():
            filter_doc["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"keywords": {"$in": [search]}}
            ]

        if max_price:
            filter_doc["price"] = {"$lte": max_price}

        cursor = col.find(filter_doc)
        docs = await cursor.to_list(100)

        return [
            ProductResponse(
                id=str(d.get("_id")),
                seller_id=d.get("seller_id", ""),
                seller_name=d.get("seller_name", "Senior Artisan"),
                seller_locality=d.get("seller_locality", "Mylapore"),
                seller_city=d.get("seller_city", "Chennai"),
                seller_rating=d.get("seller_rating", 4.9),
                is_age_verified=d.get("is_age_verified", True),
                title=d["title"],
                description=d["description"],
                category=d["category"],
                price=d["price"],
                unit=d.get("unit", "piece"),
                images=d.get("images", ["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80"]),
                keywords=d.get("keywords", []),
                locality=d.get("locality", "Mylapore"),
                city=d.get("city", "Chennai"),
                is_festival_special=d.get("is_festival_special", False),
                festival_tag=d.get("festival_tag"),
                stock_quantity=d.get("stock_quantity", 20),
                rating=d.get("rating", 4.9),
                total_reviews=d.get("total_reviews", 1),
                reviews=[ProductReviewItem(**r) if isinstance(r, dict) else r for r in d.get("reviews", [])],
                created_at=d.get("created_at", "")
            )
            for d in docs
        ]

    async def get_product_by_id(self, product_id: str) -> ProductResponse:
        col = self._products_col()
        doc = await col.find_one(self._build_id_filter(product_id))
        if not doc:
            raise HTTPException(status_code=404, detail="Product not found in store")

        return ProductResponse(
            id=str(doc.get("_id")),
            seller_id=doc.get("seller_id", ""),
            seller_name=doc.get("seller_name", "Senior Artisan"),
            seller_locality=doc.get("seller_locality", "Mylapore"),
            seller_city=doc.get("seller_city", "Chennai"),
            seller_rating=doc.get("seller_rating", 4.9),
            is_age_verified=doc.get("is_age_verified", True),
            title=doc["title"],
            description=doc["description"],
            category=doc["category"],
            price=doc["price"],
            unit=doc.get("unit", "piece"),
            images=doc.get("images", ["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80"]),
            keywords=doc.get("keywords", []),
            locality=doc.get("locality", "Mylapore"),
            city=doc.get("city", "Chennai"),
            is_festival_special=doc.get("is_festival_special", False),
            festival_tag=doc.get("festival_tag"),
            stock_quantity=doc.get("stock_quantity", 20),
            rating=doc.get("rating", 4.9),
            total_reviews=doc.get("total_reviews", 1),
            reviews=[ProductReviewItem(**r) if isinstance(r, dict) else r for r in doc.get("reviews", [])],
            created_at=doc.get("created_at", "")
        )

    async def create_product(self, user_payload: Dict[str, Any], req: ProductCreateRequest) -> ProductResponse:
        user_id = user_payload.get("sub")
        col = self._products_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Default image presets if none supplied
        default_images = {
            "Food & Preserves": ["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80"],
            "Festive Sweets & Snacks": ["https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80"],
            "Handicrafts & Decor": ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80"],
            "Tailoring & Apparel": ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"],
            "Plants & Gardening": ["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80"],
            "Gifting": ["https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&auto=format&fit=crop&q=80"]
        }

        images = req.images if req.images and len(req.images) > 0 else default_images.get(req.category, default_images["Food & Preserves"])

        doc = {
            "seller_id": user_id,
            "seller_name": user_payload.get("full_name", "Senior Artisan"),
            "seller_locality": req.locality,
            "seller_city": req.city,
            "seller_rating": 5.0,
            "is_age_verified": True,
            "title": req.title,
            "description": req.description,
            "category": req.category,
            "price": req.price,
            "unit": req.unit,
            "images": images,
            "keywords": req.keywords,
            "locality": req.locality,
            "city": req.city,
            "is_festival_special": req.is_festival_special,
            "festival_tag": req.festival_tag,
            "stock_quantity": req.stock_quantity,
            "created_at": now
        }

        res = await col.insert_one(doc)
        doc["_id"] = str(res.inserted_id)

        return ProductResponse(
            id=str(doc["_id"]),
            seller_id=doc["seller_id"],
            seller_name=doc["seller_name"],
            seller_locality=doc["seller_locality"],
            seller_city=doc["seller_city"],
            seller_rating=doc["seller_rating"],
            is_age_verified=doc["is_age_verified"],
            title=doc["title"],
            description=doc["description"],
            category=doc["category"],
            price=doc["price"],
            unit=doc["unit"],
            images=doc["images"],
            keywords=doc["keywords"],
            locality=doc["locality"],
            city=doc["city"],
            is_festival_special=doc["is_festival_special"],
            festival_tag=doc["festival_tag"],
            stock_quantity=doc["stock_quantity"],
            created_at=now
        )

    async def suggest_product(self, req: AISuggestProductRequest) -> AISuggestProductResponse:
        res = await product_ai.generate_listing(req.raw_idea)
        return AISuggestProductResponse(
            title=res.get("title", "Authentic Handcrafted Local Specialty"),
            description=res.get("description", "Prepared with traditional care."),
            suggested_category=res.get("suggested_category", res.get("category", "Food & Preserves")),
            suggested_price=res.get("suggested_price", 350),
            keywords=res.get("keywords", ["Handmade", "Traditional"])
        )

    suggest_product_ai = suggest_product

    async def create_order(self, user_payload: Optional[Dict[str, Any]], req: OrderCreateRequest) -> OrderResponse:
        if not req.items:
            raise HTTPException(status_code=400, detail="Cannot create order with an empty cart")

        col = self._orders_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        order_num = f"SH-ORD-2026-{random.randint(1000, 9999)}"

        customer_id = user_payload.get("sub") if user_payload else "guest_customer"
        customer_name = req.delivery_name

        total_amount = sum(item.price_per_unit * item.quantity for item in req.items)

        order_doc = {
            "order_number": order_num,
            "customer_id": customer_id,
            "customer_name": customer_name,
            "customer_phone": req.delivery_phone,
            "items": [item.model_dump() for item in req.items],
            "total_amount": total_amount,
            "status": "pending",
            "delivery_address": req.delivery_address,
            "delivery_city": req.delivery_city,
            "delivery_locality": req.delivery_locality,
            "payment_method": req.payment_method,
            "payment_status": "paid",
            "special_notes": req.special_notes,
            "created_at": now,
            "updated_at": now
        }

        res = await col.insert_one(order_doc)
        order_doc["_id"] = str(res.inserted_id)

        return OrderResponse(
            id=str(order_doc["_id"]),
            order_number=order_doc["order_number"],
            customer_id=order_doc["customer_id"],
            customer_name=order_doc["customer_name"],
            customer_phone=order_doc["customer_phone"],
            items=req.items,
            total_amount=order_doc["total_amount"],
            status=order_doc["status"],
            delivery_address=order_doc["delivery_address"],
            delivery_city=order_doc["delivery_city"],
            delivery_locality=order_doc["delivery_locality"],
            payment_method=order_doc["payment_method"],
            payment_status=order_doc["payment_status"],
            special_notes=order_doc["special_notes"],
            created_at=order_doc["created_at"],
            updated_at=order_doc["updated_at"]
        )

    async def update_order_status(self, user_payload: Dict[str, Any], order_id: str, req: OrderStatusUpdateRequest) -> OrderResponse:
        col = self._orders_col()
        filter_q = self._build_id_filter(order_id)
        order_doc = await col.find_one(filter_q)
        if not order_doc:
            raise HTTPException(status_code=404, detail="Order not found")

        previous_status = order_doc.get("status", "pending")

        # Block invalid transitions
        if previous_status in ("completed", "cancelled"):
            raise HTTPException(status_code=400, detail=f"Cannot change status of {previous_status} order")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        await col.update_one(filter_q, {"$set": {"status": req.status, "updated_at": now}})
        order_doc["status"] = req.status
        order_doc["updated_at"] = now

        # Credit earnings ONLY on first completed transition (not from cancelled/completed)
        if req.status == "completed" and previous_status not in ("completed", "cancelled") and order_doc.get("items"):
            senior_id = order_doc["items"][0].get("seller_id")
            if senior_id:
                senior_col = self._senior_col()
                await senior_col.update_one(
                    {"user_id": senior_id},
                    {"$inc": {"earnings_total": order_doc["total_amount"], "completed_jobs_count": 1}}
                )

        return OrderResponse(
            id=str(order_doc.get("_id")),
            order_number=order_doc["order_number"],
            customer_id=order_doc["customer_id"],
            customer_name=order_doc["customer_name"],
            customer_phone=order_doc["customer_phone"],
            items=[OrderItem(**item) for item in order_doc["items"]],
            total_amount=order_doc["total_amount"],
            status=order_doc["status"],
            delivery_address=order_doc["delivery_address"],
            delivery_city=order_doc["delivery_city"],
            delivery_locality=order_doc["delivery_locality"],
            payment_method=order_doc["payment_method"],
            payment_status=order_doc["payment_status"],
            special_notes=order_doc.get("special_notes"),
            created_at=order_doc["created_at"],
            updated_at=order_doc["updated_at"]
        )

    async def get_customer_orders(self, user_payload: Dict[str, Any]) -> List[OrderResponse]:
        user_id = user_payload.get("sub")
        col = self._orders_col()
        cursor = col.find({"customer_id": user_id}).sort("created_at", -1)
        docs = await cursor.to_list(100)
        return [
            OrderResponse(
                id=str(d.get("_id")),
                order_number=d["order_number"],
                customer_id=d["customer_id"],
                customer_name=d["customer_name"],
                customer_phone=d["customer_phone"],
                items=[OrderItem(**item) for item in d["items"]],
                total_amount=d["total_amount"],
                status=d["status"],
                delivery_address=d["delivery_address"],
                delivery_city=d["delivery_city"],
                delivery_locality=d["delivery_locality"],
                payment_method=d["payment_method"],
                payment_status=d["payment_status"],
                special_notes=d.get("special_notes"),
                created_at=d["created_at"],
                updated_at=d["updated_at"]
            )
            for d in docs
        ]

    async def get_senior_orders(self, user_payload: Dict[str, Any]) -> List[OrderResponse]:
        user_id = user_payload.get("sub")
        col = self._orders_col()
        # Find orders where items contain this seller, or if none matched, return recent store orders
        cursor = col.find({"$or": [{"items.seller_id": user_id}, {"seller_id": user_id}]}).sort("created_at", -1)
        docs = await cursor.to_list(100)
        
        if not docs:
            # Return store orders for senior management
            cursor = col.find({}).sort("created_at", -1)
            docs = await cursor.to_list(50)

        return [
            OrderResponse(
                id=str(d.get("_id")),
                order_number=d["order_number"],
                customer_id=d["customer_id"],
                customer_name=d["customer_name"],
                customer_phone=d["customer_phone"],
                items=[OrderItem(**item) for item in d["items"]],
                total_amount=d["total_amount"],
                status=d["status"],
                delivery_address=d["delivery_address"],
                delivery_city=d["delivery_city"],
                delivery_locality=d["delivery_locality"],
                payment_method=d["payment_method"],
                payment_status=d["payment_status"],
                special_notes=d.get("special_notes"),
                created_at=d["created_at"],
                updated_at=d["updated_at"]
            )
            for d in docs
        ]

    async def submit_product_review(self, user_payload: Dict[str, Any], product_id: str, req: Any) -> ProductResponse:
        col = self._products_col()
        filter_q = self._build_id_filter(product_id)
        doc = await col.find_one(filter_q)
        if not doc:
            raise HTTPException(status_code=404, detail="Product not found")

        customer_id = user_payload.get("sub", "anonymous")
        customer_name = user_payload.get("full_name", "Customer")
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        current_rating = float(doc.get("rating", 4.9))
        current_count = int(doc.get("total_reviews", 1))

        new_count = current_count + 1
        new_avg_rating = round(((current_rating * current_count) + req.rating) / new_count, 2)

        new_review = {
            "customer_id": customer_id,
            "customer_name": customer_name,
            "rating": req.rating,
            "comment": req.comment,
            "created_at": now
        }

        await col.update_one(
            filter_q,
            {
                "$set": {"rating": new_avg_rating, "total_reviews": new_count, "seller_rating": new_avg_rating},
                "$push": {"reviews": new_review}
            }
        )

        doc["rating"] = new_avg_rating
        doc["total_reviews"] = new_count
        doc["seller_rating"] = new_avg_rating
        reviews = doc.get("reviews", [])
        reviews.append(new_review)
        doc["reviews"] = reviews

        return ProductResponse(
            id=str(doc.get("_id")),
            seller_id=doc.get("seller_id", ""),
            seller_name=doc.get("seller_name", "Senior Artisan"),
            seller_locality=doc.get("seller_locality", "Mylapore"),
            seller_city=doc.get("seller_city", "Chennai"),
            seller_rating=doc.get("seller_rating", 4.9),
            is_age_verified=doc.get("is_age_verified", True),
            title=doc["title"],
            description=doc["description"],
            category=doc["category"],
            price=doc["price"],
            unit=doc.get("unit", "piece"),
            images=doc.get("images", []),
            keywords=doc.get("keywords", []),
            locality=doc.get("locality", "Mylapore"),
            city=doc.get("city", "Chennai"),
            is_festival_special=doc.get("is_festival_special", False),
            festival_tag=doc.get("festival_tag"),
            stock_quantity=doc.get("stock_quantity", 20),
            rating=new_avg_rating,
            total_reviews=new_count,
            reviews=[ProductReviewItem(**r) if isinstance(r, dict) else r for r in reviews],
            created_at=doc.get("created_at", "")
        )

    async def cancel_order(self, user_payload: Dict[str, Any], order_id: str) -> OrderResponse:
        col = self._orders_col()
        filter_q = self._build_id_filter(order_id)
        doc = await col.find_one(filter_q)
        if not doc:
            raise HTTPException(status_code=404, detail="Order not found")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        await col.update_one(filter_q, {"$set": {"status": "cancelled", "updated_at": now}})
        doc["status"] = "cancelled"
        doc["updated_at"] = now

        return OrderResponse(
            id=str(doc.get("_id")),
            order_number=doc["order_number"],
            customer_id=doc["customer_id"],
            customer_name=doc["customer_name"],
            customer_phone=doc["customer_phone"],
            items=[OrderItem(**item) for item in doc["items"]],
            total_amount=doc["total_amount"],
            status=doc["status"],
            delivery_address=doc["delivery_address"],
            delivery_city=doc["delivery_city"],
            delivery_locality=doc["delivery_locality"],
            payment_method=doc["payment_method"],
            payment_status=doc["payment_status"],
            special_notes=doc.get("special_notes"),
            created_at=doc["created_at"],
            updated_at=doc["updated_at"]
        )

store_service = StoreService()
