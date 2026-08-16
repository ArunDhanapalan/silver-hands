from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from app.schemas.store import (
    ProductCreateRequest,
    ProductResponse,
    OrderCreateRequest,
    OrderResponse,
    OrderStatusUpdateRequest,
    AISuggestProductRequest,
    AISuggestProductResponse
)
from app.services.store_service import store_service
from app.security import get_current_user, require_role, security_bearer

router = APIRouter(prefix="/store", tags=["Store & Commerce Marketplace"])

@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    city: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    locality: Optional[str] = Query(None),
    festival: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    max_price: Optional[int] = Query(None)
):
    """
    Public discovery of authentic local products across cities and categories.
    """
    return await store_service.list_products(
        city=city,
        category=category,
        locality=locality,
        festival=festival,
        search=search,
        max_price=max_price
    )

@router.get("/my-products", response_model=List[ProductResponse])
async def get_my_products(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior seller lists all products they have published in store.
    """
    return await store_service.get_senior_products(current_user)

@router.get("/products/{id}", response_model=ProductResponse)
async def get_product(id: str):
    """
    Public product detail endpoint.
    """
    return await store_service.get_product_by_id(id)

@router.delete("/products/{id}")
async def delete_product(
    id: str,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior seller deletes a product from store.
    """
    return await store_service.delete_product(current_user, id)

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    req: ProductCreateRequest,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior seller product creation.
    """
    return await store_service.create_product(current_user, req)

@router.post("/products/ai-suggest", response_model=AISuggestProductResponse)
async def suggest_product(req: AISuggestProductRequest):
    """
    AI title, description, category, and pricing generator for seniors.
    """
    return await store_service.suggest_product_ai(req)

@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    req: OrderCreateRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    Customer creates a local commerce order.
    """
    return await store_service.create_order(current_user, req)

@router.get("/orders/my-orders", response_model=List[OrderResponse])
async def get_my_orders(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Customer views their active and past orders with live tracking.
    """
    return await store_service.get_customer_orders(current_user)

@router.get("/orders/senior-orders", response_model=List[OrderResponse])
async def get_senior_orders(
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior seller views incoming orders to fulfill.
    """
    return await store_service.get_senior_orders(current_user)

@router.put("/orders/{id}/status", response_model=OrderResponse)
async def update_order_status(
    id: str,
    req: OrderStatusUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_role(["senior"]))
):
    """
    Senior updates order state machine: pending -> accepted -> preparing -> ready -> delivered -> completed.
    """
    return await store_service.update_order_status(current_user, id, req)

@router.put("/orders/{id}/cancel", response_model=OrderResponse)
async def cancel_order(
    id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Customer or Senior cancels an order.
    """
    return await store_service.cancel_order(current_user, id)

@router.post("/products/{id}/review", response_model=ProductResponse)
async def review_product(
    id: str,
    req: Any,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Customer submits rating and review for a purchased product.
    """
    return await store_service.submit_product_review(current_user, id, req)
