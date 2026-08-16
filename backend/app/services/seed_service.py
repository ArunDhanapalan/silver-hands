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

    # 3. Seed Opportunities
    opps_col = db_manager.get_collection("opportunities")
    opp_count = await opps_col.count_documents({})
    if opp_count == 0:
        opportunities = [
            {
                "_id": "opp_bookkeeping_01",
                "title": "Remote MSME Bookkeeping & GST Support",
                "type": "job",
                "posted_by_name": "TechLocal Solutions Pvt Ltd",
                "company_id": techlocal_id,
                "description": "Seeking an experienced retired accountant for part-time evening bookkeeping, monthly ledger reconciliation, and GST 3B return filing in Excel.",
                "required_skills": ["Accounting", "Bookkeeping", "Excel", "GST Basics"],
                "locality": "T. Nagar",
                "city": "Chennai",
                "distance_km": 0.0,
                "work_mode": "online",
                "schedule": "8 hrs/week (Flexible Evenings)",
                "pay_amount": 12000,
                "pay_unit": "month",
                "languages": ["en", "ta"],
                "is_festival_special": False,
                "created_at": now
            },
            {
                "_id": "opp_shop_accounts_02",
                "title": "Local Retail Shop Accounts & Cash Reconciliation",
                "type": "nearby_work",
                "posted_by_name": "Mylapore Heritage Stores",
                "description": "Need trusted senior accountant to help balance daily physical cash books and computerize inventory counts twice a week.",
                "required_skills": ["Accounting", "Bookkeeping", "Cash Handling"],
                "locality": "Adyar",
                "city": "Chennai",
                "distance_km": 2.3,
                "work_mode": "offline",
                "schedule": "2 Evenings/week (5 PM – 7 PM)",
                "pay_amount": 6500,
                "pay_unit": "month",
                "languages": ["ta"],
                "is_festival_special": False,
                "created_at": now
            },
            {
                "_id": "opp_telugu_tuition_03",
                "title": "Spoken Telugu & Reading Tuition for 2 School Students",
                "type": "service_request",
                "posted_by_name": "Ananya Sharma (Parent)",
                "description": "Looking for patient senior teacher for conversational and foundational Telugu lessons for grade 4 and 6 kids via online video sessions.",
                "required_skills": ["Telugu", "Language Tuition", "Mentoring", "Teaching"],
                "locality": "Velachery",
                "city": "Chennai",
                "distance_km": 3.4,
                "work_mode": "online",
                "schedule": "3 Sessions/week (45 mins each)",
                "pay_amount": 600,
                "pay_unit": "session",
                "languages": ["te", "en", "ta"],
                "is_festival_special": False,
                "created_at": now
            },
            {
                "_id": "opp_diwali_sweets_04",
                "title": "Diwali Festival Corporate Gift Hamper Sweets Preparation",
                "type": "festival_work",
                "posted_by_name": "Madras Artisans Guild",
                "description": "Looking for culinary masters to prepare small-batch Mysore Pak, Ribbon Pakoda and traditional sweets for 50 handcrafted festive gift boxes.",
                "required_skills": ["Traditional Cooking", "Diwali Sweets", "Pickles & Preserves"],
                "locality": "Mylapore",
                "city": "Chennai",
                "distance_km": 1.8,
                "work_mode": "home",
                "schedule": "Flexible pre-Diwali batch",
                "pay_amount": 15000,
                "pay_unit": "project",
                "languages": ["ta", "en"],
                "is_festival_special": True,
                "festival_tag": "Diwali",
                "created_at": now
            },
            {
                "_id": "opp_tailoring_festival_05",
                "title": "Bespoke Festival Blouse Stitching & Aari Work Alterations",
                "type": "nearby_work",
                "posted_by_name": "Adyar Boutique & Sarees",
                "description": "Urgent festive season orders for custom silk saree blouse tailoring and sleeve zari finishing.",
                "required_skills": ["Bespoke Tailoring", "Aari Embroidery", "Alterations"],
                "locality": "Adyar",
                "city": "Chennai",
                "distance_km": 1.2,
                "work_mode": "home",
                "schedule": "On-demand pieces",
                "pay_amount": 1200,
                "pay_unit": "project",
                "languages": ["ta"],
                "is_festival_special": True,
                "festival_tag": "Diwali",
                "created_at": now
            }
        ]
        for opp in opportunities:
            await opps_col.insert_one(opp)
        logger.info("Successfully seeded opportunities.")

    # 4. Seed Store Products
    products_col = db_manager.get_collection("products")
    prod_count = await products_col.count_documents({})
    if prod_count == 0:
        products = [
            {
                "_id": "prod_mango_pickle_01",
                "seller_id": lakshmi_id,
                "seller_name": "Lakshmi Venkatesh",
                "seller_locality": "Mylapore",
                "seller_city": "Chennai",
                "seller_rating": 4.98,
                "is_age_verified": True,
                "title": "Authentic Sun-Dried Thanjavur Mango Pickle (Mavadu)",
                "description": "Small-batch, hand-cut tender green mango pickle made using 40-year-old family recipe with cold-pressed sesame oil, roasted fenugreek, and mustard. Zero preservatives.",
                "category": "Food & Preserves",
                "price": 280,
                "unit": "350g Jar",
                "images": ["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80"],
                "keywords": ["Mango Pickle", "Traditional Recipe", "Homemade Food", "South Indian", "Mylapore"],
                "locality": "Mylapore",
                "city": "Chennai",
                "is_festival_special": False,
                "festival_tag": None,
                "stock_quantity": 20,
                "total_sold": 4,
                "rating": 4.98,
                "total_reviews": 3,
                "reviews": [
                    {
                        "customer_id": "cust_ananya_01",
                        "customer_name": "Ananya Sharma",
                        "rating": 5,
                        "comment": "Authentic grandmother recipe taste! Tender mangoes with cold pressed sesame oil. Reminded me of my childhood holidays in Thanjavur.",
                        "created_at": now
                    },
                    {
                        "customer_id": "cust_karthik_02",
                        "customer_name": "Karthik Subramanian",
                        "rating": 5,
                        "comment": "Super fresh aroma and prompt delivery in Mylapore. Glass jar was packaged airtight with zero leaks.",
                        "created_at": now
                    },
                    {
                        "customer_id": "cust_pooja_03",
                        "customer_name": "Pooja Hegde",
                        "rating": 5,
                        "comment": "Pure ingredients, zero artificial preservatives. Perfect accompaniment with hot curd rice!",
                        "created_at": now
                    }
                ],
                "created_at": now
            },
            {
                "_id": "prod_mysore_pak_02",
                "seller_id": lakshmi_id,
                "seller_name": "Lakshmi Venkatesh",
                "seller_locality": "Mylapore",
                "seller_city": "Chennai",
                "seller_rating": 4.98,
                "is_age_verified": True,
                "title": "Festive Pure Ghee Mysore Pak Box",
                "description": "Melt-in-mouth traditional Mysore Pak made with pure cow ghee and freshly ground gram flour. Handcrafted for Diwali gifting.",
                "category": "Festive Sweets & Snacks",
                "price": 450,
                "unit": "500g Gift Box",
                "images": ["https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80"],
                "keywords": ["Mysore Pak", "Diwali Sweets", "Pure Ghee", "Festival Gift", "Homemade"],
                "locality": "Mylapore",
                "city": "Chennai",
                "is_festival_special": True,
                "festival_tag": "Diwali",
                "stock_quantity": 20,
                "total_sold": 8,
                "rating": 4.95,
                "total_reviews": 2,
                "reviews": [
                    {
                        "customer_id": "cust_rahul_04",
                        "customer_name": "Rahul Verma",
                        "rating": 5,
                        "comment": "Literally melts in your mouth! Rich pure ghee flavor without being overwhelmingly sweet. Ordered two more boxes for office gifting.",
                        "created_at": now
                    },
                    {
                        "customer_id": "cust_sneha_05",
                        "customer_name": "Sneha Rangarajan",
                        "rating": 5,
                        "comment": "100 times better than commercial sweet shops. You can smell the quality of pure cow ghee as soon as you open the box.",
                        "created_at": now
                    }
                ],
                "created_at": now
            },
            {
                "_id": "prod_idli_podi_03",
                "seller_id": lakshmi_id,
                "seller_name": "Lakshmi Venkatesh",
                "seller_locality": "Mylapore",
                "seller_city": "Chennai",
                "seller_rating": 4.98,
                "is_age_verified": True,
                "title": "Heritage Roasted Sesame Idli Chutney Podi",
                "description": "Crispy aromatic gunpowder spiced podi made from stone-ground black urad dal, roasted red chillies, and curry leaves.",
                "category": "Food & Preserves",
                "price": 190,
                "unit": "250g Pouch",
                "images": ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80"],
                "keywords": ["Idli Podi", "Gunpowder", "Homemade Masala", "Traditional Spice", "Chennai"],
                "locality": "Mylapore",
                "city": "Chennai",
                "is_festival_special": False,
                "festival_tag": None,
                "stock_quantity": 20,
                "total_sold": 5,
                "rating": 4.92,
                "total_reviews": 2,
                "reviews": [
                    {
                        "customer_id": "cust_suresh_06",
                        "customer_name": "Suresh Natarajan",
                        "rating": 5,
                        "comment": "The crunch of roasted sesame and lentils is perfection with hot idlis and gingelly oil.",
                        "created_at": now
                    },
                    {
                        "customer_id": "cust_deepa_07",
                        "customer_name": "Deepa Sundar",
                        "rating": 5,
                        "comment": "Authentic Mylapore Brahmin style recipe. Not too spicy, perfectly roasted flavor.",
                        "created_at": now
                    }
                ],
                "created_at": now
            },
            {
                "_id": "prod_potli_bags_04",
                "seller_id": meena_id,
                "seller_name": "Meena Sundaram",
                "seller_locality": "Anna Nagar",
                "seller_city": "Chennai",
                "seller_rating": 4.90,
                "is_age_verified": True,
                "title": "Handmade Raw Silk Festival Potli Gift Pouches (Set of 3)",
                "description": "Exquisite silk potli bags with golden zari drawstring and beadwork, ideal for festive gifting and wedding return favors.",
                "category": "Handicrafts & Decor",
                "price": 350,
                "unit": "Set of 3",
                "images": ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80"],
                "keywords": ["Potli Bags", "Silk Pouches", "Festival Decor", "Handmade Gifting", "Anna Nagar"],
                "locality": "Anna Nagar",
                "city": "Chennai",
                "is_festival_special": True,
                "festival_tag": "Diwali",
                "stock_quantity": 18,
                "total_sold": 6,
                "rating": 4.90,
                "total_reviews": 2,
                "reviews": [
                    {
                        "customer_id": "cust_radha_08",
                        "customer_name": "Radha Krishnan",
                        "rating": 5,
                        "comment": "Stitching quality is top notch. The golden zari and tassels look very elegant for gifting.",
                        "created_at": now
                    }
                ],
                "created_at": now
            },
            {
                "_id": "prod_blouse_stitching_05",
                "seller_id": meena_id,
                "seller_name": "Meena Sundaram",
                "seller_locality": "Anna Nagar",
                "seller_city": "Chennai",
                "seller_rating": 4.90,
                "is_age_verified": True,
                "title": "Custom Silk Saree Blouse Tailoring & Maggam Border",
                "description": "Bespoke fitted saree blouse tailoring with customizable necklines, piping, and handcrafted temple border embellishments.",
                "category": "Tailoring & Apparel",
                "price": 1200,
                "unit": "Piece",
                "images": ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"],
                "keywords": ["Tailoring", "Saree Blouse", "Custom Stitching", "Festive Wear", "Embroidery"],
                "locality": "Anna Nagar",
                "city": "Chennai",
                "is_festival_special": True,
                "festival_tag": "Diwali",
                "stock_quantity": 12,
                "total_sold": 3,
                "rating": 4.88,
                "total_reviews": 2,
                "reviews": [
                    {
                        "customer_id": "cust_meera_09",
                        "customer_name": "Meera Balaji",
                        "rating": 5,
                        "comment": "Perfect fitting on the first attempt! Beautiful finishing on the neck piping.",
                        "created_at": now
                    }
                ],
                "created_at": now
            }
        ]
        for p in products:
            await products_col.insert_one(p)
        logger.info("Successfully seeded store products.")

    # 5. Seed Managed Services (Bouquet & Online Language Tuition reference)
    services_col = db_manager.get_collection("services")
    serv_count = await services_col.count_documents({})
    if serv_count == 0:
        services = [
            {
                "_id": "serv_telugu_tuition_01",
                "senior_id": ramesh_id,
                "senior_name": "Ramesh Krishnan",
                "senior_locality": "Adyar",
                "senior_city": "Chennai",
                "senior_rating": 4.95,
                "is_age_verified": True,
                "title": "1-on-1 Online Conversational & Reading Telugu Tuition",
                "category": "Education & Learning",
                "subcategory": "Language Tuition",
                "description": "Patient, structured Telugu language instruction tailored for children and beginners. Focuses on daily conversational fluency, script reading, and cultural folklore with customized practice worksheets.",
                "mode": "online",
                "duration_mins": 45,
                "price_per_session": 500,
                "languages": ["te", "en", "ta"],
                "target_audience": "School Students & Beginners (Ages 6+)",
                "locality": "Adyar",
                "city": "Chennai",
                "total_sessions_conducted": 38,
                "rating": 4.96,
                "total_reviews": 3,
                "reviews": [
                    {
                        "customer_id": "cust_ananya_01",
                        "customer_name": "Ananya Sharma",
                        "rating": 5,
                        "comment": "Ramesh Sir is incredibly patient with kids. My 8-year-old son started reading Telugu storybooks within 6 sessions!",
                        "created_at": now
                    },
                    {
                        "customer_id": "cust_siddharth_10",
                        "customer_name": "Siddharth Rao",
                        "rating": 5,
                        "comment": "Great pronunciation drills and customized conversation worksheets. Highly recommended for beginners.",
                        "created_at": now
                    },
                    {
                        "customer_id": "cust_divya_11",
                        "customer_name": "Divya Nair",
                        "rating": 5,
                        "comment": "Very structured teaching methodology. The 1-click video classroom worked seamlessly.",
                        "created_at": now
                    }
                ],
                "created_at": now
            },
            {
                "_id": "serv_bookkeeping_mentoring_02",
                "senior_id": ramesh_id,
                "senior_name": "Ramesh Krishnan",
                "senior_locality": "Adyar",
                "senior_city": "Chennai",
                "senior_rating": 4.95,
                "is_age_verified": True,
                "title": "MSME Bookkeeping, GST & Cashflow Mentoring for Founders",
                "category": "Knowledge & Mentoring",
                "subcategory": "Bookkeeping",
                "description": "Practical financial mentoring for small business owners and startups. Learn how to maintain clean ledgers, file GST returns on time, and budget cashflow efficiently.",
                "mode": "both",
                "duration_mins": 60,
                "price_per_session": 1200,
                "languages": ["en", "ta"],
                "target_audience": "Entrepreneurs & Retail Founders",
                "locality": "Adyar",
                "city": "Chennai",
                "total_sessions_conducted": 19,
                "rating": 4.95,
                "total_reviews": 2,
                "reviews": [
                    {
                        "customer_id": "cust_techlocal_12",
                        "customer_name": "Vikram Sethuraman",
                        "rating": 5,
                        "comment": "Ramesh sir helped us streamline our monthly reconciliations and GST filing checklist in two sessions. Saved us thousands in late fees!",
                        "created_at": now
                    }
                ],
                "created_at": now
            },
            {
                "_id": "serv_cooking_masterclass_03",
                "senior_id": lakshmi_id,
                "senior_name": "Lakshmi Venkatesh",
                "senior_locality": "Mylapore",
                "senior_city": "Chennai",
                "senior_rating": 4.98,
                "is_age_verified": True,
                "title": "Traditional South Indian Culinary & Festive Sweets Masterclass",
                "category": "Culture & Tradition",
                "subcategory": "Culinary",
                "description": "Step-by-step masterclass on preparing authentic stone-ground spice podis, Mysore Pak, sun-dried mango preserves, and heritage rasam pastes.",
                "mode": "both",
                "duration_mins": 90,
                "price_per_session": 850,
                "languages": ["ta", "en"],
                "target_audience": "Home Cooks & Culinary Enthusiasts",
                "locality": "Mylapore",
                "city": "Chennai",
                "total_sessions_conducted": 42,
                "rating": 4.98,
                "total_reviews": 2,
                "reviews": [
                    {
                        "customer_id": "cust_priya_13",
                        "customer_name": "Priya Venkat",
                        "rating": 5,
                        "comment": "Lakshmi mami shared exact proportions and secret techniques for Mysore Pak texture that you will never find on YouTube. Invaluable!",
                        "created_at": now
                    }
                ],
                "created_at": now
            },
            {
                "_id": "serv_tailoring_guidance_04",
                "senior_id": meena_id,
                "senior_name": "Meena Sundaram",
                "senior_locality": "Anna Nagar",
                "senior_city": "Chennai",
                "senior_rating": 4.90,
                "is_age_verified": True,
                "title": "Handicraft Aari Embroidery & Blouse Pattern Drafting Workshop",
                "category": "Home & Practical Skills",
                "subcategory": "Tailoring",
                "description": "Hands-on guidance on mastering neck drafting, piping, and traditional Aari needle embroidery for ethnic wear.",
                "mode": "offline",
                "duration_mins": 60,
                "price_per_session": 650,
                "languages": ["ta", "en"],
                "target_audience": "Beginners & DIY Enthusiasts",
                "locality": "Anna Nagar",
                "city": "Chennai",
                "total_sessions_conducted": 14,
                "rating": 4.90,
                "total_reviews": 1,
                "reviews": [
                    {
                        "customer_id": "cust_kavitha_14",
                        "customer_name": "Kavitha R.",
                        "rating": 5,
                        "comment": "Wonderful hands-on workshop in Anna Nagar. Meena ma'am guided each participant step-by-step with embroidery frames.",
                        "created_at": now
                    }
                ],
                "created_at": now
            }
        ]
        for s in services:
            await services_col.insert_one(s)
        logger.info("Successfully seeded managed services.")

    # 6. Seed Community Posts & Collaborations
    posts_col = db_manager.get_collection("community_posts")
    post_count = await posts_col.count_documents({})
    if post_count == 0:
        posts = [
            {
                "_id": "post_need_telugu_01",
                "user_id": ananya_id,
                "author_name": "Ananya Sharma",
                "author_role": "customer",
                "is_age_verified": False,
                "title": "Need: Spoken Telugu & Math tutor for 5th grade student in Adyar",
                "content": "Looking for an experienced, patient teacher who can take 1-on-1 online evening classes for conversational Telugu and basic arithmetic. Preferably 3 days a week.",
                "type": "need",
                "tags": ["Telugu", "Tuition", "Maths", "Adyar"],
                "locality": "Adyar",
                "city": "Chennai",
                "comments_count": 2,
                "likes_count": 5,
                "demand_signal_generated": True,
                "matched_skills": ["Telugu", "Language Tuition", "Mentoring"],
                "created_at": now
            },
            {
                "_id": "post_need_sweets_02",
                "user_id": techlocal_id,
                "author_name": "TechLocal Solutions Pvt Ltd",
                "author_role": "company",
                "is_age_verified": False,
                "title": "Need: Authentic Handmade Diwali Sweets for 35 Employee Gift Hampers",
                "content": "We want to support local senior homemakers rather than commercial factory sweets. Looking for Mysore Pak, Ribbon Pakoda and Mixture prepared hygienically in small batches in Chennai.",
                "type": "need",
                "tags": ["Diwali", "Sweets", "Bulk Order", "Mylapore"],
                "locality": "Mylapore",
                "city": "Chennai",
                "comments_count": 3,
                "likes_count": 12,
                "demand_signal_generated": True,
                "matched_skills": ["Traditional Cooking", "Diwali Sweets", "Pickles & Preserves"],
                "created_at": now
            },
            {
                "_id": "post_collab_food_03",
                "user_id": lakshmi_id,
                "author_name": "Lakshmi Venkatesh",
                "author_role": "senior",
                "is_age_verified": True,
                "title": "Collaboration: Seeking partner for festival sweets & organic snacks venture",
                "content": "I prepare traditional Thanjavur recipes and festival sweets. Looking for someone with business, accounting, or packaging coordination skills to help scale our deliveries across Chennai!",
                "type": "collaboration",
                "tags": ["Collaboration", "Food Business", "Traditional Recipes"],
                "locality": "Mylapore",
                "city": "Chennai",
                "comments_count": 4,
                "likes_count": 18,
                "demand_signal_generated": False,
                "matched_skills": ["Accounting", "Bookkeeping", "Small Business Support"],
                "created_at": now
            },
            {
                "_id": "post_event_gardening_04",
                "user_id": ramesh_id,
                "author_name": "Ramesh Krishnan",
                "author_role": "senior",
                "is_age_verified": True,
                "title": "Workshop: Terrace Organic Gardening & Kitchen Waste Composting (Free Entry)",
                "content": "Hosting a community sharing session at Gandhi Nagar park this Sunday morning at 8 AM. Learn how to grow organic tomatoes and mint on your balcony without chemicals.",
                "type": "event",
                "tags": ["Workshop", "Organic Gardening", "Community", "Adyar"],
                "locality": "Adyar",
                "city": "Chennai",
                "comments_count": 6,
                "likes_count": 24,
                "demand_signal_generated": False,
                "matched_skills": ["Gardening", "Composting"],
                "created_at": now
            }
        ]
        for p in posts:
            await posts_col.insert_one(p)

        # Seed Collaborations
        collabs_col = db_manager.get_collection("collaborations")
        await collabs_col.insert_one({
            "_id": "collab_ramesh_lakshmi_01",
            "senior_a_id": ramesh_id,
            "senior_a_name": "Ramesh Krishnan",
            "senior_a_skills": ["Accounting", "Bookkeeping", "GST Basics", "Excel"],
            "senior_b_id": lakshmi_id,
            "senior_b_name": "Lakshmi Venkatesh",
            "senior_b_skills": ["Traditional Cooking", "Pickles & Preserves", "Diwali Sweets"],
            "city": "Chennai",
            "locality": "Mylapore / Adyar",
            "venture_title": "Heritage Taste & Home-Delivery Kitchen",
            "ai_synergy_reason": "Lakshmi brings 40 years of culinary mastery and authentic traditional recipes, while Ramesh brings 35 years of accounting, cash reconciliation, and GST compliance to handle budgeting and vendor payments.",
            "status": "suggested",
            "created_at": now
        })

        logger.info("Successfully seeded community posts and collaborations.")

async def backfill_reviews_if_needed():
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    prod_col = db_manager.get_collection("products")
    async for p in prod_col.find({"$or": [{"reviews": {"$exists": False}}, {"reviews": {"$size": 0}}]}):
        sample_revs = [
            {
                "customer_id": "cust_sample_01",
                "customer_name": "Ananya Sharma",
                "rating": 5,
                "comment": "Authentic taste and exceptional traditional preparation quality! Highly recommended.",
                "created_at": now
            },
            {
                "customer_id": "cust_sample_02",
                "customer_name": "Karthik Subramanian",
                "rating": 5,
                "comment": "Super fresh aroma and prompt packaging. 100% authentic heritage experience.",
                "created_at": now
            }
        ]
        await prod_col.update_one({"_id": p["_id"]}, {"$set": {"reviews": sample_revs, "total_reviews": 2, "rating": 4.95}})

    srv_col = db_manager.get_collection("services")
    async for s in srv_col.find({"$or": [{"reviews": {"$exists": False}}, {"reviews": {"$size": 0}}]}):
        sample_srv_revs = [
            {
                "customer_id": "cust_sample_01",
                "customer_name": "Ananya Sharma",
                "rating": 5,
                "comment": "Incredibly patient elder teacher. Made concepts crystal clear with practical examples.",
                "created_at": now
            },
            {
                "customer_id": "cust_sample_03",
                "customer_name": "Siddharth Rao",
                "rating": 5,
                "comment": "Great structured curriculum and warm mentoring approach. Highly recommended for beginners.",
                "created_at": now
            }
        ]
        await srv_col.update_one({"_id": s["_id"]}, {"$set": {"reviews": sample_srv_revs, "total_reviews": 2, "rating": 4.95}})

