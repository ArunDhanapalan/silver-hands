import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger("silverhands.ai.matching")

class MatchingAIEngine:
    """
    Centralized AI scoring algorithm computing:
    1. Senior to Opportunity match score + explainable rationale
    2. Senior to Senior complementary skill synergy score
    """

    @classmethod
    def score_senior_opportunity_match(
        cls,
        senior_profile: Dict[str, Any],
        opportunity: Dict[str, Any]
    ) -> Tuple[int, str]:
        score = 50 # Baseline score
        reasons = []

        senior_skills = [s.lower() for s in senior_profile.get("skills", [])]
        opp_skills = [s.lower() for s in opportunity.get("required_skills", [])]

        # 1. Skill overlap (up to +35%)
        overlap = set(senior_skills).intersection(set(opp_skills))
        if overlap:
            matched_count = len(overlap)
            bonus = min(35, matched_count * 18)
            score += bonus
            reasons.append(f"Strong skill match ({', '.join([s.title() for s in list(overlap)[:2]])})")
        else:
            # Transferable partial keyword match
            partial = any(any(sk in s_sk or s_sk in sk for sk in opp_skills) for s_sk in senior_skills)
            if partial:
                score += 15
                reasons.append("Transferable experience in similar domain")

        # 2. Location & Travel Radius (up to +10%)
        senior_city = (senior_profile.get("city") or "").lower()
        opp_city = (opportunity.get("city") or "").lower()
        senior_locality = (senior_profile.get("locality") or "").lower()
        opp_locality = (opportunity.get("locality") or "").lower()
        is_online = opportunity.get("is_remote", False) or "online" in opportunity.get("work_type", "").lower()

        if is_online:
            score += 10
            reasons.append("100% online / work from home")
        elif senior_city and opp_city and senior_city == opp_city:
            if senior_locality and opp_locality and senior_locality == opp_locality:
                score += 10
                reasons.append(f"Walking distance in {opportunity.get('locality')}")
            else:
                score += 5
                reasons.append(f"Within {opportunity.get('city')}")

        # 3. Availability alignment (up to +10%)
        senior_avail = (senior_profile.get("availability") or "").lower()
        opp_type = (opportunity.get("work_type") or "").lower()
        if "part" in senior_avail and "part" in opp_type:
            score += 5
            reasons.append("Matches part-time hours preference")

        final_score = min(99, max(45, score))
        rationale = " • ".join(reasons) if reasons else "Matches your background and general preferences."
        return final_score, rationale

    @classmethod
    def score_senior_senior_synergy(
        cls,
        senior_a: Dict[str, Any],
        senior_b: Dict[str, Any]
    ) -> Tuple[int, str, str]:
        """
        Calculates complementary skill match between two seniors.
        """
        skills_a = [s.lower() for s in senior_a.get("skills", [])]
        skills_b = [s.lower() for s in senior_b.get("skills", [])]

        # Look for business pairings
        is_culinary = any("cook" in s or "sweet" in s or "pickle" in s for s in skills_a + skills_b)
        is_accounting = any("account" in s or "gst" in s or "math" in s or "book" in s for s in skills_a + skills_b)
        is_tailor = any("tailor" in s or "stitch" in s or "embroidery" in s for s in skills_a + skills_b)
        is_teach = any("teach" in s or "tuition" in s or "language" in s for s in skills_a + skills_b)

        if is_culinary and is_accounting:
            return 96, "Heritage Home-Kitchen & Festival Sweets", "Culinary artisan paired with finance & bookkeeping veteran to run cost-effective local food distribution."
        elif is_tailor and is_accounting:
            return 92, "Custom Boutique & Ethnic Tailoring", "Design & pattern specialist paired with financial accountant for boutique orders."
        elif is_teach and is_accounting:
            return 90, "Senior Learning & Knowledge Academy", "Combined tutoring & practical skills curriculum for neighborhood youth."
        else:
            return 85, "Local Artisanal Collective", "Complementary life experience and trusted neighborhood presence."

matching_ai = MatchingAIEngine()
