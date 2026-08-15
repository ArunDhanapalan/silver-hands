import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.seed_service import seed_initial_data

@pytest.mark.asyncio
async def test_community_feed_and_collaboration():
    await seed_initial_data()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Test Public Community Posts Feed
        posts_resp = await ac.get("/api/community/posts?city=Chennai")
        assert posts_resp.status_code == 200
        posts = posts_resp.json()
        assert len(posts) >= 3

        # 2. Login as Customer (Ananya)
        ananya_login = await ac.post("/api/auth/login", json={
            "email": "ananya@silverhands.in",
            "password": "password123"
        })
        assert ananya_login.status_code == 200
        ananya_token = ananya_login.json()["access_token"]
        ananya_headers = {"Authorization": f"Bearer {ananya_token}"}

        # 3. Create a "Need" post (triggers Demand Signal extraction)
        new_post_resp = await ac.post("/api/community/posts", json={
            "title": "Need: Senior accountant to review GST and ledger for local bakery",
            "content": "Looking for a retired accounting professional in Adyar to guide our bookkeeper twice a week.",
            "type": "need",
            "tags": ["Accounting", "GST", "Adyar"],
            "locality": "Adyar",
            "city": "Chennai"
        }, headers=ananya_headers)
        assert new_post_resp.status_code == 201
        post_data = new_post_resp.json()
        assert post_data["demand_signal_generated"] is True
        assert "Accounting" in post_data["matched_skills"]
        post_id = post_data["id"]

        # 4. Add a comment to the post
        comment_resp = await ac.post(f"/api/community/posts/{post_id}/comments", json={
            "content": "I can assist with MSME bookkeeping and GST filings!"
        }, headers=ananya_headers)
        assert comment_resp.status_code == 201
        assert comment_resp.json()["content"] == "I can assist with MSME bookkeeping and GST filings!"

        # 5. Login as Senior (Ramesh)
        ramesh_login = await ac.post("/api/auth/login", json={
            "email": "ramesh@silverhands.in",
            "password": "password123"
        })
        assert ramesh_login.status_code == 200
        ramesh_token = ramesh_login.json()["access_token"]
        ramesh_headers = {"Authorization": f"Bearer {ramesh_token}"}

        # 6. Test Senior-to-Senior Skill Complement Matches (Ramesh + Lakshmi)
        collab_resp = await ac.get("/api/community/collaborations", headers=ramesh_headers)
        assert collab_resp.status_code == 200
        collabs = collab_resp.json()
        assert len(collabs) >= 1
        first_collab = collabs[0]
        assert "Lakshmi" in first_collab["senior_b_name"] or "Ramesh" in first_collab["senior_a_name"]

        # 7. Connect Collaboration
        connect_resp = await ac.post("/api/community/collaborations/connect", json={
            "target_senior_id": first_collab["senior_b_id"],
            "venture_title": first_collab["venture_title"]
        }, headers=ramesh_headers)
        assert connect_resp.status_code == 200
        assert connect_resp.json()["success"] is True
