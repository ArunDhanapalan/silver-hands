import logging
import json
import re
import os
from typing import Dict, Any, List
from app.config import settings

logger = logging.getLogger("silverhands.ai.product")

class ProductAIEngine:
    """
    AI catalog generator converting rough senior voice/text inputs into dignified product listings.
    """

    @classmethod
    def generate_listing(cls, raw_input: str) -> Dict[str, Any]:
        text_clean = (raw_input or "").strip()
        if not text_clean:
            return {
                "title": "Authentic Handcrafted Local Specialty",
                "description": "Handcrafted by experienced senior artisans using natural methods.",
                "category": "Festive Sweets & Snacks",
                "suggested_category": "Festive Sweets & Snacks",
                "suggested_price": 350,
                "price": 350,
                "unit": "Pack / Jar",
                "keywords": ["Handmade", "Traditional", "Artisanal", "Authentic"]
            }

        gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if gemini_key and gemini_key != "mock_gemini_key_for_testing" and len(gemini_key) > 20:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = f"""
Transform this raw product idea into an authentic Indian product listing:
Raw Input: "{text_clean}"

Return ONLY this JSON schema:
{{
  "title": "Enticing product title (e.g. Heritage Pure Ghee Mysore Pak, Sun-Dried Thanjavur Mango Pickle)",
  "description": "2-3 sentences highlighting traditional preparation, ingredients, and taste.",
  "category": "One of: Festive Sweets & Snacks, Food & Preserves, Tailoring & Apparel, Handicrafts & Decor, Gifting",
  "suggested_category": "One of: Festive Sweets & Snacks, Food & Preserves, Tailoring & Apparel, Handicrafts & Decor, Gifting",
  "suggested_price": 350,
  "unit": "e.g. 500g Box, 350g Jar, Piece",
  "keywords": ["4 tags"]
}}
"""
                response = model.generate_content(prompt)
                if response and response.text:
                    json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                    if json_match:
                        data = json.loads(json_match.group(0))
                        if "suggested_category" in data and "category" not in data:
                            data["category"] = data["suggested_category"]
                        if "category" in data and "suggested_category" not in data:
                            data["suggested_category"] = data["category"]
                        return data
            except Exception as e:
                logger.warning(f"Gemini product AI fallback: {e}")

        # Deterministic Fallback
        text = text_clean.lower()
        if any(w in text for w in ["mysore pak", "sweet", "laddu", "halwa", "gulab", "snack"]):
            return {
                "title": "Heritage Pure Ghee Festive Mysore Pak Box",
                "description": "Melt-in-mouth traditional festival delicacy made in pure cow ghee and hand-roasted gram flour using 4-decade old family recipes.",
                "category": "Festive Sweets & Snacks",
                "suggested_category": "Festive Sweets & Snacks",
                "suggested_price": 450,
                "unit": "500g Gift Box",
                "keywords": ["Mysore Pak", "Diwali Sweets", "Pure Ghee", "Traditional Food", "Festival Gift"]
            }
        elif any(w in text for w in ["pickle", "mavadu", "mango", "podi", "chutney", "masala"]):
            return {
                "title": "Sun-Dried Traditional Mango Pickle (Small-Batch Jar)",
                "description": "Small-batch, hand-cut tender green mangoes cured under natural sunlight in cold-pressed gingelly oil, roasted fenugreek, and ground mustard.",
                "category": "Food & Preserves",
                "suggested_category": "Food & Preserves",
                "suggested_price": 280,
                "unit": "350g Jar",
                "keywords": ["Mango Pickle", "Mavadu", "Homemade Preserves", "Cold Pressed Oil", "South Indian"]
            }
        elif any(w in text for w in ["blouse", "tailor", "stitch", "embroidery", "kurti"]):
            return {
                "title": "Custom Tailored Silk Saree Blouse with Maggam Embellishment",
                "description": "Bespoke handcrafted saree blouse with precision neck drafting, reinforced piping, and intricate festive sleeve borders.",
                "category": "Tailoring & Apparel",
                "suggested_category": "Tailoring & Apparel",
                "suggested_price": 1200,
                "unit": "Piece",
                "keywords": ["Custom Tailoring", "Saree Blouse", "Maggam Work", "Festive Wear", "Ethnic Fashion"]
            }
        else:
            return {
                "title": f"Authentic Homemade {text_clean.title()}",
                "description": f"Carefully handcrafted {text_clean} prepared with authentic traditional ingredients and unmatched senior care.",
                "category": "Food & Preserves",
                "suggested_category": "Food & Preserves",
                "suggested_price": 300,
                "unit": "Pack",
                "keywords": ["Handmade", "Traditional", "Artisanal", "Authentic"]
            }

product_ai = ProductAIEngine()
