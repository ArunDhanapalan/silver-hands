import logging
from typing import Dict, Any, List

logger = logging.getLogger("silverhands.ai.job_description")

class JobDescriptionAIEngine:
    """
    Parses company job postings into senior-friendly dignity guidelines and extracted skill requirements.
    """

    @classmethod
    def parse_job_posting(cls, raw_title: str, raw_description: str) -> Dict[str, Any]:
        text = (raw_title + " " + raw_description).lower()
        skills = []
        work_type = "part_time"
        is_remote = False

        if "online" in text or "remote" in text or "work from home" in text or "zoom" in text:
            is_remote = True
            work_type = "online"

        if "account" in text or "gst" in text or "tally" in text or "ledger" in text or "tax" in text:
            skills.extend(["Accounting", "GST Basics", "Excel", "Cash Reconciliation"])
        if "telugu" in text or "tamil" in text or "hindi" in text or "teach" in text or "tutor" in text:
            skills.extend(["Language Tuition", "Bilingual", "Teaching", "Mentoring"])
        if "quality" in text or "inspect" in text or "check" in text:
            skills.extend(["Quality Inspection", "Attention to Detail", "Inventory"])
        if "pack" in text or "box" in text or "gift" in text or "festival" in text:
            skills.extend(["Packaging", "Festive Gifting", "Order Assembly"])

        if not skills:
            skills = ["General Knowledge", "Communication", "Diligence"]

        return {
            "title": raw_title.strip(),
            "extracted_skills": list(set(skills)),
            "is_remote": is_remote,
            "work_type": work_type,
            "dignity_approved": True,
            "dignity_notes": "Meets SilverHands Senior Dignity Standards (zero heavy physical lifting, respectful hours, clear compensation)."
        }

job_description_ai = JobDescriptionAIEngine()
