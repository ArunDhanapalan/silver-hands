import json
import logging
import re
from typing import Optional, Dict, Any, List
import httpx
from app.config import settings

logger = logging.getLogger("silverhands.ai.skill_extraction")

# Rich deterministic keyword/domain taxonomies for Indian languages & stories
SKILL_TAXONOMY = {
    "accounting": {
        "keywords": ["account", "accountant", "gst", "excel", "tally", "ledger", "bookkeeping", "audit", "tax", "balance sheet", "kanakku", "hisaab", "lekha"],
        "explicit": ["Accounting", "Bookkeeping", "Excel Data Management", "GST Basics"],
        "inferred": [
            {"skill": "Small Business Advisory", "reason": "Derived from experience maintaining accounts and financial records for small enterprises."},
            {"skill": "Financial Mentoring", "reason": "Able to guide young business owners and entrepreneurs on budgeting and compliance."}
        ],
        "categories": ["Accounting & Finance", "Mentoring & Consulting", "Online Tutoring"],
        "suggested_title": "MSME Bookkeeping & Financial Mentoring",
        "keywords_gen": ["Accounting", "Excel", "GST", "Bookkeeping", "Mentoring", "Financial Consulting"]
    },
    "cooking": {
        "keywords": ["cook", "cooking", "pickle", "sweets", "food", "kitchen", "recipe", "samayal", "khana", "podi", "masala", "catering", "vangi", "bhojan", "tiffin"],
        "explicit": ["Traditional Cooking", "Pickles & Preserves", "Spice Blends", "Diwali & Festival Sweets"],
        "inferred": [
            {"skill": "Small-Batch Food Venture", "reason": "Longstanding mastery in preparing authentic homemade foods with traditional recipes."},
            {"skill": "Culinary Masterclasses", "reason": "Capable of teaching regional cuisine and heritage culinary techniques."}
        ],
        "categories": ["Food & Beverages", "Workshops & Classes", "Festival Products"],
        "suggested_title": "Authentic Traditional Food & Culinary Workshops",
        "keywords_gen": ["Traditional Cooking", "Homemade Pickles", "Diwali Sweets", "Culinary Classes", "Heritage Food"]
    },
    "tailoring": {
        "keywords": ["tailor", "tailoring", "stitch", "sewing", "embroidery", "aari", "blouse", "dress", "alteration", "cloth", "garment", "thaika", "silai", "kapda"],
        "explicit": ["Bespoke Tailoring", "Aari & Zari Embroidery", "Garment Alterations", "Pattern Cutting"],
        "inferred": [
            {"skill": "Custom Festival Wardrobe Design", "reason": "Skilled in fitting and crafting festive ethnic wear and bespoke blouses."},
            {"skill": "Handicraft Teaching", "reason": "Can train beginners in traditional sewing and embroidery techniques."}
        ],
        "categories": ["Tailoring & Crafts", "Alterations & Fitting", "Teaching & Workshops"],
        "suggested_title": "Custom Tailoring & Traditional Embroidery",
        "keywords_gen": ["Tailoring", "Embroidery", "Saree Blouse", "Alterations", "Aari Work", "Handmade Apparels"]
    },
    "tutoring": {
        "keywords": ["teach", "teacher", "tuition", "tutor", "maths", "science", "english", "tamil", "telugu", "hindi", "school", "student", "padhai", "karpithal", "bodhana"],
        "explicit": ["Language Tuition", "Academic Tutoring", "Concept Clarification", "Student Mentoring"],
        "inferred": [
            {"skill": "1-on-1 Online Guru", "reason": "Patient pedagogical communication style suited for structured remote lessons."},
            {"skill": "Bilingual Instruction", "reason": "Able to explain complex subjects in mother tongue and English."}
        ],
        "categories": ["Education & Tutoring", "Language Learning", "Mentoring"],
        "suggested_title": "Online Language & Academic Tutoring",
        "keywords_gen": ["Language Tutor", "Academic Tuition", "Tamil Tutoring", "Telugu Tutoring", "Concept Mentoring"]
    },
    "gardening": {
        "keywords": ["garden", "gardening", "plants", "nursery", "terrace garden", "organic", "vegetables", "seeds", "compost", "thottam", "bagicha"],
        "explicit": ["Terrace Gardening", "Organic Composting", "Plant Care & Propagation", "Kitchen Garden Design"],
        "inferred": [
            {"skill": "Urban Green Consultation", "reason": "Decades of hands-on botanical and terrace cultivation knowledge."},
            {"skill": "Weekend Gardening Workshops", "reason": "Can guide local residents on maintaining organic vegetable plots."}
        ],
        "categories": ["Home & Gardening", "Consultation", "Workshops"],
        "suggested_title": "Urban Terrace & Organic Gardening Guidance",
        "keywords_gen": ["Gardening", "Terrace Garden", "Organic Vegetables", "Plant Care", "Composting"]
    }
}

async def analyze_life_story(story_text: str, language: str = "en") -> Dict[str, Any]:
    """
    Extracts structured skill profile, inferred transferable skills, keywords, and bio.
    Uses Gemini API if configured; falls back gracefully to high-accuracy deterministic extraction.
    """
    if not story_text or len(story_text.strip()) < 5:
        story_text = "Experienced professional ready to offer skills and mentor others."

    # Try Live Gemini LLM if API key is provided
    if settings.GEMINI_API_KEY:
        try:
            llm_result = await _call_gemini_skill_extraction(story_text, language)
            if llm_result:
                return llm_result
        except Exception as e:
            logger.warning("Gemini AI API call failed or timed out: %s. Activating deterministic fallback.", str(e))

    # Resilient Deterministic NLP Extraction
    return _deterministic_skill_extraction(story_text, language)


async def _call_gemini_skill_extraction(story_text: str, language: str) -> Optional[Dict[str, Any]]:
    prompt = f"""
You are an expert livelihood & career discovery AI for SilverHands, empowering Indian senior citizens, retired professionals, and homemakers.
Analyze the following natural spoken or typed life story (Spoken Language: {language}):

"{story_text}"

Extract the following JSON structure strictly with no markdown wrapper or backticks:
{{
  "explicit_skills": ["Skill 1", "Skill 2", ...],
  "inferred_skills": [
    {{"skill": "Skill Name", "reason": "Concise explanation of why this was inferred from their life story"}},
    ...
  ],
  "keywords": ["Keyword 1", "Keyword 2", ...],
  "bio": "A dignified, warm, 2-3 sentence first-person or third-person summary highlighting their lifelong strengths and readiness to help locally.",
  "recommended_categories": ["Category 1", "Category 2"],
  "suggested_service_product_title": "A short, appealing title for a service or product they could offer"
}}
"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(url, json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"}
        })
        if resp.status_code == 200:
            data = resp.json()
            text_content = data["candidates"][0]["content"]["parts"][0]["text"]
            clean_json = re.sub(r"^```json\s*", "", text_content.strip())
            clean_json = re.sub(r"\s*```$", "", clean_json)
            return json.loads(clean_json)
    return None


def _deterministic_skill_extraction(story_text: str, language: str) -> Dict[str, Any]:
    text_lower = story_text.lower()
    matched_domains = []
    
    for domain_name, data in SKILL_TAXONOMY.items():
        score = sum(1 for kw in data["keywords"] if kw in text_lower)
        if score > 0:
            matched_domains.append((domain_name, score, data))

    # Sort by relevance match score
    matched_domains.sort(key=lambda x: x[1], reverse=True)

    if not matched_domains:
        # General consulting / mentoring default
        matched_domains = [("accounting", 1, SKILL_TAXONOMY["accounting"])]

    primary_domain = matched_domains[0][2]
    
    explicit_skills = list(primary_domain["explicit"])
    inferred_skills = list(primary_domain["inferred"])
    keywords = list(primary_domain["keywords_gen"])
    categories = list(primary_domain["categories"])

    # If secondary match exists, merge complementary skills
    if len(matched_domains) > 1:
        sec_domain = matched_domains[1][2]
        explicit_skills.extend(sec_domain["explicit"][:2])
        inferred_skills.extend(sec_domain["inferred"][:1])
        keywords.extend(sec_domain["keywords_gen"][:3])
        categories.extend(sec_domain["categories"][:1])

    # Deduplicate
    explicit_skills = list(dict.fromkeys(explicit_skills))
    keywords = list(dict.fromkeys(keywords))
    categories = list(dict.fromkeys(categories))

    # Generate dignified bio
    snippet = story_text[:120].strip()
    if len(story_text) > 120:
        snippet += "..."
    bio = f"Experienced practitioner offering seasoned expertise in {', '.join(explicit_skills[:3])}. Dedicated to high-quality local assistance, bookable sessions, and practical mentorship."

    return {
        "explicit_skills": explicit_skills,
        "inferred_skills": inferred_skills,
        "keywords": keywords,
        "bio": bio,
        "recommended_categories": categories,
        "suggested_service_product_title": primary_domain["suggested_title"],
        "analysis_engine": "hybrid_nlp_engine"
    }

class LifeToSkillAIEngine:
    async def extract_skills(self, story_text: str, language: str = "en"):
        from app.schemas.senior import StoryAnalysisResponse, InferredSkillItem
        res = await analyze_life_story(story_text, language)
        return StoryAnalysisResponse(
            explicit_skills=res["explicit_skills"],
            inferred_skills=[InferredSkillItem(**i) if isinstance(i, dict) else i for i in res["inferred_skills"]],
            keywords=res["keywords"],
            bio=res["bio"],
            recommended_categories=res["recommended_categories"],
            suggested_service_product_title=res["suggested_service_product_title"],
            analysis_engine=res.get("analysis_engine", "hybrid_nlp_engine")
        )

life_to_skill_ai = LifeToSkillAIEngine()
