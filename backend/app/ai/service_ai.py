import logging
import json
import re
import os
from typing import Dict, Any, List
from app.config import settings

logger = logging.getLogger("silverhands.ai.service")

class ServiceAIEngine:
    """
    AI assistant converting senior skills into structured managed service packages.
    """

    @classmethod
    async def generate_service(cls, raw_input: str) -> Dict[str, Any]:
        text_clean = (raw_input or "").strip()
        if not text_clean:
            return {
                "title": "Senior Mentoring & Tuition Session",
                "description": "Personalized 1-on-1 sessions guided by decades of practical experience.",
                "category": "Language & Academics",
                "subcategory": "Personal Tutoring",
                "mode": "online",
                "suggested_price": 400,
                "duration_mins": 45,
                "target_audience": "All Learners",
                "deliverables": ["Interactive 1-on-1 coaching", "Practical exercises", "Feedback notes"]
            }

        gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if gemini_key and gemini_key != "mock_gemini_key_for_testing" and len(gemini_key) > 20:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = f"""
You are an expert curriculum and service package designer on SilverHands, an Indian senior livelihood platform.

A senior citizen (guru/mentor) described their skill or teaching capability:
Senior Input: "{text_clean}"

Create an enticing, professional managed service package for this senior. Return ONLY this valid JSON without markdown:
{{
  "title": "Inspiring, clear title (e.g. 1-on-1 Spoken Telugu & Fluency Masterclass, MSME Fractional GST & Tax Advisory, Traditional Carnatic Vocal Basics)",
  "description": "2-3 sentences explaining the personalized mentoring approach, patient pacing, and practical mastery.",
  "category": "One of: Language & Academics, Business & Mentoring, Music & Arts, Culinary & Lifestyle, Health & Wellness",
  "subcategory": "Specific subcategory",
  "mode": "online, offline, or both",
  "suggested_price": 450,
  "duration_mins": 45,
  "target_audience": "e.g. School Children, Working Professionals, Homemakers",
  "deliverables": ["3 key session deliverables/takeaways"]
}}
"""
                response = model.generate_content(prompt)
                if response and response.text:
                    json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                    if json_match:
                        data = json.loads(json_match.group(0))
                        return data
            except Exception as e:
                logger.warning(f"Gemini service AI fallback triggered: {e}")

        # Deterministic Fallback
        text = text_clean.lower()
        if any(w in text for w in ["telugu", "tamil", "hindi", "language", "speak", "grammar"]):
            return {
                "title": "1-on-1 Conversational Language & Fluency Coaching",
                "description": "Patient, structured spoken language sessions focusing on real-world conversational phrases, correct pronunciation, and foundational vocabulary.",
                "category": "Language & Academics",
                "subcategory": "Spoken Language Tutoring",
                "mode": "online",
                "suggested_price": 400,
                "duration_mins": 45,
                "target_audience": "Children (Age 6-16) and Working Adults",
                "deliverables": ["Weekly conversation flashcards", "Pronunciation drill guide", "Progress review"]
            }
        elif any(w in text for w in ["account", "gst", "tax", "finance", "excel", "tally", "audit"]):
            return {
                "title": "MSME Fractional Accounting & GST Advisory Session",
                "description": "Personalized 1-on-1 financial review, cash flow reconciliation, and GST compliance guidance tailored for small businesses and founders.",
                "category": "Business & Mentoring",
                "subcategory": "Accounting & Finance",
                "mode": "online",
                "suggested_price": 800,
                "duration_mins": 60,
                "target_audience": "Small Business Owners & Micro-Entrepreneurs",
                "deliverables": ["Tax reconciliation checklist", "Cash flow spreadsheet review", "Action plan"]
            }
        elif any(w in text for w in ["music", "sing", "carnatic", "sloka", "bhajan", "veena", "flute"]):
            return {
                "title": "Traditional Indian Vocal & Sloka Chanting Classes",
                "description": "Classical vocal fundamentals, breathing techniques, and authentic sloka chanting taught with cultural warmth and traditional rhythm.",
                "category": "Music & Arts",
                "subcategory": "Indian Classical Music",
                "mode": "online",
                "suggested_price": 450,
                "duration_mins": 45,
                "target_audience": "Children & Spiritual Seekers",
                "deliverables": ["Sloka lyric sheets with meanings", "Audio practice clips", "Vocal exercises"]
            }
        elif any(w in text for w in ["cook", "culinary", "recipe", "baking", "sweet"]):
            return {
                "title": "Traditional Heritage Culinary Masterclass",
                "description": "Step-by-step masterclass on authentic regional recipes, spice blend balance, and secret traditional preservation techniques.",
                "category": "Culinary & Lifestyle",
                "subcategory": "Traditional Cooking",
                "mode": "both",
                "suggested_price": 500,
                "duration_mins": 60,
                "target_audience": "Cooking Enthusiasts & Homemakers",
                "deliverables": ["Heritage recipe guide", "Ingredient ratio chart", "Live cooking troubleshooting"]
            }
        else:
            return {
                "title": f"Masterclass in {text_clean.title()}",
                "description": f"Personalized 1-on-1 learning session in {text_clean} guided by decades of senior mastery.",
                "category": "Language & Academics",
                "subcategory": "Personal Coaching",
                "mode": "online",
                "suggested_price": 450,
                "duration_mins": 45,
                "target_audience": "All Learners",
                "deliverables": ["Personalized learning roadmap", "Live guided practice", "Post-session notes"]
            }

service_ai = ServiceAIEngine()
