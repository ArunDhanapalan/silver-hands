import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.seed_service import seed_initial_data

@pytest.mark.asyncio
async def test_managed_service_and_booking_lifecycle():
    await seed_initial_data()
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Test Public Services Catalog
        list_resp = await ac.get("/api/services")
        assert list_resp.status_code == 200
        services = list_resp.json()
        assert len(services) >= 2
        
        # Verify Reference Telugu Tuition exists
        telugu_service = next((s for s in services if "Telugu" in s["title"]), None)
        assert telugu_service is not None
        assert telugu_service["mode"] == "online"
        service_id = telugu_service["id"]

        # 2. Login as Ananya (Customer / Parent)
        ananya_login = await ac.post("/api/auth/login", json={
            "email": "ananya@silverhands.in",
            "password": "password123"
        })
        assert ananya_login.status_code == 200
        ananya_token = ananya_login.json()["access_token"]
        ananya_headers = {"Authorization": f"Bearer {ananya_token}"}

        # 3. Customer Requests Managed Booking
        booking_resp = await ac.post("/api/services/bookings", json={
            "service_id": service_id,
            "student_name": "Deepak Sharma",
            "student_age_group": "Child (Age 6-14)",
            "preferred_days": ["Monday", "Wednesday", "Friday"],
            "preferred_time_slot": "Evening (5:00 PM – 6:00 PM)",
            "sessions_count": 3,
            "special_goals": "Beginner conversation and alphabet recognition",
            "contact_phone": "+91 98840 56789"
        }, headers=ananya_headers)
        assert booking_resp.status_code == 201, booking_resp.text
        booking_data = booking_resp.json()
        assert booking_data["status"] == "requested"
        assert booking_data["total_amount"] == 1500 # 3 * 500
        booking_id = booking_data["id"]

        # 4. Login as Ramesh (Senior Guru)
        ramesh_login = await ac.post("/api/auth/login", json={
            "email": "ramesh@silverhands.in",
            "password": "password123"
        })
        assert ramesh_login.status_code == 200
        ramesh_token = ramesh_login.json()["access_token"]
        ramesh_headers = {"Authorization": f"Bearer {ramesh_token}"}

        # 5. Senior Views Session in Senior Sessions
        sr_sessions_resp = await ac.get("/api/services/bookings/senior-sessions", headers=ramesh_headers)
        assert sr_sessions_resp.status_code == 200
        assert any(b["id"] == booking_id for b in sr_sessions_resp.json())

        # 6. Senior Accepts and Generates Schedule & Video Meeting
        accept_resp = await ac.put(f"/api/services/bookings/{booking_id}/status", json={
            "status": "scheduled",
            "meeting_link": "https://meet.silverhands.in/telugu-lesson-7821"
        }, headers=ramesh_headers)
        assert accept_resp.status_code == 200
        assert accept_resp.json()["status"] == "scheduled"
        assert "meet.silverhands.in" in accept_resp.json()["meeting_link"]

        # 7. Complete Session
        comp_resp = await ac.put(f"/api/services/bookings/{booking_id}/status", json={
            "status": "completed"
        }, headers=ramesh_headers)
        assert comp_resp.status_code == 200
        assert comp_resp.json()["status"] == "completed"

        # 8. Customer Submits Review
        review_resp = await ac.post(f"/api/services/bookings/{booking_id}/review", json={
            "rating": 5,
            "comment": "Ramesh ji is an extraordinary teacher! My son learned Telugu phrases quickly."
        }, headers=ananya_headers)
        assert review_resp.status_code == 200
        assert review_resp.json()["review_rating"] == 5
