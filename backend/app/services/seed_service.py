import logging
import datetime
from app.database import db_manager
from app.security import hash_password

logger = logging.getLogger("silverhands.seed")

async def seed_initial_data():
    users_col = db_manager.get_collection("users")
    user_count = await users_col.count_documents({})
    if user_count > 0:
        logger.info("Database already contains %d users. Skipping re-seed.", user_count)
        return

    logger.info("Seeding initial SilverHands 2.0 demo ecosystem data...")
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    hashed_pwd = hash_password("password123")

    # 1. Users
    ramesh_id = "user_ramesh_01"
    lakshmi_id = "user_lakshmi_02"
    meena_id = "user_meena_03"
    techlocal_id = "user_techlocal_04"
    ananya_id = "user_ananya_05"
    karthik_id = "user_karthik_06"

    users = [
        {
            "_id": ramesh_id,
            "email": "ramesh@silverhands.in",
            "hashed_password": hashed_pwd,
            "full_name": "Ramesh Krishnan",
            "role": "senior",
            "phone": "+91 98401 23456",
            "city": "Chennai",
            "locality": "Adyar",
            "is_age_verified": True,
            "created_at": now
        },
        {
            "_id": lakshmi_id,
            "email": "lakshmi@silverhands.in",
            "hashed_password": hashed_pwd,
            "full_name": "Lakshmi Venkatesh",
            "role": "senior",
            "phone": "+91 98402 34567",
            "city": "Chennai",
            "locality": "Mylapore",
            "is_age_verified": True,
            "created_at": now
        },
        {
            "_id": meena_id,
            "email": "meena@silverhands.in",
            "hashed_password": hashed_pwd,
            "full_name": "Meena Sundaram",
            "role": "senior",
            "phone": "+91 98403 45678",
            "city": "Chennai",
            "locality": "Anna Nagar",
            "is_age_verified": True,
            "created_at": now
        },
        {
            "_id": techlocal_id,
            "email": "techlocal@silverhands.in",
            "hashed_password": hashed_pwd,
            "full_name": "TechLocal Solutions Pvt Ltd",
            "role": "company",
            "company_name": "TechLocal Solutions Pvt Ltd",
            "gstin": "33AAAAA0000A1Z5",
            "phone": "+91 44 2441 9999",
            "city": "Chennai",
            "locality": "T. Nagar",
            "is_age_verified": False,
            "created_at": now
        },
        {
            "_id": ananya_id,
            "email": "ananya@silverhands.in",
            "hashed_password": hashed_pwd,
            "full_name": "Ananya Sharma",
            "role": "customer",
            "phone": "+91 98840 56789",
            "city": "Chennai",
            "locality": "Velachery",
            "is_age_verified": False,
            "created_at": now
        },
        {
            "_id": karthik_id,
            "email": "karthik@silverhands.in",
            "hashed_password": hashed_pwd,
            "full_name": "Karthik Raja",
            "role": "customer",
            "phone": "+91 98841 67890",
            "city": "Chennai",
            "locality": "Adyar",
            "is_age_verified": False,
            "created_at": now
        }
    ]

    for u in users:
        await users_col.insert_one(u)

    # 2. Senior Profiles
    senior_profiles_col = db_manager.get_collection("senior_profiles")
    await senior_profiles_col.insert_one({
        "user_id": ramesh_id,
        "full_name": "Ramesh Krishnan",
        "bio": "35 years experience as Chief Accountant in manufacturing and retail. Specialist in Excel, GST compliance, bookkeeping for MSMEs, and bilingual tutoring.",
        "skills": ["Accounting", "Bookkeeping", "Excel Modeling", "GST Basics", "Small Business Support", "Mentoring", "Telugu", "Tamil"],
        "inferred_skills": [
            {"skill": "Small Business Advisory", "reason": "Derived from 35 years managing accounts for local MSMEs and retailers."},
            {"skill": "Online Language Tutor", "reason": "Speaks fluent Telugu and Tamil with prior tutoring background."}
        ],
        "keywords": ["Accounting", "Excel", "GST", "Bookkeeping", "Telugu Tutor", "Mentoring", "Financial Guidance"],
        "languages": ["en", "ta", "te"],
        "travel_radius": "5 km",
        "locality": "Adyar",
        "city": "Chennai",
        "work_mode": "both",
        "availability": "Evenings (4 PM – 8 PM) & Weekends",
        "is_age_verified": True,
        "verification_ref": "SR-TN-CH-4819",
        "earnings_total": 24500,
        "completed_jobs_count": 8,
        "rating": 4.95,
        "review_count": 14,
        "created_at": now
    })

    await senior_profiles_col.insert_one({
        "user_id": lakshmi_id,
        "full_name": "Lakshmi Venkatesh",
        "bio": "Master homemaker with 40 years mastery of authentic Thanjavur recipes, sun-dried mango pickles, traditional spice podis, and festival sweets.",
        "skills": ["Traditional Cooking", "Pickles & Preserves", "Spice Blends", "Diwali Sweets", "Culinary Workshops"],
        "inferred_skills": [
            {"skill": "Festival Gifting Hampers", "reason": "Expert in small-batch preparation of Mysore Pak, Murukku, and traditional sweets."},
            {"skill": "Culinary Consultant", "reason": "Deep knowledge of authentic South Indian heritage cuisine."}
        ],
        "keywords": ["Mango Pickle", "Murukku", "Diwali Sweets", "Spice Podi", "Cooking Workshop", "Traditional Food"],
        "languages": ["en", "ta"],
        "travel_radius": "2 km",
        "locality": "Mylapore",
        "city": "Chennai",
        "work_mode": "home",
        "availability": "Flexible Daily",
        "is_age_verified": True,
        "verification_ref": "SR-TN-CH-3902",
        "earnings_total": 18200,
        "completed_jobs_count": 22,
        "rating": 4.98,
        "review_count": 31,
        "created_at": now
    })

    await senior_profiles_col.insert_one({
        "user_id": meena_id,
        "full_name": "Meena Sundaram",
        "bio": "Expert artisan tailor and embroidery specialist with 28 years experience in bespoke blouse tailoring, festival alterations, and Aari work.",
        "skills": ["Bespoke Tailoring", "Aari Embroidery", "Festival Alterations", "Handicrafts", "Pattern Drafting"],
        "inferred_skills": [
            {"skill": "Custom Festival Wardrobe Design", "reason": "Longstanding track record designing festive attire and saree finishing."}
        ],
        "keywords": ["Tailoring", "Embroidery", "Aari Work", "Saree Blouse", "Alterations", "Handmade"],
        "languages": ["en", "ta"],
        "travel_radius": "5 km",
        "locality": "Anna Nagar",
        "city": "Chennai",
        "work_mode": "home",
        "availability": "Weekdays 10 AM – 5 PM",
        "is_age_verified": True,
        "verification_ref": "SR-TN-CH-5120",
        "earnings_total": 15400,
        "completed_jobs_count": 16,
        "rating": 4.90,
        "review_count": 19,
        "created_at": now
    })

    logger.info("Successfully seeded users and senior profiles.")

