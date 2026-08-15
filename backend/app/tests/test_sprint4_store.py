import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.seed_service import seed_initial_data

@pytest.mark.asyncio
async def test_store_and_order_state_machine():
    await seed_initial_data()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Test Public Store Product Catalog (without auth)
        list_resp = await ac.get("/api/store/products?city=Chennai")
        assert list_resp.status_code == 200
        products = list_resp.json()
        assert len(products) >= 3
        
        # Test individual product retrieval
        first_prod = products[0]
        prod_id = first_prod["id"]
        detail_resp = await ac.get(f"/api/store/products/{prod_id}")
        assert detail_resp.status_code == 200
        assert detail_resp.json()["id"] == prod_id

        # 2. Login as Lakshmi (Senior Seller)
        lakshmi_login = await ac.post("/api/auth/login", json={
            "email": "lakshmi@silverhands.in",
            "password": "password123"
        })
        assert lakshmi_login.status_code == 200
        lakshmi_token = lakshmi_login.json()["access_token"]
        lakshmi_headers = {"Authorization": f"Bearer {lakshmi_token}"}

        # 3. Test Senior AI Product Suggestion
        ai_resp = await ac.post("/api/store/products/ai-suggest", json={
            "raw_idea": "homemade garlic and mango pickle"
        }, headers=lakshmi_headers)
        assert ai_resp.status_code == 200
        assert "title" in ai_resp.json()

        # 4. Test Senior Product Creation
        new_prod_resp = await ac.post("/api/store/products", json={
            "title": "Fresh Homemade Murukku & Mixture",
            "description": "Crispy festival snack made with freshly pressed sesame and roasted spices.",
            "category": "Festive Sweets & Snacks",
            "price": 220,
            "unit": "400g Box",
            "locality": "Mylapore",
            "city": "Chennai",
            "is_festival_special": True,
            "festival_tag": "Diwali"
        }, headers=lakshmi_headers)
        assert new_prod_resp.status_code == 201
        created_prod = new_prod_resp.json()
        assert created_prod["title"] == "Fresh Homemade Murukku & Mixture"

        # 5. Login as Ananya (Customer)
        ananya_login = await ac.post("/api/auth/login", json={
            "email": "ananya@silverhands.in",
            "password": "password123"
        })
        assert ananya_login.status_code == 200
        ananya_token = ananya_login.json()["access_token"]
        ananya_headers = {"Authorization": f"Bearer {ananya_token}"}

        # 6. Customer Places Order
        order_resp = await ac.post("/api/store/orders", json={
            "items": [
                {
                    "product_id": created_prod["id"],
                    "product_title": created_prod["title"],
                    "quantity": 2,
                    "price_per_unit": created_prod["price"],
                    "seller_id": created_prod["seller_id"],
                    "seller_name": created_prod["seller_name"]
                }
            ],
            "delivery_name": "Ananya Sharma",
            "delivery_phone": "+91 98840 56789",
            "delivery_address": "Flat 4B, Green Meadows, Gandhi Nagar",
            "delivery_city": "Chennai",
            "delivery_locality": "Adyar"
        }, headers=ananya_headers)
        assert order_resp.status_code == 201, order_resp.text
        order_data = order_resp.json()
        assert order_data["status"] == "pending"
        order_id = order_data["id"]

        # 7. Senior Views Incoming Order
        sr_orders_resp = await ac.get("/api/store/orders/senior-orders", headers=lakshmi_headers)
        assert sr_orders_resp.status_code == 200
        assert any(o["id"] == order_id for o in sr_orders_resp.json())

        # 8. Test State Machine Transitions: pending -> accepted -> preparing -> ready -> delivered
        status_sequence = ["accepted", "preparing", "ready", "delivered", "completed"]
        for next_st in status_sequence:
            up_resp = await ac.put(f"/api/store/orders/{order_id}/status", json={
                "status": next_st
            }, headers=lakshmi_headers)
            assert up_resp.status_code == 200
            assert up_resp.json()["status"] == next_st

        # 9. Verify Customer Order View reflects "completed"
        cust_orders_resp = await ac.get("/api/store/orders/my-orders", headers=ananya_headers)
        assert cust_orders_resp.status_code == 200
        completed_order = next(o for o in cust_orders_resp.json() if o["id"] == order_id)
        assert completed_order["status"] == "completed"
