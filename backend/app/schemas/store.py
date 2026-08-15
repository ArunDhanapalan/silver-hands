from typing import Optional, List
from pydantic import BaseModel, Field

class ProductCreateRequest(BaseModel):
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=10)
    category: str = "Food & Preserves"
    price: int = Field(..., gt=0)
    unit: str = "item" # jar, box, piece, kg, pair
    images: List[str] = []
    keywords: List[str] = []
    locality: str = "Mylapore"
    city: str = "Chennai"
    is_festival_special: bool = False
    festival_tag: Optional[str] = None
    stock_quantity: int = 20

class ProductResponse(BaseModel):
    id: str
    seller_id: str
    seller_name: str
    seller_locality: str
    seller_city: str
    seller_rating: float = 4.9
    is_age_verified: bool = True
    title: str
    description: str
    category: str
    price: int
    unit: str
    images: List[str]
    keywords: List[str]
    locality: str
    city: str
    is_festival_special: bool = False
    festival_tag: Optional[str] = None
    stock_quantity: int = 20
    created_at: str

class OrderItem(BaseModel):
    product_id: str
    product_title: str
    quantity: int = 1
    price_per_unit: int
    seller_id: str
    seller_name: str

class OrderCreateRequest(BaseModel):
    items: List[OrderItem]
    delivery_name: str
    delivery_phone: str
    delivery_address: str
    delivery_city: str = "Chennai"
    delivery_locality: str = "Adyar"
    payment_method: str = "UPI / Cash on Delivery"
    special_notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_number: str
    customer_id: str
    customer_name: str
    customer_phone: str
    items: List[OrderItem]
    total_amount: int
    status: str # pending, accepted, preparing, ready, delivered, completed, cancelled
    delivery_address: str
    delivery_city: str
    delivery_locality: str
    payment_method: str
    payment_status: str = "paid"
    special_notes: Optional[str] = None
    created_at: str
    updated_at: str

class OrderStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(accepted|preparing|ready|delivered|completed|cancelled)$")

class AISuggestProductRequest(BaseModel):
    raw_idea: str
    category: Optional[str] = None
    language: str = "en"

class AISuggestProductResponse(BaseModel):
    title: str
    description: str
    suggested_category: str
    suggested_price: int
    keywords: List[str]
