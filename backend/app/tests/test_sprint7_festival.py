import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_festival_and_context_engine():
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Test Active Festival Endpoint
        resp = await ac.get("/api/festival/current?festival=Diwali")
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Diwali"
        assert data["icon"] == "🪔"
        assert "ta" in data["greeting"]
        assert data["surge_multiplier"] >= 1.2

        # 2. Test Pongal context
        pongal_resp = await ac.get("/api/festival/current?festival=Pongal")
        assert pongal_resp.status_code == 200
        pongal_data = pongal_resp.json()
        assert pongal_data["name"] == "Pongal / Makar Sankranti"
        assert "🌾" in pongal_data["icon"]

        # 3. Test Full Festival Calendar
        cal_resp = await ac.get("/api/festival/calendar")
        assert cal_resp.status_code == 200
        cal_data = cal_resp.json()
        assert len(cal_data["all_festivals"]) >= 6
