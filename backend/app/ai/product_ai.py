import logging
import re
from typing import Dict, Any, List
from app.ai.nlp_utils import capitalize_title, capitalize_sentences

logger = logging.getLogger("silverhands.ai.product")

class ProductNLPEngine:
    """
    High-accuracy domain ontology NLP engine for Indian cultural products, 
    sweets, pickles, spices, handicrafts, and tailoring.
    """

    ONTOLOGY = [
        {
            "match_words": ["mysore pak", "sweet", "laddu", "halwa", "gulab jamun", "peda", "kaju katli", "barfi", "mithai", "jangiri"],
            "title_template": "Heritage Pure Cow Ghee Festive {item} Box",
            "desc_template": "Traditional melt-in-mouth {item} handcrafted in small batches using pure cow ghee, stone-ground flour, and authentic family recipes passed down over four decades. Zero artificial colors or chemical preservatives.",
            "category": "Festive Sweets & Snacks",
            "unit": "500g Gift Box",
            "price": 450,
            "keywords": ["Festive Sweets", "Pure Ghee", "Handmade Mithai", "Traditional Delicacy", "Diwali Gift"]
        },
        {
            "match_words": ["pickle", "mavadu", "avakkai", "mango", "podi", "chutney", "masala", "curry powder", "rasam powder", "sambar powder", "idli podi", "thokku", "lime pickle", "garlic pickle"],
            "title_template": "Sun-Dried Traditional {item} (Cold-Pressed Sesame Oil)",
            "desc_template": "Small-batch, sun-cured traditional {item} prepared with hand-selected ingredients, roasted fenugreek, mustard seeds, and cold-pressed gingelly oil. Naturally preserved without artificial additives.",
            "category": "Food & Preserves",
            "unit": "350g Jar",
            "price": 280,
            "keywords": ["Homemade Pickle", "Sun Dried", "Traditional Masala", "Cold Pressed Oil", "Authentic Preserves"]
        },
        {
            "match_words": ["blouse", "tailor", "stitch", "embroidery", "kurti", "dress", "saree blouse", "aari work", "maggam", "zari"],
            "title_template": "Custom Tailored Saree Blouse with Handcrafted {item}",
            "desc_template": "Bespoke handcrafted ethnic wear featuring precision neckline drafting, reinforced piping, and intricate {item}. Perfectly tailored to individual measurements for weddings and festive occasions.",
            "category": "Tailoring & Apparel",
            "unit": "Piece",
            "price": 1200,
            "keywords": ["Custom Tailoring", "Bespoke Blouse", "Aari Embroidery", "Festive Wear", "Ethnic Fashion"]
        },
        {
            "match_words": ["potli", "bag", "gift", "pouch", "box", "hamper", "favors", "tote"],
            "title_template": "Handcrafted Raw Silk Festive {item} (Set of 3)",
            "desc_template": "Exquisite raw silk drawstring {item} adorned with golden zari threadwork and beaded tassels. Ideal for wedding return gifts, puja packaging, and festival hampers.",
            "category": "Handicrafts & Decor",
            "unit": "Set of 3",
            "price": 350,
            "keywords": ["Raw Silk Potli", "Handmade Gifting", "Wedding Favors", "Festive Hampers"]
        },
        {
            "match_words": ["diya", "candle", "toran", "rangoli", "brass", "puja", "incense", "agarbathi", "decor", "urli"],
            "title_template": "Traditional Hand-Embellished {item} Decor Set",
            "desc_template": "Artisan-crafted festive home decor item prepared using natural terracotta, brass accents, and eco-friendly organic materials.",
            "category": "Handicrafts & Decor",
            "unit": "Set of 2",
            "price": 400,
            "keywords": ["Festive Decor", "Handmade Diya", "Puja Essentials", "Eco Friendly"]
        },
        {
            "match_words": ["soap", "oil", "herbal", "hair oil", "shikakai", "ubtan", "nalangu maavu", "turmeric", "neem"],
            "title_template": "All-Natural Cold-Processed Herbal {item}",
            "desc_template": "Traditional Ayurvedic skincare and wellness preparation made with natural cold-pressed botanicals, sun-dried herbs, and zero synthetic fragrances.",
            "category": "Food & Preserves",
            "unit": "200g Pack",
            "price": 250,
            "keywords": ["Herbal Wellness", "Ayurvedic Care", "Cold Processed", "Chemical Free"]
        }
    ]

    @classmethod
    def generate_listing(cls, raw_input: str) -> Dict[str, Any]:
        text_clean = (raw_input or "").strip()
        lower_t = text_clean.lower()

        # Find best matching ontology entry
        matched_entry = None
        detected_keyword = ""

        for entry in cls.ONTOLOGY:
            for kw in entry["match_words"]:
                if re.search(r'\b' + re.escape(kw) + r'\b', lower_t) or kw in lower_t:
                    matched_entry = entry
                    detected_keyword = kw
                    break
            if matched_entry:
                break

        if matched_entry:
            item_name = detected_keyword.title()
            title_raw = matched_entry["title_template"].replace("{item}", item_name)
            desc_raw = matched_entry["desc_template"].replace("{item}", item_name.lower())
            category = matched_entry["category"]
            price = matched_entry["price"]
            unit = matched_entry["unit"]
            keywords = matched_entry["keywords"]
        else:
            # Clean fallback using user's words
            clean_item = text_clean.title() if len(text_clean) < 30 else text_clean[:30].title()
            title_raw = f"Authentic Homemade {clean_item}"
            desc_raw = f"Carefully handcrafted {text_clean} prepared in small batches using traditional authentic methods and clean natural ingredients. Prepared with unmatched senior dedication."
            category = "Food & Preserves"
            price = 350
            unit = "Pack"
            keywords = ["Handmade", "Traditional", "Artisanal", "Authentic"]

        # CAPITALISE TITLE AND DESCRIPTIONS
        title = capitalize_title(title_raw)
        description = capitalize_sentences(desc_raw)

        return {
            "title": title,
            "description": description,
            "category": category,
            "suggested_category": category,
            "price": price,
            "suggested_price": price,
            "unit": unit,
            "keywords": keywords
        }

product_ai = ProductNLPEngine()
