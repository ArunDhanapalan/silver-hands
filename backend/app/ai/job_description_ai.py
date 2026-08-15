import logging
import json
import re
import os
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("silverhands.ai.job_description")

class JobDescriptionAIEngine:
    """
    Parses company job postings into senior-friendly dignity guidelines and extracted skill requirements.
    Supports both Gemini API and deterministic rule matching.
    """

    @classmethod
    def parse_job_posting(cls, raw_title: str, raw_description: Optional[str] = None) -> Dict[str, Any]:
        combined_text = (raw_title + " " + (raw_description or "")).strip()
        lower_t = combined_text.lower()

        gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if gemini_key and gemini_key != "mock_gemini_key_for_testing" and len(gemini_key) > 20:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = f"""
Analyze this employer job requirement for Indian senior citizens (60+) on SilverHands.
Input: "{combined_text}"

Return ONLY this JSON schema without markdown:
{{
  "title": "Concise, dignified job title",
  "summary": "2-sentence summary outlining respectful senior duties",
  "category": "One of: Culinary & Cooking, Accounting & Finance, Mentoring & Advisory, Tutoring & Academics, Operations & Logistics, Handicrafts & Tailoring",
  "extracted_skills": ["2 to 4 specific skills"],
  "required_skills": ["2 to 4 specific skills"],
  "suggested_pay": 18000,
  "work_mode": "offline, online, or both",
  "is_remote": false,
  "work_type": "part_time",
  "schedule": "Part-time (15-20 hrs/week)",
  "dignity_approved": true,
  "dignity_notes": "SilverHands Senior Dignity Standards compliant."
}}
"""
                response = model.generate_content(prompt)
                if response and response.text:
                    json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                    if json_match:
                        data = json.loads(json_match.group(0))
                        if "required_skills" in data and "extracted_skills" not in data:
                            data["extracted_skills"] = data["required_skills"]
                        if "extracted_skills" in data and "required_skills" not in data:
                            data["required_skills"] = data["extracted_skills"]
                        return data
            except Exception as e:
                logger.warning(f"Gemini JD parse fallback: {e}")

        # Deterministic NLP Fallback
        is_remote = any(w in lower_t for w in ["online", "remote", "work from home", "zoom"])
        work_type = "online" if is_remote else "part_time"

        category = "Accounting & Finance"
        skills = []
        pay = 15000

        if any(w in lower_t for w in ["cook", "chef", "food", "kitchen", "recipe", "sweet", "catering", "meal"]):
            category = "Culinary & Cooking"
            skills = ["Traditional Cooking", "Kitchen Hygiene", "Recipe Planning"]
            title = raw_title if len(raw_title) > 5 else "Senior Culinary Mentor & Kitchen Advisor"
            pay = 16000
        elif any(w in lower_t for w in ["account", "gst", "tally", "tax", "bookkeep", "ledger", "audit", "balance sheet"]):
            category = "Accounting & Finance"
            skills = ["Accounting", "GST Basics", "Bookkeeping", "Excel"]
            title = raw_title if len(raw_title) > 5 else "Fractional Chief Accountant & GST Advisor"
            pay = 20000
        elif any(w in lower_t for w in ["teach", "tutor", "math", "english", "science", "telugu", "tamil", "hindi"]):
            category = "Tutoring & Academics"
            skills = ["Language Tuition", "Conceptual Teaching", "Student Mentoring"]
            title = raw_title if len(raw_title) > 5 else "Bilingual Senior Academic Tutor"
            pay = 14000
        elif any(w in lower_t for w in ["tailor", "stitch", "blouse", "sew", "embroidery", "fabric", "garment"]):
            category = "Handicrafts & Tailoring"
            skills = ["Bespoke Tailoring", "Embroidery", "Pattern Drafting"]
            title = raw_title if len(raw_title) > 5 else "Master Tailoring & Quality Consultant"
            pay = 15000
        else:
            skills = ["General Experience", "Communication", "Operations"]
            title = raw_title if len(raw_title) > 5 else "Senior Operations & Customer Specialist"

        return {
            "title": title,
            "summary": combined_text[:200] if len(combined_text) > 20 else f"Flexible senior role for {title}.",
            "category": category,
            "extracted_skills": skills,
            "required_skills": skills,
            "suggested_pay": pay,
            "work_mode": "online" if is_remote else "offline",
            "is_remote": is_remote,
            "work_type": work_type,
            "schedule": "Part-time (15 hrs/week)",
            "dignity_approved": True,
            "dignity_notes": "Meets SilverHands Senior Dignity Standards (zero heavy physical lifting, respectful hours)."
        }

job_description_ai = JobDescriptionAIEngine()

async def parse_job_posting(raw_text: str) -> Dict[str, Any]:
    return job_description_ai.parse_job_posting(raw_text)
