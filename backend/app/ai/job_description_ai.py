import json
import logging
import re
from typing import Dict, Any, Optional
import httpx
from app.config import settings
from app.ai.nlp_utils import capitalize_title, capitalize_sentences

logger = logging.getLogger("silverhands.ai.job_description")

JOB_ONTOLOGY = [
    {
        "match_words": ["cook", "chef", "food", "kitchen", "recipe", "sweet", "catering", "meal", "canteen", "culinary", "baking"],
        "title_template": "Senior Culinary Chef & Traditional Kitchen Advisor",
        "summary_template": "Lead authentic regional meal preparation, recipe standardization, and kitchen quality compliance for local catering operations. Respectful senior-friendly hours with zero heavy manual hauling.",
        "category": "Culinary & Cooking",
        "skills": ["Traditional Cooking", "Kitchen Hygiene", "Recipe Planning", "Quality Tasting"],
        "pay": 18000, "work_mode": "offline"
    },
    {
        "match_words": ["account", "gst", "tally", "tax", "bookkeep", "ledger", "audit", "balance sheet", "finance", "invoice", "cash flow"],
        "title_template": "Fractional Chief Accountant & GST Compliance Advisor",
        "summary_template": "Manage fractional monthly bookkeeping, GST return reconciliation, cash flow verification, and invoice auditing for MSME operations. Flexible part-time schedule with online or offline options.",
        "category": "Accounting & Finance",
        "skills": ["Accounting", "GST Filing", "Bookkeeping", "Tally & Excel"],
        "pay": 20000, "work_mode": "both"
    },
    {
        "match_words": ["teach", "tutor", "math", "english", "science", "telugu", "tamil", "hindi", "academic", "coaching", "school"],
        "title_template": "Bilingual Senior Academic Tutor & Student Mentor",
        "summary_template": "Conduct personalized 1-on-1 and small group academic tutoring sessions in regional languages and core subjects for school students. Flexible afternoon and evening hours.",
        "category": "Tutoring & Academics",
        "skills": ["Language Tuition", "Conceptual Teaching", "Student Mentoring", "Patience"],
        "pay": 15000, "work_mode": "online"
    },
    {
        "match_words": ["tailor", "stitch", "blouse", "sew", "embroidery", "fabric", "garment", "apparel", "pattern"],
        "title_template": "Master Tailoring Consultant & Garment Quality Inspector",
        "summary_template": "Oversee bespoke ethnic garment drafting, custom blouse measurements, and fine embroidery quality inspection for local boutique and apparel studios.",
        "category": "Handicrafts & Tailoring",
        "skills": ["Bespoke Tailoring", "Embroidery", "Pattern Drafting", "Quality Inspection"],
        "pay": 16000, "work_mode": "offline"
    },
    {
        "match_words": ["mentor", "lead", "counsel", "coach", "advis", "strategy", "consult", "executive"],
        "title_template": "Senior Strategic Advisor & Leadership Mentor",
        "summary_template": "Provide fractional leadership mentorship, strategic organizational guidance, and operational advisory to startup founders and expanding businesses.",
        "category": "Mentoring & Advisory",
        "skills": ["Leadership Mentoring", "Career Advisory", "Business Strategy", "Executive Coaching"],
        "pay": 25000, "work_mode": "both"
    },
    {
        "match_words": ["customer", "support", "call", "care", "reception", "desk", "telecall", "front office"],
        "title_template": "Senior Customer Care & Community Relations Coordinator",
        "summary_template": "Provide warm, patient, and empathetic voice and chat customer assistance to regional clients. Ergonomic desk setting with flexible half-day shifts.",
        "category": "Customer Support & Care",
        "skills": ["Customer Relations", "Communication", "Empathetic Listening", "Problem Resolution"],
        "pay": 14000, "work_mode": "both"
    },
    {
        "match_words": ["logistics", "pack", "order", "inventory", "stock", "dispatch", "festival", "gift box", "assembly"],
        "title_template": "Senior Operations & Festive Assembly Coordinator",
        "summary_template": "Coordinate light assembly, artisanal packaging, and quality checks for festive gift boxes and specialty retail orders. Clean, comfortable seated workspace.",
        "category": "Operations & Logistics",
        "skills": ["Packaging Quality", "Attention to Detail", "Inventory Coordination", "Order Dispatch"],
        "pay": 15000, "work_mode": "offline"
    }
]


async def parse_job_posting_gemini(raw_title: str, raw_description: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Call Gemini API to generate a dignified job posting."""
    if not settings.GEMINI_API_KEY:
        return None

    combined = f"{raw_title} {raw_description or ''}".strip()
    prompt = f"""You are a job posting expert for SilverHands, a platform that connects Indian senior citizens (60+) with dignified part-time work.

Given the raw job requirement: "{combined}"

Generate a senior-friendly, dignified job posting as JSON (no markdown wrapper):
{{
  "title": "A respectful, professional job title (max 10 words)",
  "summary": "A 2-3 sentence job description emphasizing dignity, flexible hours, ergonomic workspace, and zero heavy manual work",
  "category": "One of: Culinary & Cooking, Accounting & Finance, Tutoring & Academics, Handicrafts & Tailoring, Mentoring & Advisory, Customer Support & Care, Operations & Logistics",
  "required_skills": ["Skill1", "Skill2", "Skill3", "Skill4"],
  "suggested_pay": monthly_pay_in_INR_integer,
  "work_mode": "online or offline or both",
  "is_remote": true_or_false,
  "schedule": "e.g. Part-time (15-20 hrs/week)"
}}"""

    models = ["gemini-2.0-flash", "gemini-1.5-flash"]
    async with httpx.AsyncClient(timeout=12.0) as client:
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
            try:
                resp = await client.post(url, json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "response_mime_type": "application/json"}
                })
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_content = candidates[0]["content"]["parts"][0]["text"]
                        json_match = re.search(r"\{.*\}", text_content, re.DOTALL)
                        if json_match:
                            parsed = json.loads(json_match.group(0))
                            if "title" in parsed and "summary" in parsed:
                                is_remote = parsed.get("is_remote", False)
                                work_mode = parsed.get("work_mode", "offline")
                                return {
                                    "title": capitalize_title(str(parsed["title"])),
                                    "summary": capitalize_sentences(str(parsed["summary"])),
                                    "description": capitalize_sentences(str(parsed["summary"])),
                                    "category": parsed.get("category", "Mentoring & Advisory"),
                                    "extracted_skills": parsed.get("required_skills", ["Experience", "Communication"]),
                                    "required_skills": parsed.get("required_skills", ["Experience", "Communication"]),
                                    "suggested_pay": int(parsed.get("suggested_pay", 15000)),
                                    "work_mode": work_mode,
                                    "is_remote": is_remote,
                                    "work_type": "online" if is_remote else "part_time",
                                    "schedule": parsed.get("schedule", "Part-time (15-20 hrs/week)"),
                                    "dignity_approved": True,
                                    "dignity_notes": "Meets SilverHands Senior Dignity Standards.",
                                    "engine": "gemini_live"
                                }
            except Exception as ex:
                logger.warning(f"Gemini job AI ({model}): {ex}")
                continue
    return None


def parse_job_posting_fallback(raw_title: str, raw_description: Optional[str] = None) -> Dict[str, Any]:
    """Deterministic ontology fallback."""
    combined_text = (raw_title + " " + (raw_description or "")).strip()
    lower_t = combined_text.lower()

    matched_entry = None
    for entry in JOB_ONTOLOGY:
        for kw in entry["match_words"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', lower_t) or kw in lower_t:
                matched_entry = entry
                break
        if matched_entry:
            break

    if matched_entry:
        title_raw = matched_entry["title_template"] if len(raw_title.strip()) < 8 else raw_title.strip()
        summary_raw = matched_entry["summary_template"]
        category = matched_entry["category"]
        skills = matched_entry["skills"]
        pay = matched_entry["pay"]
        work_mode = matched_entry["work_mode"]
    else:
        clean_title = raw_title.strip().title() if raw_title.strip() else "Senior Specialist & Advisor"
        title_raw = clean_title
        summary_raw = combined_text[:200] if len(combined_text) > 20 else f"Flexible senior role for {clean_title}."
        category = "Mentoring & Advisory"
        skills = ["General Experience", "Communication", "Operations"]
        pay = 15000
        work_mode = "offline"

    is_remote = any(w in lower_t for w in ["online", "remote", "work from home", "wfh", "zoom", "virtual", "home"]) or work_mode == "online"

    return {
        "title": capitalize_title(title_raw),
        "summary": capitalize_sentences(summary_raw),
        "description": capitalize_sentences(summary_raw),
        "category": category,
        "extracted_skills": skills,
        "required_skills": skills,
        "suggested_pay": pay,
        "work_mode": "online" if is_remote else work_mode,
        "is_remote": is_remote,
        "work_type": "online" if is_remote else "part_time",
        "schedule": "Part-time (15-20 hrs/week)",
        "dignity_approved": True,
        "dignity_notes": "Meets SilverHands Senior Dignity Standards.",
        "engine": "ontology_fallback"
    }


class JobDescriptionAIEngine:
    @classmethod
    async def parse_job_posting(cls, raw_title: str, raw_description: Optional[str] = None) -> Dict[str, Any]:
        result = await parse_job_posting_gemini(raw_title, raw_description)
        if result:
            logger.info("Job posting generated via Gemini API")
            return result
        logger.warning("Gemini unavailable for job AI, using ontology fallback")
        return parse_job_posting_fallback(raw_title, raw_description)

job_description_ai = JobDescriptionAIEngine()

async def parse_job_posting(raw_text: str) -> Dict[str, Any]:
    return await job_description_ai.parse_job_posting(raw_text)
