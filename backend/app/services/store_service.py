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
    OrderItem,
    OrderCreateRequest,
    OrderResponse,
    OrderStatusUpdateRequest,
    AISuggestProductRequest,
    AISuggestProductResponse
)

logger = logging.getLogger("silverhands.store_service")

class StoreService:
    def _products_col(self):
        return db_manager.get_collection("products")

    def _orders_col(self):
        return db_manager.get_collection("orders")

    def _senior_col(self):
        return db_manager.get_collection("senior_profiles")

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

        if locality and locality.lower() != "all areas":
            filter_doc["locality"] = locality

        if festival:
            filter_doc["festival_tag"] = festival

        if max_price:
            filter_doc["price"] = {"$lte": max_price}

        if search and search.strip():
            filter_doc["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"keywords": {"$regex": search, "$options": "i"}}
            ]

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
                created_at=d.get("created_at", "")
            )
            for d in docs
        ]

    async def get_product_by_id(self, product_id: str) -> ProductResponse:
        col = self._products_col()
        doc = await col.find_one({"_id": product_id})
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
            images=doc.get("images", []),
            keywords=doc.get("keywords", []),
            locality=doc.get("locality", "Mylapore"),
            city=doc.get("city", "Chennai"),
            is_festival_special=doc.get("is_festival_special", False),
            festival_tag=doc.get("festival_tag"),
            stock_quantity=doc.get("stock_quantity", 20),
            created_at=doc.get("created_at", "")
        )

    async def create_product(self, user_payload: Dict[str, Any], req: ProductCreateRequest) -> ProductResponse:
        user_id = user_payload.get("sub")
        col = self._products_col()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Fallback image if none provided
        default_images = {
            "Food & Preserves": ["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80"],
            "Festive Sweets & Snacks": ["https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80"],
            "Handicrafts & Decor": ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80"],
            "Tailoring & Apparel": ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"],
            "Plants & Gardening": ["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80"],
            "Gifting": ["https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&auto=format&fit=crop&q=80"]
        }

        images = req.images if req.images else default_images.get(req.category, default_images["Food & Preserves"])

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
            created_at=doc["created_at"]
        )

    async def suggest_product_ai(self, req: AISuggestProductRequest) -> AISuggestProductResponse:
        idea = req.raw_idea.lower()
        if "sweet" in idea or "mysore pak" in idea or "laddu" in idea or "diwali" in idea:
            return AISuggestProductResponse(
                title="Traditional Handcrafted Diwali Sweets Box",
                description="Melt-in-mouth festival sweets prepared in small home batches with pure cow ghee and family recipes.",
                suggested_category="Festive Sweets & Snacks",
                suggested_price=450,
                keywords=["Diwali Sweets", "Pure Ghee", "Festival Gift Box", "Traditional Food"]
            )
        elif "pickle" in idea or "podi" in idea or "cook" in idea:
            return AISuggestProductResponse(
                title="Homemade Sun-Dried Mango & Garlic Pickle",
                description="Small-batch traditional sun-cured pickle made with cold-pressed sesame oil and roasted mustard.",
                suggested_category="Food & Preserves",
                suggested_price=280,
                keywords=["Mango Pickle", "Homemade Preserves", "Cold Pressed Oil", "South Indian"]
            )
        elif "stitch" in idea or "blouse" in idea or "tailor" in idea or "embroidery" in idea:
            return AISuggestProductResponse(
                title="Custom Tailored Saree Blouse with Festive Embroidery",
                description="Bespoke fitted saree blouse tailored to precise measurements with elegant sleeve zari finishing.",
                suggested_category="Tailoring & Apparel",
                suggested_price=1200,
                keywords=["Custom Tailoring", "Saree Blouse", "Embroidery", "Festive Wear"]
            )
        else:
            return AISuggestProductResponse(
                title="Handcrafted Authentic Heritage Goods",
                description="Locally made traditional item prepared with care and high quality natural ingredients.",
                suggested_category="Handicrafts & Decor",
                suggested_price=350,
                keywords=["Handmade", "Traditional", "Local Artisan"]
            )

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
        order_doc = await col.find_one({"_id": order_id})
        if not order_doc:
            raise HTTPException(status_code=404, detail="Order not found")

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        await col.update_one({"_id": order_id}, {"$set": {"status": req.status, "updated_at": now}})
        order_doc["status"] = req.status
        order_doc["updated_at"] = now

        # If completed, increment senior earnings
        if req.status == "completed":
            senior_id = order_doc["items"][0]["seller_id"]
            senior_col = self._senior_col()
            await senior_col.update_one(
                {"user_id": senior_id},
                {"$inc": {"earnings_total": order_doc["total_amount"], "completed_jobs_count": 1}}
            )

        return OrderResponse(
            id=str(order_doc["_id"]),
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
        # Find orders where seller_id matches user_id
        cursor = col.find({"items.seller_id": user_id}).sort("created_at", -1)
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

store_service = StoreService()
