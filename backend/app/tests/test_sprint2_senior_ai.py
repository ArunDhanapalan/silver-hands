import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.seed_service import seed_initial_data

@pytest.mark.asyncio
async def test_life_to_skill_ai_and_onboarding():
    await seed_initial_data()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Test Story Analysis Endpoint (Accounting Story in Tamil/English)
        analysis_resp = await ac.post("/api/senior/analyze-story", json={
            "story_text": "Naan 35 varusham accountant-aa work pannirukken. Small businesses-ku accounts maintain pannirukken. Excel, GST basics theriyum. Juniors-ku accounting teach pannirukken.",
            "language": "ta"
        })
        assert analysis_resp.status_code == 200, analysis_resp.text
        data = analysis_resp.json()
        assert "explicit_skills" in data
        assert len(data["explicit_skills"]) > 0
        assert any("Accounting" in s or "Bookkeeping" in s or "Excel" in s for s in data["explicit_skills"])
        assert "inferred_skills" in data
        assert len(data["inferred_skills"]) > 0
        assert "reason" in data["inferred_skills"][0]
        assert "bio" in data
        assert len(data["bio"]) > 10

        # 2. Test Story Analysis for Cooking Story
        cook_analysis = await ac.post("/api/senior/analyze-story", json={
            "story_text": "I make homemade mango pickle and podi using authentic traditional recipes from my family for 40 years.",
            "language": "en"
        })
        assert cook_analysis.status_code == 200
        cook_data = cook_analysis.json()
        assert any("Cooking" in s or "Pickle" in s for s in cook_data["explicit_skills"])

        # 3. Login as Ramesh (Senior)
        login_resp = await ac.post("/api/auth/login", json={
            "email": "ramesh@silverhands.in",
            "password": "password123"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 4. Save Onboarding Profile
        onboard_resp = await ac.post("/api/senior/onboard", json={
            "story_text": "35 years accounting and financial mentoring for local businesses.",
            "language": "ta",
            "skills": ["Accounting", "Excel", "GST Basics", "Small Business Support"],
            "inferred_skills": [
                {"skill": "Small Business Advisory", "reason": "Derived from 35 years maintaining accounts for local MSMEs."}
            ],
            "keywords": ["Accounting", "Excel", "GST", "Mentoring"],
            "bio": "Retired Chief Accountant offering 35 years of practical financial wisdom and tutoring.",
            "travel_radius": "5 km",
            "locality": "Adyar",
            "city": "Chennai",
            "work_mode": "both",
            "availability": "Evenings (4 PM – 8 PM)"
        }, headers=headers)
        assert onboard_resp.status_code == 200, onboard_resp.text
        onboard_data = onboard_resp.json()
        assert onboard_data["travel_radius"] == "5 km"
        assert onboard_data["locality"] == "Adyar"

        # 5. Fetch Profile
        prof_resp = await ac.get("/api/senior/profile", headers=headers)
        assert prof_resp.status_code == 200
        prof_data = prof_resp.json()
        assert prof_data["skills"] == ["Accounting", "Excel", "GST Basics", "Small Business Support"]
        assert prof_data["is_age_verified"] is True
