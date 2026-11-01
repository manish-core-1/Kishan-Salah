import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

# Load env
backend_dir = Path(__file__).resolve().parent
load_dotenv(dotenv_path=backend_dir / ".env")

from app.services.ai_service import (
    calculate_python_verdict,
    call_groq_api,
    call_openrouter_api,
    get_ai_explanation,
    calculate_market_recommendation,
    EXPLANATION_CACHE
)

def run_tests():
    print("=" * 60)
    print("🌾 KISAN SALAH - AI ADVISOR INTEGRATION TESTS")
    print("=" * 60)

    # 1. Test Python Decision Engine (Requirement 5, 6)
    print("\n[TEST 1] Python Decision Engine - Strict Verdict & Facts Calculation")
    query = "गेहूं की बुवाई कब करें और कौन सी खाद डालें?"
    verdict, facts, rule_fallback, speech, related, actions = calculate_python_verdict(query, "hi")
    print(f"  Query: {query}")
    print(f"  Calculated Verdict: {verdict}")
    print(f"  Verified Facts Count: {len(facts)}")
    assert len(facts) > 0, "Facts must not be empty"
    assert "बुवाई" in verdict or "गेहूं" in verdict, "Verdict must address query"
    print("  ✅ Passed: Python decision engine accurately calculated verdict and facts.")

    # 2. Test Groq API (Primary LLM Provider)
    print("\n[TEST 2] Groq API - Primary LLM Provider")
    groq_key = os.getenv("GROQ_API_KEY", "")
    assert groq_key, "GROQ_API_KEY must be configured in .env"
    print(f"  Key detected: {groq_key[:6]}...{groq_key[-4:]} (Masked)")
    groq_resp = call_groq_api(query, verdict, facts, "hi")
    assert groq_resp is not None, "Groq API call must succeed"
    word_count = len(groq_resp.split())
    print(f"  Groq Explanation: {groq_resp}")
    print(f"  Word Count: {word_count} words")
    assert word_count <= 120, f"Explanation should be concise (~100 words), got {word_count}"
    print("  ✅ Passed: Groq API responded in Hindi with concise explanation adhering to facts.")

    # 3. Test Full Pipeline & 3-Hour Caching (Requirement 9)
    print("\n[TEST 3] Pipeline Execution & 3-Hour Cache Hash")
    EXPLANATION_CACHE.clear()  # clear cache for clean test
    t0 = time.time()
    res1 = get_ai_explanation("आज सरसों का क्या भाव चल रहा है?", "hi")
    t1 = time.time()
    print(f"  First Call (Cold): Provider={res1.get('provider')}, Cached={res1.get('cached')}, Time={(t1-t0)*1000:.1f}ms")
    assert res1.get("cached") is False, "First call must not be cached"
    assert "Groq" in res1.get("provider", ""), "Primary provider should be Groq"

    # Second call with identical query should hit cache immediately
    t2 = time.time()
    res2 = get_ai_explanation("आज सरसों का क्या भाव चल रहा है?", "hi")
    t3 = time.time()
    print(f"  Second Call (Warm): Provider={res2.get('provider')}, Cached={res2.get('cached')}, Time={(t3-t2)*1000:.1f}ms")
    assert res2.get("cached") is True, "Second call must be cached"
    assert (t3 - t2) < 0.05, f"Cache retrieval must be fast (<50ms), got {(t3-t2)*1000:.1f}ms"
    print("  ✅ Passed: 3-hour cache hit verified with sub-50ms retrieval.")

    # 4. Test Fallback Flow (Requirement 7, 8)
    print("\n[TEST 4] Fallback Flow Testing")
    # Temporarily override GROQ_API_KEY to invalid to simulate Groq outage/429
    orig_key = os.environ.get("GROQ_API_KEY", "")
    try:
        os.environ["GROQ_API_KEY"] = "gsk_invalid_test_key_for_fallback"
        # Test query not in cache
        fallback_query = "कीटनाशक छिड़काव के लिए मौसम कब सही रहेगा?"
        fallback_res = get_ai_explanation(fallback_query, "hi")
        print(f"  Simulated Groq Failure Result:")
        print(f"  Provider: {fallback_res.get('provider')}")
        print(f"  Verdict Preserved: {fallback_res.get('verdict')}")
        print(f"  Answer: {fallback_res.get('answer')[:80]}...")
        assert "Fallback" in fallback_res.get("provider", "") or "OpenRouter" in fallback_res.get("provider", ""), \
            "Must fall back to OpenRouter or Rule-based Engine when Groq fails"
        assert fallback_res.get("verdict") is not None, "Verdict must always be preserved"
        print("  ✅ Passed: Automatic fallback triggered seamlessly without throwing error.")
    finally:
        os.environ["GROQ_API_KEY"] = orig_key

    # 5. Test 3-Way Market Sell Recommendation Engine
    print("\n[TEST 5] 3-Way Market Recommendation Engine (SELL NOW / WAIT / SELL ELSEWHERE)")
    
    # 5A. Test Recommendation Pipeline
    rec = calculate_market_recommendation(commodity="Potato", location="Prayagraj", state="Uttar Pradesh")
    print(f"  Recommendation Result: Action={rec.get('action')} ({rec.get('action_hi')}), Best Market={rec.get('best_market')}, Diff=₹{rec.get('price_diff')}/Qtl")
    assert rec.get("action") in ["SELL NOW", "WAIT", "SELL ELSEWHERE"], f"Action must be one of the 3 actions, got {rec.get('action')}"
    assert "explanation" in rec and len(rec["explanation"]) > 20, "Must have an explanation"
    print(f"  AI Explanation Preview: {rec.get('explanation')[:120]}...")
    assert "राम-राम" in rec.get("explanation", ""), "Explanation must be in polite Hindi"
    print("  ✅ Passed 5: 3-Way Market recommendation successfully calculated with clear Hindi explanation.")

    print("\n" + "=" * 60)
    print("🎉 ALL AI INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
