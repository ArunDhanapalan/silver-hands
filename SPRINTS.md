75. ENGINEERING WORK METHOD — STRICT INCREMENTAL BUILD

You are not allowed to build SilverHands as a one-shot generation task.

Treat this as a real software engineering project being executed in controlled sprints.

The objective is not to maximize the amount of code generated. The objective is to produce a working, integrated product.

NON-NEGOTIABLE ENGINEERING RULES
Build incrementally.
Complete one sprint before starting the next.
Do not implement UI pages that have no working backend/data flow behind them.
Do not create placeholder functionality and describe it as complete.
Do not claim a feature works unless you have actually verified its complete flow.
Never hide broken functionality behind mock success messages.
Never replace a broken implementation with a fake UI merely to make a screen look finished.
If something cannot currently be implemented, explicitly state that it is incomplete.
Do not silently change requirements.
Do not rewrite working components unnecessarily.
Do not introduce unnecessary libraries or architecture.
Use proven, boring engineering patterns over clever implementations.
After every sprint, verify the application still starts and previously completed functionality still works.
Fix regressions before proceeding.
Never proceed to the next sprint with critical functionality knowingly broken.
ABSOLUTE HONESTY REQUIREMENT

Do not tell me:

"Implemented successfully"

unless the feature is actually implemented and verified.

Do not confuse:

component created
route created
API endpoint created
UI mocked
backend partially implemented
feature integrated
feature tested

These are different states.

If only the UI exists, say:

UI implemented; functionality not yet connected.

If an endpoint exists but the frontend does not use it, say:

Backend implemented; frontend integration incomplete.

If something is broken, say:

BROKEN — requires fixing before this sprint can be considered complete.

Never gaslight the developer/user into believing incomplete work is finished.

SPRINT 0 — PROJECT FOUNDATION & REPOSITORY SETUP

Establish the actual application foundation.

Implement and verify:

React/Vite application
FastAPI application
MongoDB connection
environment configuration
frontend/backend communication
API client
routing
error handling
basic application shell
DaisyUI configuration
responsive base layout
Sprint gate

Both frontend and backend start successfully.

MongoDB connects.

A frontend request can successfully reach FastAPI.

No major route produces a blank screen.

SPRINT 1 — AUTHENTICATION & ROLE SYSTEM

Implement the three actual user roles:

Senior Citizen
Job Provider / Company
Customer

Implement:

registration
login
logout
authentication persistence
protected routes
backend authorization
role-specific routing
GSTIN field for companies
senior verification workflow/data model
Sprint gate

A user can register, log in, refresh the browser, remain authenticated and access the correct role-specific application.

SPRINT 2 — SENIOR ONBOARDING & AI SKILL DISCOVERY

Build the core SilverHands experience.

Implement:

language selection
guided onboarding
voice recording
multilingual voice input
transcription
AI skill extraction
hidden/transferable skill identification
keyword generation
AI-generated profile description
skill confirmation/editing
availability
online/offline preference
service radius/locality

Voice is used primarily for onboarding.

Sprint gate

A senior can:

speak → transcript → AI analysis → skills → keywords → profile → MongoDB persistence.

If AI is unavailable, the application must fail gracefully rather than becoming unusable.

SPRINT 3 — OPPORTUNITY & MATCHING ENGINE

Build the livelihood engine.

Implement:

jobs
nearby work
home-based work
online/offline work
service opportunities
skill matching
location/radius matching
language matching
availability matching
explainable recommendations
senior opportunity cards
left/right swipe interaction
interested/pass states

Use a proven swipe library if one is appropriate rather than unnecessarily implementing gesture mechanics from scratch.

Sprint gate

A senior receives real opportunity recommendations based on their stored profile.

Swiping changes persistent application state.

The same state is reflected elsewhere in the application.

SPRINT 4 — SILVERHANDS STORE

Build the actual marketplace.

Implement:

senior product creation
product images
AI categorization
AI-generated descriptions
product keywords
product publishing
public product discovery
city filtering
locality filtering
T1/T2/T3 city support
product search
product details
cart/order flow
order status
senior order management

Festival-specific products must be capable of being surfaced contextually.

Sprint gate

Complete real flow:

Senior creates product → product published → customer discovers → customer orders → senior sees order → order status changes.

SPRINT 5 — MANAGED SERVICE BOUQUETS

SilverHands must manage services, not merely list service providers.

Implement the service system and begin with:

Online language tuition.

The architecture must support additional services such as:

tutoring
cooking classes
mentoring
tailoring
music lessons
handicraft classes
gardening guidance
consulting
childcare where legally/safely appropriate

Implement:

service creation
service packages/bouquets
online/offline selection
location/radius
availability
request
matching
acceptance
scheduling
session/status management
completion
review
rebooking

For online tuition, design the workflow around:

request → match → schedule → session details → completion → review.

Do not merely create a "Contact Senior" button.

Sprint gate

At least one complete service can travel from:

Customer request → Senior acceptance → scheduled service → completion → review/rebooking.

SPRINT 6 — COMMUNITY & SENIOR COLLABORATION

Build the regional community layer.

Implement:

region/city-based community
community posts
requests
offers
local opportunities
comments/interactions where appropriate
demand signals
senior-to-senior skill matching

Example:

Cooking + Accounting

→ AI identifies complementary skills

→ recommends collaboration.

The community must contribute to livelihood generation rather than becoming a generic social network.

Sprint gate

A community interaction can result in a meaningful service, opportunity or collaboration.

SPRINT 7 — FESTIVAL & CONTEXT ENGINE

Festivals are contextual homepage experiences, not a separate festival section.

Implement:

festival detection/context
upcoming festival data
city/region relevance
festival-specific product recommendations
festival-specific service recommendations
senior recommendations for what they could sell/offer
customer recommendations for what they can buy/book

For example:

During Diwali:

Senior:

"Diwali is coming up. Based on your cooking and handicraft skills, you could offer these products/services."

Customer:

"Diwali near Chennai — discover these locally available products and services."

The festival experience should automatically appear on the relevant homepages when appropriate.

Sprint gate

Changing the active festival/context changes recommendations for both seniors and customers.

SPRINT 8 — AI INTELLIGENCE LAYER

Centralize AI rather than scattering unnecessary AI calls throughout the application.

Implement intelligent, explainable recommendations for:

job matching
service matching
product categorization
skill discovery
business descriptions
income opportunities
complementary senior matching
local demand
festival opportunities

Use deterministic filtering/scoring wherever possible and reserve expensive AI calls for tasks that genuinely require AI.

Do not call an LLM for simple filtering, sorting or database queries.

Cache/store generated results where appropriate.

Sprint gate

AI recommendations are:

relevant
explainable
persistent where appropriate
reasonably efficient
not regenerated unnecessarily
SPRINT 9 — GEN Z CUSTOMER EXPERIENCE

Optimize the customer side specifically for younger users.

Improve:

fast discovery
visual product browsing
swipe/discovery interactions where useful
local products
festival discovery
services
experiences
search
recommendations
simple checkout/request flows

The customer should perceive SilverHands as a cool local discovery and commerce platform, not a charity platform.

Sprint gate

A customer can quickly discover something relevant, understand it, purchase/request it and complete the flow without unnecessary friction.

SPRINT 10 — MOBILE, ACCESSIBILITY & MULTILINGUAL EXPERIENCE

Perform a dedicated accessibility and mobile pass.

Verify:

mobile-first layouts
large touch targets
readable typography
ARIA accessibility
keyboard accessibility
semantic HTML
focus states
screen-reader labels
responsive navigation
language switching
multilingual onboarding
voice interaction
no horizontal overflow
no unusable mobile forms
Sprint gate

A senior can complete the core journey comfortably on a phone.

SPRINT 11 — FULL ECOSYSTEM INTEGRATION

Connect every major subsystem.

The final ecosystem should behave as:

Senior Experience
        ↓
AI Skill Discovery
        ↓
Skill Profile
        ↓
Jobs / Services / Products
        ↓
Matching
        ↓
Orders / Work / Sessions
        ↓
Reviews + Reputation
        ↓
Community
        ↓
Demand Signals
        ↓
AI Opportunities
        ↓
More Income

Connect:

AI
profiles
jobs
services
store
orders
community
demand
collaboration
recommendations
festivals
location
earnings
Sprint gate

The application feels like one product, not a collection of unrelated pages.

SPRINT 12 — RELEASE HARDENING

No new features.

Only fix:

runtime errors
broken routes
broken API calls
authentication bugs
database issues
inconsistent state
mobile issues
accessibility issues
loading states
empty states
error states
API failure handling
responsiveness
performance
bad UX
visual inconsistencies
seed/demo data
security issues
integration regressions

Test the complete judge demo from beginning to end.

FINAL GATE

The application must survive this sequence:

Register/Login → Senior onboarding → Voice → AI skills → Profile → Opportunities → Swipe → Service/Product → Customer discovery → Order/Request → Community → AI recommendation → Festival context → Income ecosystem.

If any critical step breaks:

STOP. FIX IT. THEN CONTINUE.

FINAL DEVELOPMENT RULE

A smaller number of completely working features is better than a huge number of broken features.

Do not optimize for:

"How many pages have been generated?"

Optimize for:

"How many complete user journeys actually work?"

Every sprint must leave the repository in a working state.

Every completed feature must be integrated, tested and demonstrably functional before being described as complete.

Never fabricate progress. Never hide failures. Never generate placeholder screens to make the project appear finished. If something is broken, explicitly report it and fix it.

FOLLOW GOOGLE ENGINEERING STANDARDS AND OPTIMISE FOR VERCEL HOSTING AND GITHUB UPLOADS. COMMIT AT EACH SPRINT END.