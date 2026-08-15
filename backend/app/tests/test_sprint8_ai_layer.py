import pytest
from app.ai import life_to_skill_ai, matching_ai, product_ai, job_description_ai

@pytest.mark.asyncio
async def test_life_to_skill_ai_submodule():
    transcript = "நான் 30 வருடங்களாக அரசு பள்ளியில் கணக்கு ஆசிரியராக வேலை செய்தேன். ஓய்வுக்கு பின் வீட்டில் குழந்தைகளுக்கு டியூஷன் எடுக்கிறேன்."
    res = await life_to_skill_ai.extract_skills(transcript, language="ta")
    assert len(res.explicit_skills) >= 1
    assert "Accounting" in res.explicit_skills or "Teaching" in res.explicit_skills or "Mathematics" in res.explicit_skills
    assert res.bio != ""

def test_matching_ai_submodule():
    senior = {
        "skills": ["Accounting", "Excel", "Bookkeeping"],
        "city": "Chennai",
        "locality": "Adyar",
        "availability": "Part-time"
    }
    opp = {
        "required_skills": ["Accounting", "Tally"],
        "city": "Chennai",
        "locality": "Adyar",
        "work_type": "part_time",
        "is_remote": False
    }
    score, rationale = matching_ai.score_senior_opportunity_match(senior, opp)
    assert score >= 75
    assert "Accounting" in rationale or "skill match" in rationale

    # Test Senior-Senior synergy
    senior_cook = {"skills": ["Traditional Cooking", "Pickles"]}
    synergy_score, venture_name, reason = matching_ai.score_senior_senior_synergy(senior, senior_cook)
    assert synergy_score >= 90
    assert "Kitchen" in venture_name or "Food" in venture_name

def test_product_ai_submodule():
    res = product_ai.generate_listing("authentic sun dried mango pickle in cold pressed oil")
    assert "Pickle" in res["title"]
    assert res["category"] == "Food & Preserves"
    assert res["suggested_price"] > 0

def test_job_description_ai_submodule():
    res = job_description_ai.parse_job_posting(
        "Senior Part-Time Accounts Reconciler (Work From Home)",
        "We are looking for an experienced retired accountant to balance ledger statements and verify GST invoices."
    )
    assert "Accounting" in res["extracted_skills"]
    assert res["is_remote"] is True
    assert res["dignity_approved"] is True
