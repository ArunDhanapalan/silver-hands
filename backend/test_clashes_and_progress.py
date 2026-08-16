import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
import pytest
from fastapi.testclient import TestClient

backend_dir = r"c:\Users\arund\Desktop\SilverHands\backend"
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.security import create_access_token

client = TestClient(app)

def test_clashes_and_progress():
    print("\n=== 1. Testing Senior Slot Clash Prevention ===")
    senior_id = "user_clash_senior_99"
    senior_token = create_access_token({"sub": senior_id, "role": "senior", "full_name": "Guru Clash Senior", "email": "guruclash@silverhands.in"})
    senior_headers = {"Authorization": f"Bearer {senior_token}"}
    
    # Class 1 on Mon, Wed, Fri at Morning 9-10 AM
    srv1_payload = {
        "title": "Yoga for Seniors & Beginners",
        "category": "Health & Wellness",
        "subcategory": "Yoga",
        "description": "Gentle daily asanas and pranayama.",
        "mode": "online",
        "duration_mins": 60,
        "price_per_session": 300,
        "languages": ["en", "hi"],
        "target_audience": "All Ages",
        "available_days": ["Monday", "Wednesday", "Friday"],
        "time_slot": "Morning (9:00 AM – 10:00 AM)",
        "locality": "Indiranagar",
        "city": "Bengaluru"
    }
    r1 = client.post("/api/services", json=srv1_payload, headers=senior_headers)
    assert r1.status_code == 201, f"Class 1 failed: {r1.text}"
    srv1_id = r1.json()["id"]

    # Class 2 by same senior on Friday at same Morning 9-10 AM -> MUST CLASH & REJECT
    srv2_payload = {
        "title": "Pranayama Deep Breathing Workshop",
        "category": "Health & Wellness",
        "subcategory": "Breathwork",
        "description": "Deep breathing workshop.",
        "mode": "online",
        "duration_mins": 60,
        "price_per_session": 350,
        "languages": ["en"],
        "target_audience": "All Ages",
        "available_days": ["Friday", "Sunday"],
        "time_slot": "Morning (9:00 AM – 10:00 AM)",
        "locality": "Indiranagar",
        "city": "Bengaluru"
    }
    r2 = client.post("/api/services", json=srv2_payload, headers=senior_headers)
    assert r2.status_code == 400, f"Expected 400 clash error, got {r2.status_code}: {r2.text}"
    print(f"Correctly caught Senior slot clash: {r2.json()['detail']}")

    print("\n=== 2. Testing Student Slot Clash Prevention ===")
    cust_id = "user_student_clash_test"
    cust_token = create_access_token({"sub": cust_id, "role": "customer", "full_name": "Clash Learner", "email": "clashlearner@gmail.com"})
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    # Student books Class 1
    b1_payload = {
        "service_id": srv1_id,
        "student_name": "Little Anand",
        "student_age_group": "Child (Age 6-12)",
        "preferred_days": ["Monday", "Wednesday", "Friday"],
        "preferred_time_slot": "Morning (9:00 AM – 10:00 AM)",
        "sessions_count": 3,
        "contact_phone": "+91 99887 76655"
    }
    b1_resp = client.post("/api/services/bookings", json=b1_payload, headers=cust_headers)
    assert b1_resp.status_code == 201, f"Booking 1 failed: {b1_resp.text}"
    booking1_id = b1_resp.json()["id"]

    # Another senior creates a music class on Mon at Morning 9-10 AM
    other_senior_token = create_access_token({"sub": "user_other_guru", "role": "senior", "full_name": "Music Guru", "email": "music@silverhands.in"})
    music_srv = client.post("/api/services", json={
        "title": "Violin Basics",
        "category": "Culture & Tradition",
        "subcategory": "Music",
        "description": "Violin basics",
        "mode": "online",
        "duration_mins": 45,
        "price_per_session": 400,
        "languages": ["en"],
        "target_audience": "Beginners",
        "available_days": ["Monday"],
        "time_slot": "Morning (9:00 AM – 10:00 AM)",
        "locality": "Indiranagar",
        "city": "Bengaluru"
    }, headers={"Authorization": f"Bearer {other_senior_token}"}).json()

    # Same student tries to book Music class overlapping on Monday Morning 9-10 AM -> MUST CLASH
    b2_resp = client.post("/api/services/bookings", json={
        "service_id": music_srv["id"],
        "student_name": "Little Anand",
        "student_age_group": "Child (Age 6-12)",
        "preferred_days": ["Monday"],
        "preferred_time_slot": "Morning (9:00 AM – 10:00 AM)",
        "sessions_count": 1,
        "contact_phone": "+91 99887 76655"
    }, headers=cust_headers)
    assert b2_resp.status_code == 400, f"Expected 400 clash for student, got {b2_resp.status_code}: {b2_resp.text}"
    print(f"Correctly caught Student slot clash: {b2_resp.json()['detail']}")

    print("\n=== 3. Testing Stepwise Multi-Class Session Tracking (1/3, 2/3, 3/3) ===")
    # Accept student first
    client.put(f"/api/services/bookings/{booking1_id}/status", json={"status": "accepted"}, headers=senior_headers)
    
    # Senior marks session 1 done
    p1 = client.put(f"/api/services/bookings/{booking1_id}/progress", json={"completed_sessions": 1}, headers=senior_headers)
    assert p1.status_code == 200
    assert p1.json()["completed_sessions_count"] == 1
    assert p1.json()["status"] == "in_progress"
    print(f"Session 1 marked done: Status={p1.json()['status']}, Conducted={p1.json()['completed_sessions_count']}/3")

    # Senior marks session 2 done
    p2 = client.put(f"/api/services/bookings/{booking1_id}/progress", json={"completed_sessions": 2}, headers=senior_headers)
    assert p2.status_code == 200
    assert p2.json()["completed_sessions_count"] == 2
    assert p2.json()["status"] == "in_progress"

    # Senior marks session 3 done -> reaches 3/3, automatically completed and settled
    p3 = client.put(f"/api/services/bookings/{booking1_id}/progress", json={"completed_sessions": 3}, headers=senior_headers)
    assert p3.status_code == 200
    assert p3.json()["completed_sessions_count"] == 3
    assert p3.json()["status"] == "completed"
    print(f"Session 3 marked done: Status={p3.json()['status']}, Conducted={p3.json()['completed_sessions_count']}/3 (Auto Settled!)")

    print("\n=== 4. Testing Customer Order Cancellation ===")
    order_resp = client.post("/api/store/orders", json={
        "items": [{
            "product_id": "dummy_prod_id",
            "product_title": "Mysore Pak Box",
            "seller_id": senior_id,
            "seller_name": "Guru Clash Senior",
            "price_per_unit": 250,
            "quantity": 2
        }],
        "delivery_name": "Test Cust",
        "delivery_phone": "+91 98840 11223",
        "delivery_address": "Flat 2A, MG Road",
        "delivery_city": "Bengaluru",
        "delivery_locality": "Indiranagar",
        "payment_method": "Cash on Delivery"
    }, headers=cust_headers)
    assert order_resp.status_code == 201
    ord_id = order_resp.json()["id"]

    # Cancel order
    cancel_resp = client.put(f"/api/store/orders/{ord_id}/cancel", json={}, headers=cust_headers)
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"
    print(f"Order {cancel_resp.json()['order_number']} successfully cancelled by customer!")

    print("\n=== ALL CLASH, PROGRESS & CANCEL TESTS PASSED 100% ===")

if __name__ == "__main__":
    test_clashes_and_progress()
