import datetime
import logging
from typing import Dict, Any, List, Optional
from app.schemas.festival import FestivalInfo, FestivalCalendarResponse

logger = logging.getLogger("silverhands.festival_service")

FESTIVALS_DATA = [
    {
        "id": "milad_un_nabi",
        "name": "Milad-un-Nabi / Id-e-Milad",
        "icon": "🌙",
        "date": "2026-08-26",
        "primary_regions": ["All India", "Telangana", "Kerala", "Uttar Pradesh", "Tamil Nadu"],
        "banner_theme": "emerald-green",
        "greeting": {
            "en": "Eid Milad-un-Nabi Mubarak! Celebrating the Prophet's birthday with love and peace.",
            "hi": "ईद मिलाद-उन-नबी मुबारक!",
            "ta": "நபிகள் நாயகம் பிறந்த நாள் வாழ்த்துகள்!",
            "ur": "عید میلاد النبی مبارک!"
        },
        "key_categories": ["Sheer Khurma & Sweets", "Attar & Gifting", "Festive Kurta & Apparel", "Biryani Catering"],
        "surge_multiplier": 1.20,
        "senior_suggestions": ["Prepare traditional sheer khurma and biryani for local orders", "Offer festive kurta stitching services", "Create gift hampers with attar and sweets"],
        "customer_suggestions": ["Order authentic sheer khurma from local seniors", "Book festive kurta tailoring", "Buy handmade gift hampers"]
    },
    {
        "id": "janmashtami",
        "name": "Janmashtami",
        "icon": "🪈",
        "date": "2026-09-04",
        "primary_regions": ["All India", "Maharashtra", "Uttar Pradesh", "Gujarat", "Tamil Nadu"],
        "banner_theme": "festive-blue",
        "greeting": {
            "en": "Happy Krishna Janmashtami! May Lord Krishna bless you with joy.",
            "hi": "जन्माष्टमी की हार्दिक शुभकामनाएँ!",
            "ta": "கிருஷ்ண ஜெயந்தி நல்வாழ்த்துகள்!",
            "te": "కృష్ణ జన్మాష్టమి శుభాకాంక్షలు!",
            "mr": "श्रीकृष्ण जन्माष्टमीच्या हार्दिक शुभेच्छा!"
        },
        "key_categories": ["Festive Sweets & Snacks", "Puja Essentials", "Handicrafts & Decor", "Traditional Apparel"],
        "surge_multiplier": 1.25,
        "senior_suggestions": ["Make butter-based sweets like peda and makhana laddu", "Create decorative jhankis and Krishna idols", "Offer puja thali arrangement services"],
        "customer_suggestions": ["Order homemade peda and festive sweets", "Buy handcrafted puja decorations", "Book traditional cooking classes for prasad"]
    },
    {
        "id": "onam",
        "name": "Onam",
        "icon": "🌸",
        "date": "2026-09-14",
        "primary_regions": ["Kerala", "Tamil Nadu", "Karnataka"],
        "banner_theme": "vibrant-marigold",
        "greeting": {
            "en": "Warm & Prosperous Onam Greetings!",
            "ml": "ഹൃദയം നിറഞ്ഞ ഓണാശംസകൾ!",
            "ta": "இனிய ஓணம் நல்வாழ்த்துகள்!"
        },
        "key_categories": ["Sadhya Feasts", "Handloom Kasavu", "Flower Rangoli", "Food & Preserves"],
        "surge_multiplier": 1.25,
        "senior_suggestions": ["Prepare traditional Onam sadhya dishes for local orders", "Weave or sell kasavu mundu and settu sarees", "Create pookalam flower arrangements"],
        "customer_suggestions": ["Order authentic Onam sadhya platters", "Buy handloom kasavu apparel", "Book traditional payasam classes"]
    },
    {
        "id": "durga_puja",
        "name": "Durga Puja / Navratri",
        "icon": "🌺",
        "date": "2026-10-02",
        "primary_regions": ["West Bengal", "Gujarat", "Delhi NCR", "Maharashtra"],
        "banner_theme": "festive-crimson",
        "greeting": {
            "en": "Subho Durga Puja & Happy Navratri!",
            "bn": "শুভ শারদীয়া ও শুভ দুর্গোৎসব!",
            "hi": "नवरात्रि व दुर्गा पूजा की शुभकामनाएँ!",
            "gu": "નવરાત્રીની હાર્દિક શુભકામનાઓ!"
        },
        "key_categories": ["Traditional Apparel", "Sweets & Bhog", "Handicrafts", "Festive Sweets & Snacks"],
        "surge_multiplier": 1.25,
        "senior_suggestions": ["Prepare bhog sweets and sandesh for puja orders", "Offer festive saree draping and blouse stitching", "Create handmade alpona and decor items"],
        "customer_suggestions": ["Order authentic Bengali sweets for puja", "Book saree blouse tailoring", "Buy handcrafted puja decorations"]
    },
    {
        "id": "diwali",
        "name": "Diwali",
        "icon": "🪔",
        "date": "2026-10-20",
        "primary_regions": ["All India", "Tamil Nadu", "Maharashtra", "Delhi NCR", "Karnataka"],
        "banner_theme": "festive-gold",
        "greeting": {
            "en": "Wishing you a sparkling & prosperous Diwali!",
            "ta": "இனிய தீபாவளி நல்வாழ்த்துகள்!",
            "te": "దీపావళి శుభాకాంక్షలు!",
            "hi": "दीपावली की हार्दिक शुभकामनाएँ!",
            "kn": "ದೀಪಾವಳಿ ಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು!",
            "ml": "ദീപാവലി ആശംസകൾ!",
            "bn": "শুভ দীপাবলি!",
            "mr": "दिवाळीच्या हार्दिक शुभेच्छा!"
        },
        "key_categories": ["Festive Sweets & Snacks", "Gifting", "Handicrafts & Decor", "Tailoring & Apparel"],
        "surge_multiplier": 1.30,
        "senior_suggestions": ["Prepare traditional Diwali sweets — laddu, mysore pak, murukku", "Create handmade diyas and rangoli kits", "Offer festive gift hamper assembly services"],
        "customer_suggestions": ["Order homemade Diwali sweets and snack boxes", "Buy handcrafted diyas and decor", "Book festive tailoring for new outfits"]
    },
    {
        "id": "christmas",
        "name": "Christmas & New Year",
        "icon": "🎄",
        "date": "2026-12-25",
        "primary_regions": ["Kerala", "Goa", "Tamil Nadu", "All India"],
        "banner_theme": "festive-crimson",
        "greeting": {
            "en": "Merry Christmas and a Joyous New Year!",
            "ta": "கிறிஸ்துமஸ் மற்றும் புத்தாண்டு நல்வாழ்த்துகள்!",
            "ml": "ക്രിസ്മസ് ആശംസകൾ!"
        },
        "key_categories": ["Plum Cakes & Bakes", "Home Decor", "Gifting Hampers"],
        "surge_multiplier": 1.25,
        "senior_suggestions": ["Bake traditional plum cakes and fruit cakes", "Create Christmas star lanterns and decor", "Offer gift wrapping and hamper assembly"],
        "customer_suggestions": ["Order homemade Christmas cakes", "Buy handcrafted decorations", "Book festive catering services"]
    },
    {
        "id": "pongal",
        "name": "Pongal / Makar Sankranti",
        "icon": "🌾",
        "date": "2027-01-15",
        "primary_regions": ["Tamil Nadu", "Andhra Pradesh", "Karnataka", "Maharashtra"],
        "banner_theme": "harvest-green",
        "greeting": {
            "en": "Happy Pongal & Harvest Prosperity!",
            "ta": "இனிய தைப்பொங்கல் நல்வாழ்த்துகள்!",
            "te": "సంక్రాంతి శుభాకాంక్షలు!",
            "hi": "मकर संक्रांति की शुभकामनाएँ!",
            "kn": "ಮಕರ ಸಂಕ್ರಾಂತಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು!"
        },
        "key_categories": ["Food & Preserves", "Traditional Clayware", "Festive Sweets"],
        "surge_multiplier": 1.25,
        "senior_suggestions": ["Prepare traditional Pongal and sakkarai pongal", "Make sugarcane-based sweets and snacks", "Create kolam and traditional rangoli kits"],
        "customer_suggestions": ["Order authentic Pongal dishes", "Buy traditional clay pots and kolam kits", "Book traditional cooking classes"]
    },
    {
        "id": "eid_ul_fitr",
        "name": "Eid-ul-Fitr",
        "icon": "🌙",
        "date": "2027-03-31",
        "primary_regions": ["All India", "Telangana", "Kerala", "Uttar Pradesh"],
        "banner_theme": "emerald-green",
        "greeting": {
            "en": "Eid Mubarak! May peace and blessings be with you.",
            "hi": "ईद मुबारक!",
            "ur": "عید مبارک!"
        },
        "key_categories": ["Sheer Khurma & Sweets", "Festive Kurta & Apparel", "Attar & Gifting"],
        "surge_multiplier": 1.25,
        "senior_suggestions": ["Prepare sheer khurma and sewaiyan for local orders", "Offer festive kurta tailoring", "Create attar and ittar gift sets"],
        "customer_suggestions": ["Order traditional Eid sweets", "Book festive tailoring for new kurtas", "Buy handmade gift hampers"]
    }
]


class FestivalService:
    def get_all_festivals(self) -> List[FestivalInfo]:
        return [FestivalInfo(**{k: v for k, v in f.items() if k not in ("date", "senior_suggestions", "customer_suggestions")}) for f in FESTIVALS_DATA]

    def get_current_festival(self, festival_name: Optional[str] = None) -> Optional[FestivalInfo]:
        """Returns the requested festival if specified; otherwise the upcoming festival within 14 days."""
        # If a specific festival was explicitly requested, return that festival
        if festival_name and festival_name.strip():
            target = festival_name.lower().strip()
            fest = next(
                (f for f in FESTIVALS_DATA if target in f["name"].lower() or target == f["id"].lower() or f["id"].lower() in target),
                None
            )
            if fest:
                return FestivalInfo(**{k: v for k, v in fest.items() if k not in ("date", "senior_suggestions", "customer_suggestions")})

        # Otherwise, dynamically find upcoming festival within 14 days
        today = datetime.date.today()
        upcoming = None
        min_days = 999

        for f in FESTIVALS_DATA:
            try:
                fest_date = datetime.date.fromisoformat(f["date"])
                days_until = (fest_date - today).days
                # Activate if within 14 days before OR 2 days after the festival
                if -2 <= days_until <= 14 and days_until < min_days:
                    min_days = days_until
                    upcoming = f
            except (ValueError, KeyError):
                continue

        if upcoming:
            return FestivalInfo(**{k: v for k, v in upcoming.items() if k not in ("date", "senior_suggestions", "customer_suggestions")})

        return None

    def get_festival_suggestions(self, role: str = "customer") -> Dict[str, Any]:
        """Get domain-based suggestions for the upcoming festival."""
        today = datetime.date.today()
        for f in FESTIVALS_DATA:
            try:
                fest_date = datetime.date.fromisoformat(f["date"])
                days_until = (fest_date - today).days
                if -2 <= days_until <= 14:
                    key = "senior_suggestions" if role == "senior" else "customer_suggestions"
                    return {
                        "festival_name": f["name"],
                        "festival_icon": f["icon"],
                        "days_until": days_until,
                        "suggestions": f.get(key, []),
                        "categories": f.get("key_categories", []),
                        "surge_multiplier": f.get("surge_multiplier", 1.0)
                    }
            except (ValueError, KeyError):
                continue
        return {"festival_name": None, "suggestions": [], "categories": [], "days_until": -1}

    def get_festival_calendar(self, active_name: Optional[str] = None) -> FestivalCalendarResponse:
        current = self.get_current_festival(active_name)
        all_festivals = self.get_all_festivals()
        return FestivalCalendarResponse(current_festival=current, all_festivals=all_festivals)

festival_service = FestivalService()
