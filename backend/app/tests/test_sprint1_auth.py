import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.seed_service import seed_initial_data

@pytest.mark.asyncio
async def test_auth_and_roles():
    await seed_initial_data()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Test Seed User Login (Ramesh - Senior)
        resp = await ac.post("/api/auth/login", json={
            "email": "ramesh@silverhands.in",
            "password": "password123"
        })
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "senior"
        assert data["user"]["is_age_verified"] is True
        token = data["access_token"]

        # 2. Test /api/auth/me with Bearer token
        me_resp = await ac.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == "ramesh@silverhands.in"
        assert me_data["role"] == "senior"

        # 3. Test Seed Company Login (TechLocal)
        comp_resp = await ac.post("/api/auth/login", json={
            "email": "techlocal@silverhands.in",
            "password": "password123"
        })
        assert comp_resp.status_code == 200
        comp_data = comp_resp.json()
        assert comp_data["user"]["role"] == "company"
        assert comp_data["user"]["gstin"] == "33AAAAA0000A1Z5"

        # 4. Test New Registration with GSTIN for Company
        new_comp_resp = await ac.post("/api/auth/register", json={
            "email": "newco@silverhands.in",
            "password": "password123",
            "full_name": "New Local Enterprise",
            "role": "company",
            "gstin": "33BBBBB1111B2Z6",
            "city": "Chennai",
            "locality": "Velachery"
        })
        assert new_comp_resp.status_code == 201
        assert new_comp_resp.json()["user"]["role"] == "company"

        # 5. Test Company Registration without GSTIN (must fail)
        fail_comp_resp = await ac.post("/api/auth/register", json={
            "email": "failco@silverhands.in",
            "password": "password123",
            "full_name": "Fail Company",
            "role": "company",
            "city": "Chennai"
        })
        assert fail_comp_resp.status_code == 400

        # 6. Test Invalid Password Login
        bad_login = await ac.post("/api/auth/login", json={
            "email": "ramesh@silverhands.in",
            "password": "wrongpassword"
        })
        assert bad_login.status_code == 401
