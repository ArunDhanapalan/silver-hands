import logging
from typing import Dict, Any, List

logger = logging.getLogger("silverhands.ai.product")

class ProductAIEngine:
    """
    AI catalog generator converting rough senior voice/text inputs into dignified product listings.
    """

    @classmethod
    def generate_listing(cls, raw_input: str) -> Dict[str, Any]:
        text = raw_input.lower()
        
        if "mysore pak" in text or "sweet" in text or "laddu" in text or "halwa" in text:
            return {
                "title": "Heritage Pure Ghee Festival Mysore Pak Box",
                "description": "Melt-in-mouth traditional festival delicacy made in pure cow ghee and hand-roasted gram flour using 4-decade old family recipes.",
                "category": "Festive Sweets & Snacks",
                "suggested_price": 450,
                "unit": "500g Gift Box",
                "keywords": ["Mysore Pak", "Diwali Sweets", "Pure Ghee", "Traditional Food", "Festival Gift"]
            }
        elif "pickle" in text or "mavadu" in text or "mango" in text or "podi" in text:
            return {
                "title": "Sun-Dried Thanjavur Mango Pickle (Mavadu)",
                "description": "Small-batch, hand-cut tender green mangoes cured under natural sunlight in cold-pressed gingelly oil, roasted fenugreek, and ground mustard.",
                "category": "Food & Preserves",
                "suggested_price": 280,
                "unit": "350g Jar",
                "keywords": ["Mango Pickle", "Mavadu", "Homemade Preserves", "Cold Pressed Oil", "South Indian"]
            }
        elif "blouse" in text or "tailor" in text or "stitch" in text or "embroidery" in text:
            return {
                "title": "Custom Tailored Silk Saree Blouse with Maggam Embellishment",
                "description": "Bespoke handcrafted saree blouse with precision neck drafting, reinforced piping, and intricate festive sleeve borders.",
                "category": "Tailoring & Apparel",
                "suggested_price": 1200,
                "unit": "Piece",
                "keywords": ["Custom Tailoring", "Saree Blouse", "Maggam Work", "Festive Wear", "Ethnic Fashion"]
            }
        elif "potli" in text or "bag" in text or "gift" in text or "decor" in text:
            return {
                "title": "Handcrafted Raw Silk Festive Potli Bags (Set of 3)",
                "description": "Exquisite raw silk drawstring gift pouches with golden zari threadwork, ideal for wedding return favors and festive gifting.",
                "category": "Handicrafts & Decor",
                "suggested_price": 350,
                "unit": "Set of 3",
                "keywords": ["Potli Bags", "Silk Pouches", "Handmade Gifting", "Wedding Favors"]
            }
        else:
            return {
                "title": "Handmade Heritage Goods",
                "description": "Carefully handcrafted local product prepared using authentic traditional methods and clean natural ingredients.",
                "category": "Handicrafts & Decor",
                "suggested_price": 350,
                "unit": "Piece",
                "keywords": ["Handmade", "Traditional", "Artisanal", "Local"]
            }

product_ai = ProductAIEngine()
