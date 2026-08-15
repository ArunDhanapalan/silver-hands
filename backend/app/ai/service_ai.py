import logging
import re
from typing import Dict, Any, List
from app.ai.nlp_utils import capitalize_title, capitalize_sentences

logger = logging.getLogger("silverhands.ai.service")

class ServiceNLPEngine:
    """
    High-accuracy domain ontology NLP engine for managed senior services:
    Language tuition, academic tutoring, accounting advisory, music, and crafts.
    """

    SERVICE_ONTOLOGY = [
        {
            "match_words": ["telugu", "tamil", "hindi", "kannada", "malayalam", "bengali", "marathi", "gujarati", "punjabi", "sanskrit", "spoken english", "language", "grammar", "sloka"],
            "title_template": "1-on-1 Conversational {lang} Fluency & Cultural Mentoring Masterclass",
            "desc_template": "Patient, structured 1-on-1 spoken {lang} coaching tailored for school children and adults. Focuses on conversational fluency, accurate pronunciation, essential daily vocabulary, and reading fundamentals. Includes personalized homework review.",
            "category": "Education & Learning",
            "subcategory": "Language Tuition",
            "mode": "online",
            "price": 400,
            "duration": 45,
            "target": "School Students (Age 6–16) and Working Professionals",
            "deliverables": ["Weekly vocabulary flashcards", "Pronunciation practice audio", "Milestone progress report"]
        },
        {
            "match_words": ["math", "mathematics", "vedic maths", "algebra", "geometry", "science", "physics", "chemistry", "biology", "commerce", "economics"],
            "title_template": "Conceptual {subject} Mastery & Exam Mentoring for Students",
            "desc_template": "Comprehensive conceptual coaching in {subject} led by retired educators. Emphasizes foundational problem-solving clarity, step-by-step mathematical reasoning, and board exam confidence.",
            "category": "Education & Learning",
            "subcategory": "Academic Tutoring",
            "mode": "online",
            "price": 500,
            "duration": 60,
            "target": "Middle & High School Students (Classes 6–12)",
            "deliverables": ["Customized problem sets", "Weekly chapter mock tests", "Formula cheat sheets"]
        },
        {
            "match_words": ["account", "gst", "tally", "tax", "bookkeep", "ledger", "balance sheet", "audit", "finance", "excel"],
            "title_template": "MSME Fractional Accounting & GST Advisory Session",
            "desc_template": "Expert one-on-one financial health consultation, ledger reconciliation, and GST compliance review for micro-enterprises, retail shops, and startups. Guided by over 30 years of accounting experience.",
            "category": "Knowledge & Mentoring",
            "subcategory": "Bookkeeping & Finance",
            "mode": "online",
            "price": 800,
            "duration": 60,
            "target": "Small Business Owners & Micro-Entrepreneurs",
            "deliverables": ["Tax reconciliation checklist", "Cash flow review spreadsheet", "Compliance action plan"]
        },
        {
            "match_words": ["sing", "carnatic", "hindustani", "vocal", "music", "veena", "flute", "keyboard", "bhajan", "chanting"],
            "title_template": "Classical Indian Vocal & Sloka Chanting Foundation Course",
            "desc_template": "Traditional classical music foundation covering swaras, rhythmic taalas, breath control, and authentic slokas with cultural resonance and devotional warmth.",
            "category": "Culture & Tradition",
            "subcategory": "Music & Performing Arts",
            "mode": "online",
            "price": 450,
            "duration": 45,
            "target": "Children and Adult Beginners",
            "deliverables": ["Sloka lyric sheets with meanings", "Audio practice guide", "Voice training drills"]
        },
        {
            "match_words": ["cook", "culinary", "baking", "sweet making", "pickle making", "chef", "recipe"],
            "title_template": "Heritage Regional Culinary Masterclass & Spice Secrets",
            "desc_template": "Step-by-step culinary instruction on authentic heirloom recipes, secret spice proportions, and natural food preservation techniques perfected over generations.",
            "category": "Home & Practical Skills",
            "subcategory": "Culinary & Lifestyle",
            "mode": "both",
            "price": 500,
            "duration": 60,
            "target": "Cooking Enthusiasts & Homemakers",
            "deliverables": ["Heirloom recipe cards", "Spice ratio reference guide", "Storage & preservation manual"]
        },
        {
            "match_words": ["mentor", "career", "leadership", "executive", "advisory", "interview", "public speak", "counsel"],
            "title_template": "Senior Career Mentorship & Executive Life Coaching",
            "desc_template": "Deep-dive 1-on-1 strategic guidance on professional transitions, leadership communications, and career longevity drawing from decades of corporate leadership.",
            "category": "Knowledge & Mentoring",
            "subcategory": "Career Advisory",
            "mode": "online",
            "price": 1000,
            "duration": 60,
            "target": "Young Professionals & College Graduates",
            "deliverables": ["Resume & profile review", "Interview simulation feedback", "Personal career roadmap"]
        }
    ]

    @classmethod
    def generate_service(cls, raw_input: str) -> Dict[str, Any]:
        text_clean = (raw_input or "").strip()
        lower_t = text_clean.lower()

        matched_entry = None
        detected_keyword = ""

        for entry in cls.SERVICE_ONTOLOGY:
            for kw in entry["match_words"]:
                if re.search(r'\b' + re.escape(kw) + r'\b', lower_t) or kw in lower_t:
                    matched_entry = entry
                    detected_keyword = kw
                    break
            if matched_entry:
                break

        if matched_entry:
            kw_title = detected_keyword.title()
            title_raw = matched_entry["title_template"].replace("{lang}", kw_title).replace("{subject}", kw_title)
            desc_raw = matched_entry["desc_template"].replace("{lang}", kw_title).replace("{subject}", kw_title)
            category = matched_entry["category"]
            subcategory = matched_entry["subcategory"]
            mode = matched_entry["mode"]
            price = matched_entry["price"]
            duration = matched_entry["duration"]
            target = matched_entry["target"]
            deliverables = matched_entry["deliverables"]
        else:
            clean_topic = text_clean.title() if len(text_clean) < 30 else text_clean[:30].title()
            title_raw = f"Personalized 1-on-1 Mentoring Masterclass in {clean_topic}"
            desc_raw = f"Comprehensive 1-on-1 learning session in {text_clean} guided by decades of dedicated senior experience and patient personal pacing."
            category = "Education & Learning"
            subcategory = "Personal Mentoring"
            mode = "online"
            price = 400
            duration = 45
            target = "All Learners & Beginners"
            deliverables = ["Personalized learning roadmap", "Live guided practice", "Post-session summary notes"]

        # CAPITALISE TITLE AND DESCRIPTIONS
        title = capitalize_title(title_raw)
        description = capitalize_sentences(desc_raw)

        return {
            "title": title,
            "description": description,
            "category": category,
            "subcategory": subcategory,
            "mode": mode,
            "suggested_price": price,
            "price_per_session": price,
            "duration_mins": duration,
            "target_audience": target,
            "deliverables": deliverables
        }

service_ai = ServiceNLPEngine()
