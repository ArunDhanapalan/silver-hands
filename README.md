# 🤝 SilverHands 2.0 — Senior Livelihood & Generational Commerce Platform

> **"Your experience has value. SilverHands turns it into dignified local work, authentic commerce, and sustainable income."**

SilverHands 2.0 is a production-grade, local-first managed platform built for India's 140M+ senior citizens, retirees, and homemakers. It transforms lifelong uncredentialed experience into verified economic opportunities, managed services, and authentic local commerce.

---

## 🌟 Key Pillars & Differentiators

| Pillar | Description | Core Capabilities |
|---|---|---|
| **Life-to-Skill AI** | Multilingual voice/text life story analyzer | Converts informal life stories (in Tamil, Telugu, Hindi, English, etc.) into structured skills, transferable attributes, and dignified bios. |
| **Opportunity Deck** | Tinder-style card deck for senior work | 1-card-at-a-time cognitive simplicity, large high-contrast touch targets, explainable AI match percentage, and instant work scheduling. |
| **Local Store** | Managed hyper-local marketplace | Authentic homemade pickles, pure ghee Diwali sweets, and bespoke tailoring from verified local seniors with a 6-stage live state machine. |
| **Managed Services** | Reference service: 1-on-1 Online Telugu Tuition | Managed scheduling, automated HD video classroom links, session lifecycle tracking, and post-session review/rebooking. |
| **Regional Community** | Local demand signals & Senior collaborations | Customer needs generate live demand signals for seniors. AI pairs complementary seniors (e.g. Cooking + Accounting) to co-launch micro-businesses. |
| **Festival Engine** | Culturally alive regional context | Adapts UI, greetings in 11 languages, surge opportunities, and festive product curation across Diwali, Pongal, Onam, Durga Puja, Eid, and Christmas. |
| **Senior Ergonomics** | Total accessibility & 11-Language support | Font size scaler (A / A+ / A++), high contrast mode, text-to-speech voice assistant, and 11 Indian language localizations. |

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.10+** (Python 3.13 tested)
- **Node.js 18+** & **npm**

### 1. Start the Backend API
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
- API Documentation: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/api/v1/health`

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔑 Pre-Seeded Test Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Senior Citizen** | `ramesh@silverhands.in` | `password123` | Ramesh Krishnan (68 yrs, Retired Chief Accountant & Bilingual Tutor, Adyar) |
| **Senior Citizen** | `lakshmi@silverhands.in` | `password123` | Lakshmi Venkatesh (64 yrs, Culinary & Pickle Artisan, Mylapore) |
| **Company / Employer** | `techlocal@silverhands.in` | `password123` | TechLocal Solutions Pvt Ltd (GSTIN: `33AAAAA0000A1Z5`) |
| **Customer / Buyer** | `ananya@silverhands.in` | `password123` | Ananya Sharma (Parent & Local Commerce Buyer, Adyar) |

---

## 🧑‍⚖️ 5-Minute Judge Demo Walkthrough

### 1. Life-to-Skill AI Voice Onboarding (`/senior/onboarding`)
1. Log in as **Senior** (`ramesh@silverhands.in` or create a new senior account).
2. Navigate to **Voice Onboarding**.
3. Choose a sample story in **Tamil**, **Telugu**, **Hindi**, or **English** (or speak live using Web Speech API).
4. Click **Discover My Skills** → Observe Life-to-Skill AI extracting explicit skills, transferable capabilities with explanations, search keywords, and a dignified bio.
5. Save Profile → Instant seamless transition to the Opportunity Deck.

### 2. Opportunity Swipe Deck (`/senior`)
1. View matched opportunities with AI compatibility scores (e.g. **94% Match**) and explainable rationale pills.
2. Swipe **Right 💚 (Interested)** or click **Pass ❌**.
3. Scroll down to **"My Active Work & Applications"** to see live state updates.

### 3. Authentic Store & Order State Machine (`/store` & `/cart`)
1. Browse authentic products: Lakshmi's *Sun-Dried Thanjavur Mango Pickles* or *Festive Mysore Pak*.
2. Filter by City (Chennai Tier 1 / Madurai Tier 2 / Coimbatore Tier 2) and Category.
3. Click **Add to Cart** → Open **Cart** (`/cart`) → Place Order.
4. Log in as **Lakshmi** → Open **Seller Orders** (`/senior/orders`) → Click **Accept Order** → **Start Preparing** → **Handover / Delivered** → Watch the customer live tracking timeline update in real time.

### 4. Managed Telugu Language Tuition (`/services`)
1. Open **Services Bouquet** (`/services`) → Select **1-on-1 Online Telugu Tuition**.
2. Select preferred days (Mon/Wed/Fri), evening slot, and sessions count (3 sessions).
3. Submit Booking → Log in as **Ramesh** → Accept Session → Notice the live meeting link generated: `https://meet.silverhands.in/session-sh-srv-xxxx`.
4. Click **Complete** → Submit **5-Star Review** → Try **1-Click Rebooking**.

### 5. Regional Community & Senior Collaborations (`/community`)
1. Post a **Local Need** (e.g., *"Need spoken Tamil tutor in Adyar"*) → Notice the **Live Demand Signal** generated.
2. View **AI Senior-to-Senior Skill Complement Match**:
   - **Ramesh Krishnan** (Accounting) + **Lakshmi Venkatesh** (Culinary Mastery) → *"Heritage Taste & Home-Delivery Kitchen"*.
   - Click **Propose Venture Collaboration** → Instant connection!

### 6. Festival & Cultural Context Engine
1. Click the **Festival Selector Badge** (🪔 Diwali / 🌾 Pongal / 🌸 Onam / 🌺 Durga Puja / 🌙 Eid / 🎄 Christmas) in the top navigation bar.
2. Watch the entire application adapt its banners, multilingual greetings, surge badges, and festive product recommendations dynamically.

### 7. Senior Ergonomics & Multilingual Testing
1. Click the **A / A+ / A++** font size controls in the bottom-right accessibility bar.
2. Toggle **High Contrast Mode** or click **Read Aloud** to test text-to-speech.
3. Switch languages in the **Globe 🌐** dropdown across **11 Indian languages** (English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Odia, Punjabi).

---

## 🧪 Automated Test Suite

Run the full 13-test automated regression suite:

```bash
cd backend
.\venv\Scripts\pytest.exe -v
```

### Test Coverage Matrix:
- `test_sprint0.py`: FastApi server healthcheck & CORS
- `test_sprint1_auth.py`: Role-based authentication, password hashing, masked ID verification
- `test_sprint2_senior_ai.py`: Multilingual Life-to-Skill AI extraction & senior profile persistence
- `test_sprint3_matching.py`: Multi-factor opportunity scoring, swipe state transitions, application list
- `test_sprint4_store.py`: Public catalog, senior product creation, order state machine (`pending` → `completed`)
- `test_sprint5_services.py`: Managed services bouquet, Telugu language tuition reference flow, video link generation, reviews
- `test_sprint6_community.py`: Regional feed, demand signal pipeline, comments, senior-to-senior synergy matches
- `test_sprint7_festival.py`: Regional festival context engine, surge multipliers, multilingual greetings
- `test_sprint8_ai_layer.py`: Centralized AI intelligence layer unit tests (all 4 sub-modules)
- `test_sprint11_full_ecosystem.py`: Complete cross-module end-to-end user journeys

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, DaisyUI 4.12 (Indian theme palette), Lucide React, React Tinder Card, Canvas Confetti.
- **Backend**: FastAPI, Python 3.13, Pydantic v2, Motor (Async MongoDB) with resilient in-memory zero-failure fallback, PyJWT, Bcrypt, Pytest, Httpx.
- **AI Intelligence**: Dual-mode engine (Gemini LLM + Deterministic Indian Language NLP taxonomy fallback). Zero crashed calls.
- **Accessibility**: ARIA labels, 48x48px touch targets, mobile bottom navigation, dynamic font scaling, high-contrast mode, Web Speech API audio synthesis and recognition.
