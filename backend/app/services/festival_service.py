import logging
from typing import Dict, Any, List, Optional
from app.schemas.festival import FestivalInfo, FestivalCalendarResponse

logger = logging.getLogger("silverhands.festival_service")

FESTIVALS_DATA = [
    {
        "id": "diwali",
        "name": "Diwali",
        "icon": "🪔",
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
        "active_months": ["October", "November"]
    },
    {
        "id": "pongal",
        "name": "Pongal / Makar Sankranti",
        "icon": "🌾",
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
        "active_months": ["January"]
    },
    {
        "id": "onam",
        "name": "Onam",
        "icon": "🌸",
        "primary_regions": ["Kerala", "Tamil Nadu", "Karnataka"],
        "banner_theme": "vibrant-marigold",
        "greeting": {
            "en": "Warm & Prosperous Onam Greetings!",
            "ml": "ഹൃദയം നിറഞ്ഞ ഓണാശംസകൾ!",
            "ta": "இனிய ஓணம் நல்வாழ்த்துகள்!"
        },
        "key_categories": ["Sadhya Feasts", "Handloom Kasavu", "Flower Rangoli"],
        "surge_multiplier": 1.25,
        "active_months": ["August", "September"]
    },
    {
        "id": "durga_puja",
        "name": "Durga Puja / Navratri",
        "icon": "🌺",
        "primary_regions": ["West Bengal", "Gujarat", "Delhi NCR", "Maharashtra"],
        "banner_theme": "festive-crimson",
        "greeting": {
            "en": "Subho Durga Puja & Happy Navratri!",
            "bn": "শুভ শারদীয়া ও শুভ দুর্গোৎসব!",
            "hi": "नवरात्रि व दुर्गा पूजा की शुभकामनाएँ!",
            "gu": "નવરાત્રીની હાર્દિક શુભકામનાઓ!"
        },
        "key_categories": ["Traditional Apparel", "Sweets & Bhog", "Handicrafts"],
        "surge_multiplier": 1.25,
        "active_months": ["October"]
    },
    {
        "id": "eid",
        "name": "Eid-ul-Fitr",
        "icon": "🌙",
        "primary_regions": ["All India", "Telangana", "Kerala", "Uttar Pradesh"],
        "banner_theme": "emerald-green",
        "greeting": {
            "en": "Eid Mubarak! May peace and blessings be with you.",
            "hi": "ईद मुबारक! खुशियाँ और बरकत हमेशा आपके साथ रहे।",
            "ur": "عید مبارک!"
        },
        "key_categories": ["Sheer Khurma & Sweets", "Festive Kurta & Apparel", "Attar & Gifting"],
        "surge_multiplier": 1.25,
        "active_months": ["April", "May"]
    },
    {
        "id": "christmas",
        "name": "Christmas & New Year",
        "icon": "🎄",
        "primary_regions": ["Kerala", "Goa", "Tamil Nadu", "All India"],
        "banner_theme": "festive-crimson",
        "greeting": {
            "en": "Merry Christmas and a Joyous New Year!",
            "ta": "கிறிஸ்துமஸ் மற்றும் புத்தாண்டு நல்வாழ்த்துகள்!",
            "ml": "ക്രിസ്മസ് ആശംസകൾ!"
        },
        "key_categories": ["Plum Cakes & Bakes", "Home Decor", "Gifting Hampers"],
        "surge_multiplier": 1.25,
        "active_months": ["December", "January"]
    }
]

class FestivalService:
    def get_all_festivals(self) -> List[FestivalInfo]:
        return [FestivalInfo(**f) for f in FESTIVALS_DATA]

    def get_current_festival(self, festival_name: Optional[str] = "Diwali") -> FestivalInfo:
        target = (festival_name or "diwali").lower().strip()
        fest = next(
            (f for f in FESTIVALS_DATA if target in f["name"].lower() or target == f["id"].lower() or f["id"].lower() in target),
            FESTIVALS_DATA[0]
        )
        return FestivalInfo(**fest)

    def get_festival_calendar(self, active_name: Optional[str] = "Diwali") -> FestivalCalendarResponse:
        current = self.get_current_festival(active_name)
        all_festivals = self.get_all_festivals()
        return FestivalCalendarResponse(current_festival=current, all_festivals=all_festivals)

festival_service = FestivalService()
