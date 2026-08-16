import json
import logging
import re
from typing import Optional, Dict, Any, List
import httpx
from app.config import settings

logger = logging.getLogger("silverhands.ai.skill_extraction")

# Deterministic fallback taxonomy (used only when Gemini API is unreachable)
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
        "keywords_gen": ["Accounting", "Excel", "GST", "Bookkeeping", "Mentoring", "Financial Consulting"],
        "service_idea": {
            "title": "MSME Fractional Accounting & GST Advisory Session",
            "description": "Expert one-on-one financial health consultation, ledger reconciliation, and GST compliance review for micro-enterprises and startups. Guided by over 30 years of accounting experience.",
            "category": "Knowledge & Mentoring",
            "price_range": "₹600–₹1,000 / session",
            "duration": "60 mins",
            "mode": "online"
        },
        "product_idea": {
            "title": "GST & Small Business Bookkeeping Starter Kit",
            "description": "Comprehensive downloadable Excel templates, GST filing checklists, and accounting workflow guides curated from decades of professional accounting experience.",
            "category": "Digital Products",
            "price": 499,
            "unit": "Digital Kit"
        }
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
        "keywords_gen": ["Traditional Cooking", "Homemade Pickles", "Diwali Sweets", "Culinary Classes", "Heritage Food"],
        "service_idea": {
            "title": "Heritage Regional Culinary Masterclass & Spice Secrets",
            "description": "Step-by-step culinary instruction on authentic heirloom recipes, secret spice proportions, and natural food preservation techniques perfected over generations.",
            "category": "Home & Practical Skills",
            "price_range": "₹400–₹600 / session",
            "duration": "60 mins",
            "mode": "both"
        },
        "product_idea": {
            "title": "Heritage Pure Cow Ghee Festive Sweet Box",
            "description": "Traditional melt-in-mouth sweets handcrafted in small batches using pure cow ghee, stone-ground flour, and authentic family recipes. Zero artificial colors or preservatives.",
            "category": "Festive Sweets & Snacks",
            "price": 450,
            "unit": "500g Gift Box"
        }
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
        "keywords_gen": ["Tailoring", "Embroidery", "Saree Blouse", "Alterations", "Aari Work", "Handmade Apparels"],
        "service_idea": {
            "title": "Custom Saree Blouse Stitching & Aari Embroidery Workshop",
            "description": "Learn precision blouse drafting, neckline design, piping techniques, and intricate Aari/Zari embroidery from a master tailor with decades of experience.",
            "category": "Home & Practical Skills",
            "price_range": "₹500–₹800 / session",
            "duration": "60 mins",
            "mode": "offline"
        },
        "product_idea": {
            "title": "Custom Tailored Saree Blouse with Handcrafted Embroidery",
            "description": "Bespoke handcrafted ethnic wear featuring precision neckline drafting, reinforced piping, and intricate Aari embroidery. Perfectly tailored to individual measurements.",
            "category": "Tailoring & Apparel",
            "price": 1200,
            "unit": "Piece"
        }
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
        "keywords_gen": ["Language Tutor", "Academic Tuition", "Tamil Tutoring", "Telugu Tutoring", "Concept Mentoring"],
        "service_idea": {
            "title": "1-on-1 Conversational Language Fluency & Academic Tutoring",
            "description": "Patient, structured 1-on-1 coaching in spoken languages and academic subjects. Focuses on conversational fluency, concept clarity, and exam preparation for students of all ages.",
            "category": "Education & Learning",
            "price_range": "₹400–₹600 / session",
            "duration": "45 mins",
            "mode": "online"
        },
        "product_idea": {
            "title": "Bilingual Study Guide & Vocabulary Flashcard Pack",
            "description": "Expertly curated bilingual study materials including vocabulary flashcards, grammar worksheets, and practice exercises designed by an experienced educator.",
            "category": "Digital Products",
            "price": 299,
            "unit": "Digital Pack"
        }
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
        "keywords_gen": ["Gardening", "Terrace Garden", "Organic Vegetables", "Plant Care", "Composting"],
        "service_idea": {
            "title": "Urban Terrace Garden Setup & Organic Farming Consultation",
            "description": "Hands-on guidance for setting up thriving terrace gardens, organic composting systems, and kitchen vegetable plots with decades of botanical expertise.",
            "category": "Home & Practical Skills",
            "price_range": "₹500–₹800 / session",
            "duration": "60 mins",
            "mode": "both"
        },
        "product_idea": {
            "title": "Organic Heirloom Seed Collection & Composting Starter Kit",
            "description": "Curated collection of heritage vegetable and herb seeds with natural compost starter mix and a comprehensive growing guide from an experienced urban gardener.",
            "category": "Plants & Gardening",
            "price": 350,
            "unit": "Kit"
        }
    }
}


async def analyze_life_story(story_text: str, language: str = "en") -> Dict[str, Any]:
    """
    Extracts structured skill profile, inferred transferable skills, keywords, bio,
    AND launchpad product/service ideas using Gemini AI.
    Falls back to deterministic extraction only when API is unavailable.
    """
    if not story_text or len(story_text.strip()) < 5:
        story_text = "Experienced professional ready to offer skills and mentor others."

    # Always try Gemini AI first when API key exists
    if settings.GEMINI_API_KEY:
        try:
            llm_result = await _call_gemini_skill_extraction(story_text, language)
            if llm_result:
                logger.info("Skill extraction + launchpad ideas generated via Gemini AI (engine: gemini_live)")
                return llm_result
        except Exception as e:
            logger.warning("Gemini AI API call failed: %s. Using deterministic fallback.", str(e))

    # Deterministic fallback only when Gemini is unavailable
    logger.warning("Gemini API unavailable — using deterministic skill extraction fallback")
    return _deterministic_skill_extraction(story_text, language)


async def _call_gemini_skill_extraction(story_text: str, language: str) -> Optional[Dict[str, Any]]:
    """
    Calls Gemini API to extract explicit skills, hidden/inferred skills,
    keywords, bio, AND personalized launchpad service + product ideas.
    """
    prompt = f"""You are an expert livelihood & career discovery AI for SilverHands, a platform empowering Indian senior citizens, retired professionals, and homemakers to earn dignified income from their life experience.

Analyze the following natural spoken or typed life story (Spoken Language: {language}):

"{story_text}"

You must extract TWO categories of skills:
1. EXPLICIT SKILLS — skills directly stated or clearly implied (e.g. "I did accounting" → Accounting, Bookkeeping)
2. HIDDEN/INFERRED SKILLS — transferable capabilities not directly stated but derivable from their experience (e.g. an accountant also has "Small Business Advisory", "Financial Mentoring", "Attention to Detail", "Data Organization")

Additionally, generate personalized LAUNCHPAD IDEAS — a managed service they could offer AND a product they could sell on SilverHands marketplace, based on their skills.

Return the following JSON structure strictly with no markdown wrapper:
{{
  "explicit_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  "inferred_skills": [
    {{"skill": "Hidden Skill Name", "reason": "Specific sentence explaining how their life experience translates to this capability"}},
    {{"skill": "Hidden Skill 2", "reason": "Reason derived from their background"}},
    {{"skill": "Hidden Skill 3", "reason": "Reason"}}
  ],
  "keywords": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5"],
  "bio": "A dignified, warm, 2-3 sentence summary highlighting their lifelong strengths and readiness to contribute locally.",
  "recommended_categories": ["Category 1", "Category 2"],
  "suggested_service_product_title": "A short, appealing title for a service or product they could offer",
  "launchpad_service_idea": {{
    "title": "A compelling managed service title they could offer (e.g. '1-on-1 Conversational Telugu Fluency Masterclass')",
    "description": "2-3 sentence rich description of the service, what the student/customer gets, and why this senior is uniquely qualified.",
    "category": "One of: Education & Learning, Knowledge & Mentoring, Home & Practical Skills, Culture & Tradition, Family & Care",
    "price_range": "Suggested price range in INR (e.g. '₹400–₹800 / session')",
    "duration": "Session duration (e.g. '45 mins')",
    "mode": "online or offline or both"
  }},
  "launchpad_product_idea": {{
    "title": "A compelling product title they could sell (e.g. 'Heritage Pure Ghee Mysore Pak Gift Box')",
    "description": "2-3 sentence rich description of the product highlighting authenticity, traditional methods, and quality.",
    "category": "One of: Festive Sweets & Snacks, Food & Preserves, Tailoring & Apparel, Handicrafts & Decor, Plants & Gardening, Digital Products, Gifting",
    "price": suggested_price_in_INR_integer,
    "unit": "e.g. 500g Box, 350g Jar, Piece, Set of 3, Digital Pack"
  }}
}}

IMPORTANT RULES:
- Extract at least 3-5 explicit skills and 2-4 hidden/inferred skills.
- Hidden skills should be genuinely transferable capabilities, not just rephrased explicit skills.
- Launchpad ideas must be realistic, achievable, and directly connected to the person's background.
- For the service idea, think about what they could teach, mentor, or consult on.
- For the product idea, think about what they could make, craft, or prepare at home to sell.
- All prices should be in Indian Rupees and appropriate for the Indian senior citizen market.
- The bio should be warm, dignified, and empowering — never patronizing."""

    models = ["gemini-2.5-flash", "gemini-2.5-pro"]

    async with httpx.AsyncClient(timeout=20.0) as client:
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
                            if "explicit_skills" in parsed and "bio" in parsed:
                                return _normalize_gemini_response(parsed)
                else:
                    logger.warning("Gemini API returned status %d for model %s", resp.status_code, model)
            except Exception as ex:
                logger.warning("Error calling %s: %s", model, ex)
                continue
    return None


def _normalize_gemini_response(parsed: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize and validate the Gemini API response into a clean structure."""
    # Normalize inferred skills
    inferred = []
    for item in parsed.get("inferred_skills", []):
        if isinstance(item, dict) and "skill" in item:
            inferred.append({
                "skill": str(item["skill"]),
                "reason": str(item.get("reason", "Inferred from your career background"))
            })
        elif isinstance(item, str):
            inferred.append({
                "skill": item,
                "reason": "Derived from your life story"
            })
    parsed["inferred_skills"] = inferred

    # Normalize launchpad_service_idea
    service_idea = parsed.get("launchpad_service_idea")
    if isinstance(service_idea, dict) and service_idea.get("title"):
        parsed["launchpad_service_idea"] = {
            "title": str(service_idea.get("title", "")),
            "description": str(service_idea.get("description", "")),
            "category": str(service_idea.get("category", "Education & Learning")),
            "price_range": str(service_idea.get("price_range", "₹400–₹800 / session")),
            "duration": str(service_idea.get("duration", "45 mins")),
            "mode": str(service_idea.get("mode", "online"))
        }
    else:
        parsed["launchpad_service_idea"] = None

    # Normalize launchpad_product_idea
    product_idea = parsed.get("launchpad_product_idea")
    if isinstance(product_idea, dict) and product_idea.get("title"):
        price_val = product_idea.get("price", 350)
        if isinstance(price_val, str):
            price_val = int(re.sub(r'[^\d]', '', price_val) or '350')
        parsed["launchpad_product_idea"] = {
            "title": str(product_idea.get("title", "")),
            "description": str(product_idea.get("description", "")),
            "category": str(product_idea.get("category", "Food & Preserves")),
            "price": int(price_val),
            "unit": str(product_idea.get("unit", "Pack"))
        }
    else:
        parsed["launchpad_product_idea"] = None

    parsed["analysis_engine"] = "gemini_live"
    return parsed


def _deterministic_skill_extraction(story_text: str, language: str) -> Dict[str, Any]:
    """Deterministic fallback using keyword taxonomy when Gemini is unavailable."""
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
    bio = f"Experienced practitioner offering seasoned expertise in {', '.join(explicit_skills[:3])}. Dedicated to high-quality local assistance, bookable sessions, and practical mentorship."

    return {
        "explicit_skills": explicit_skills,
        "inferred_skills": inferred_skills,
        "keywords": keywords,
        "bio": bio,
        "recommended_categories": categories,
        "suggested_service_product_title": primary_domain["suggested_title"],
        "launchpad_service_idea": primary_domain.get("service_idea"),
        "launchpad_product_idea": primary_domain.get("product_idea"),
        "analysis_engine": "hybrid_nlp_engine"
    }


class LifeToSkillAIEngine:
    async def extract_skills(self, story_text: str, language: str = "en"):
        from app.schemas.senior import StoryAnalysisResponse, InferredSkillItem, LaunchpadServiceIdea, LaunchpadProductIdea
        res = await analyze_life_story(story_text, language)

        service_idea = None
        if res.get("launchpad_service_idea"):
            service_idea = LaunchpadServiceIdea(**res["launchpad_service_idea"])

        product_idea = None
        if res.get("launchpad_product_idea"):
            product_idea = LaunchpadProductIdea(**res["launchpad_product_idea"])

        return StoryAnalysisResponse(
            explicit_skills=res["explicit_skills"],
            inferred_skills=[InferredSkillItem(**i) if isinstance(i, dict) else i for i in res["inferred_skills"]],
            keywords=res["keywords"],
            bio=res["bio"],
            recommended_categories=res["recommended_categories"],
            suggested_service_product_title=res["suggested_service_product_title"],
            launchpad_service_idea=service_idea,
            launchpad_product_idea=product_idea,
            analysis_engine=res.get("analysis_engine", "hybrid_nlp_engine")
        )

life_to_skill_ai = LifeToSkillAIEngine()
