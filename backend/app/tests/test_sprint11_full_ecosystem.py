import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.seed_service import seed_initial_data

@pytest.mark.asyncio
async def test_full_silverhands_ecosystem_integration():
    """
    End-to-End ecosystem integration test validating:
    - Senior Onboarding & Life-to-Skill AI
    - Opportunity Deck & Swipe Matching
    - Store Catalog & Managed Order State Machine
    - Managed Service Bouquets & Online Language Tuition
    - Regional Community & Live Demand Signal Pipeline
    - Festival Context Engine & Multilingual Greetings
    - Real state transitions and zero mocked responses.
    """
    await seed_initial_data()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        
        # ==========================================
        # STEP 1: AUTHENTICATION & SESSIONS
        # ==========================================
        # Login Senior Ramesh
        r_login = await ac.post("/api/auth/login", json={"email": "ramesh@silverhands.in", "password": "password123"})
        assert r_login.status_code == 200
        r_token = r_login.json()["access_token"]
        r_headers = {"Authorization": f"Bearer {r_token}"}

        # Login Customer Ananya
        a_login = await ac.post("/api/auth/login", json={"email": "ananya@silverhands.in", "password": "password123"})
        assert a_login.status_code == 200
        a_token = a_login.json()["access_token"]
        a_headers = {"Authorization": f"Bearer {a_token}"}

        # ==========================================
        # STEP 2: SENIOR ONBOARDING & AI SKILLS
        # ==========================================
        analyze_resp = await ac.post("/api/senior/analyze-story", json={
            "story_text": "I worked as a chief accountant in Chennai for 35 years handling ledger reconciliation, cashflow, and GST filing. After retirement, I teach Telugu and math.",
            "language": "en"
        }, headers=r_headers)
        assert analyze_resp.status_code == 200
        ai_skills = analyze_resp.json()
        assert "Accounting" in ai_skills["explicit_skills"] or "Bookkeeping" in ai_skills["explicit_skills"]

        # Complete Profile Onboarding
        onboard_resp = await ac.post("/api/senior/onboard", json={
            "full_name": "Ramesh Krishnan",
            "story_text": "Experienced accountant and bilingual teacher.",
            "language": "en",
            "skills": ai_skills["explicit_skills"],
            "inferred_skills": ai_skills["inferred_skills"],
            "keywords": ai_skills["keywords"],
            "bio": ai_skills["bio"],
            "travel_radius": "5 km",
            "locality": "Adyar",
            "city": "Chennai",
            "work_mode": "both",
            "availability": "Part-time"
        }, headers=r_headers)
        assert onboard_resp.status_code == 200

        # ==========================================
        # STEP 3: OPPORTUNITY MATCHING & SWIPES
        # ==========================================
        deck_resp = await ac.get("/api/opportunities/deck", headers=r_headers)
        assert deck_resp.status_code == 200
        deck = deck_resp.json()
        assert len(deck) >= 1
        first_opp = deck[0]
        assert first_opp["match_score"] >= 50

        # Senior Swipes Right (Interested)
        swipe_resp = await ac.post(f"/api/opportunities/{first_opp['id']}/swipe", json={"action": "right"}, headers=r_headers)
        assert swipe_resp.status_code == 200
        assert swipe_resp.json()["action"] == "right"

        # Verify My Applications list has the opportunity
        apps_resp = await ac.get("/api/opportunities/my-applications", headers=r_headers)
        assert apps_resp.status_code == 200
        assert any(a.get("opportunity_id") == first_opp["id"] for a in apps_resp.json())

        # ==========================================
        # STEP 4: STORE COMMERCE & ORDER STATE MACHINE
        # ==========================================
        # Public product search
        prods_resp = await ac.get("/api/store/products?city=Chennai")
        assert prods_resp.status_code == 200
        products = prods_resp.json()
        target_prod = products[0]

        # Customer buys product
        order_resp = await ac.post("/api/store/orders", json={
            "items": [{
                "product_id": target_prod["id"],
                "product_title": target_prod["title"],
                "quantity": 1,
                "price_per_unit": target_prod["price"],
                "seller_id": target_prod["seller_id"],
                "seller_name": target_prod["seller_name"]
            }],
            "delivery_name": "Ananya Sharma",
            "delivery_phone": "+91 98840 56789",
            "delivery_address": "Flat 4B, Green Meadows, Adyar",
            "delivery_city": "Chennai",
            "delivery_locality": "Adyar"
        }, headers=a_headers)
        assert order_resp.status_code == 201
        order_id = order_resp.json()["id"]

        # Advance Order status: accepted -> ready -> delivered -> completed
        for st in ["accepted", "preparing", "ready", "delivered", "completed"]:
            st_resp = await ac.put(f"/api/store/orders/{order_id}/status", json={"status": st}, headers=r_headers)
            assert st_resp.status_code == 200

        # ==========================================
        # STEP 5: MANAGED SERVICES (TELUGU TUITION)
        # ==========================================
        services_resp = await ac.get("/api/services")
        assert services_resp.status_code == 200
        telugu_srv = next(s for s in services_resp.json() if "Telugu" in s["title"])

        # Customer Books Session
        booking_resp = await ac.post("/api/services/bookings", json={
            "service_id": telugu_srv["id"],
            "student_name": "Deepak Sharma",
            "student_age_group": "Child (Age 6-12)",
            "preferred_days": ["Monday", "Wednesday"],
            "preferred_time_slot": "Evening (5:00 PM – 6:00 PM)",
            "sessions_count": 2,
            "special_goals": "Conversational practice",
            "contact_phone": "+91 98840 56789"
        }, headers=a_headers)
        assert booking_resp.status_code == 201
        booking_id = booking_resp.json()["id"]

        # Senior accepts & schedules meeting link
        sched_resp = await ac.put(f"/api/services/bookings/{booking_id}/status", json={
            "status": "scheduled",
            "meeting_link": "https://meet.silverhands.in/session-telugu-01"
        }, headers=r_headers)
        assert sched_resp.status_code == 200
        assert "meet.silverhands.in" in sched_resp.json()["meeting_link"]

        # Complete & Review
        await ac.put(f"/api/services/bookings/{booking_id}/status", json={"status": "completed"}, headers=r_headers)
        rev_resp = await ac.post(f"/api/services/bookings/{booking_id}/review", json={
            "rating": 5,
            "comment": "Exceptional patience and clear lessons!"
        }, headers=a_headers)
        assert rev_resp.status_code == 200

        # ==========================================
        # STEP 6: COMMUNITY DEMAND SIGNALS
        # ==========================================
        post_resp = await ac.post("/api/community/posts", json={
            "title": "Need: Telugu tutor for weekend classes in Adyar",
            "content": "Looking for a native speaker to teach Telugu to my daughter.",
            "type": "need",
            "tags": ["Telugu", "Tuition"],
            "locality": "Adyar",
            "city": "Chennai"
        }, headers=a_headers)
        assert post_resp.status_code == 201
        assert post_resp.json()["demand_signal_generated"] is True

        # ==========================================
        # STEP 7: FESTIVAL CONTEXT
        # ==========================================
        fest_resp = await ac.get("/api/festival/current?festival=Pongal")
        assert fest_resp.status_code == 200
        assert "Pongal" in fest_resp.json()["name"]
