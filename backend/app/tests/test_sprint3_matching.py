import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.seed_service import seed_initial_data

@pytest.mark.asyncio
async def test_opportunity_deck_and_matching():
    await seed_initial_data()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login as Ramesh (Senior)
        login_resp = await ac.post("/api/auth/login", json={
            "email": "ramesh@silverhands.in",
            "password": "password123"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get Matched Deck
        deck_resp = await ac.get("/api/opportunities/deck", headers=headers)
        assert deck_resp.status_code == 200, deck_resp.text
        deck = deck_resp.json()
        assert len(deck) > 0
        
        # Check first card matching
        first_opp = deck[0]
        assert "match_score" in first_opp
        assert first_opp["match_score"] >= 40
        assert "match_explanation" in first_opp
        assert len(first_opp["match_explanation"]) > 5
        opp_id = first_opp["id"]

        # 3. Swipe Right (Interested)
        swipe_resp = await ac.post(f"/api/opportunities/{opp_id}/swipe", json={
            "action": "interested"
        }, headers=headers)
        assert swipe_resp.status_code == 200
        assert swipe_resp.json()["success"] is True

        # 4. Verify Active Applications reflects the swiped card
        apps_resp = await ac.get("/api/opportunities/my-applications", headers=headers)
        assert apps_resp.status_code == 200
        apps = apps_resp.json()
        assert len(apps) >= 1
        assert any(a["opportunity_id"] == opp_id for a in apps)

        # 5. Check that the swiped card is no longer in the deck
        new_deck_resp = await ac.get("/api/opportunities/deck", headers=headers)
        new_deck = new_deck_resp.json()
        assert not any(o["id"] == opp_id for o in new_deck)
