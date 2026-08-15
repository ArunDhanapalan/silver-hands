# SILVERHANDS 2.0

## DEFINITIVE PRODUCT, SYSTEM, UX AND ENGINEERING SPECIFICATION

You are the principal product engineer, software architect, UX engineer and QA owner for **SilverHands**.

This document is the **single source of truth** for the product.

Do not interpret SilverHands as a collection of UI pages.

Do not build a generic marketplace with an AI profile page attached.

Do not build a job portal with a store.

Do not build a social network.

Do not create a large amount of placeholder UI.

Build a coherent, working product whose frontend, backend, database, AI services and business workflows are connected.

The end result must be a functioning hackathon MVP that judges can actually use from beginning to end.

---

# 1. WHAT SILVERHANDS ACTUALLY IS

## Product Definition

**SilverHands is a city-aware, AI-powered livelihood and managed-commerce platform for senior citizens, retired professionals and homemakers.**

It helps people convert:

**lifelong experience + practical skills + traditional knowledge**

into:

**nearby work + bookable services + sellable products + teaching/mentoring opportunities + collaborative income opportunities.**

At the same time, SilverHands gives customers — especially Gen Z — a convenient way to discover and purchase:

* local products
* local services
* learning experiences
* mentoring
* traditional knowledge
* practical expertise
* festival-specific offerings
* nearby work/services

The platform is not merely a connector.

SilverHands actively manages the lifecycle of opportunities.

For example:

```text
Customer Request
→ Matching
→ Provider Acceptance
→ Scheduling
→ Fulfillment
→ Completion
→ Payment State
→ Review
→ Rebooking
```

For a product:

```text
Product Creation
→ Publication
→ Customer Order
→ Provider Acceptance
→ Preparation
→ Ready
→ Delivery/Pickup
→ Completed
→ Review
```

For a job:

```text
Job Created
→ AI Candidate Matching
→ Senior Application
→ Company Review
→ Shortlist
→ Acceptance
→ Work
→ Completion
```

Therefore SilverHands is a **managed livelihood ecosystem**, not a passive directory.

---

# 2. THE CORE PROMISE

The core promise must be obvious within seconds:

> **Your experience has value. SilverHands helps turn it into nearby work, services, products and income.**

The senior journey is:

```text
LIFE EXPERIENCE
      ↓
AI DISCOVERS SKILLS
      ↓
SKILL PROFILE
      ↓
LOCAL DEMAND + OPPORTUNITIES
      ↓
SENIOR CHOOSES
      ↓
SILVERHANDS MANAGES THE WORK
      ↓
INCOME
      ↓
REPUTATION + COMMUNITY
      ↓
MORE OPPORTUNITIES
```

The customer journey is:

```text
NEED / INTEREST
      ↓
DISCOVERY
      ↓
LOCAL PRODUCT / SERVICE / PERSON
      ↓
BOOK / BUY / REQUEST
      ↓
SILVERHANDS MANAGES THE PROCESS
      ↓
COMPLETION
      ↓
REVIEW / REBOOK
```

The platform loop is:

```text
Senior Supply
      +
Customer Demand
      +
Location
      +
Time / Season / Festival
      +
AI
      ↓
LOCAL LIVELIHOOD OPPORTUNITY
```

---

# 3. WHAT MAKES SILVERHANDS DIFFERENT

These are NOT optional ideas.

These are the product's standout features.

The final product must visibly demonstrate them.

## STANDOUT FEATURE 1 — LIFE-TO-SKILL AI

A senior/homemaker does not need to write a professional resume.

During onboarding, they can record a natural spoken story in their preferred Indian language.

Example:

> "Naan 35 varusham accountant-aa work pannirukken. Small businesses-ku accounts maintain pannirukken. Excel, GST basics theriyum. Juniors-ku accounting teach pannirukken."

The application:

```text
Multilingual Voice Recording
        ↓
Transcription
        ↓
AI Analysis
        ↓
Explicit Skills
        +
Hidden / Transferable Skills
        +
Keywords
        +
Experience Summary
        +
Profile Description
        +
Potential Opportunity Categories
```

Example output:

* Accounting
* Bookkeeping
* Excel
* GST Basics
* Small Business Support
* Mentoring
* Accounting Teaching

For inferred skills, the system must show a concise explanation.

Example:

**Small Business Support**

"Suggested because you mentioned maintaining accounts for small businesses."

The senior can:

* accept
* remove
* edit
* add skills

This is the central AI feature.

---

# 4. VOICE IS ONLY FOR ONBOARDING

IMPORTANT:

Do NOT create a voice assistant throughout the entire application.

Do NOT add microphones to every screen.

Do NOT make SilverHands a voice chatbot.

Voice is specifically used during:

## Senior/Homemaker onboarding.

The onboarding flow is:

```text
Choose Language
      ↓
Read Simple Guidance
      ↓
Record Story
      ↓
Transcribe
      ↓
AI Skill Identification
      ↓
Generate Keywords
      ↓
Generate Profile / Description
      ↓
Senior Confirms
```

The recording interface must support:

* start
* pause
* resume
* stop
* replay
* re-record
* submit

If microphone permission is unavailable:

**Type instead**

must be available.

---

# 5. MULTILINGUAL ONBOARDING

Voice onboarding must support the target Indian languages:

1. English
2. Hindi
3. Bengali
4. Telugu
5. Marathi
6. Tamil
7. Gujarati
8. Kannada
9. Malayalam
10. Odia
11. Punjabi

The selected language controls:

* onboarding instructions
* spoken recording language where supported
* transcript language
* AI analysis context
* generated keywords
* generated descriptions
* generated profile summary

Use browser translation where appropriate for UI content, but structure frontend strings cleanly so proper i18n can replace it later.

The senior should be able to speak naturally.

They should NOT be forced to speak English.

---

# 6. AI-GENERATED PROFILE + BUSINESS/SERVICE DESCRIPTIONS

The same onboarding analysis can generate:

### Senior profile summary

### Skill keywords

### Service description

### Product/business description

### Search keywords

Example:

Input:

> "I make homemade mango pickle and podi using recipes from my family."

Output:

**Product title:**
Traditional Mango Pickle

**Description:**
"Homemade mango pickle prepared in small batches using a family recipe."

**Keywords:**

* Mango Pickle
* Homemade Food
* Traditional Recipe
* South Indian
* Homemade Preserves

The AI must use only information supplied by the user.

Do not invent qualifications, experience or certifications.

Everything AI generates must be editable before publication.

---

# 7. THE SECOND MAJOR STANDOUT FEATURE — CONTEXT-AWARE HOME

There is NO separate "Festival Studio".

Festivals are part of the intelligent homepage.

The homepage changes according to:

* role
* city
* location
* skills
* preferences
* demand
* season
* upcoming festival
* availability
* existing orders
* services
* jobs
* community activity

---

## SENIOR HOMEPAGE

When a significant festival is approaching:

A prominent homepage section should become festival-aware.

Example:

### DIWALI IS 12 DAYS AWAY

Based on your skills and nearby demand:

**You could offer:**

* Festival bookkeeping for local shops
* Traditional sweet preparation
* Gift packing
* Festival tailoring
* Festival cooking classes

And the recommendations must be personalized.

Example:

Ramesh = accountant:

> "Three local businesses near you may need temporary bookkeeping support during the festival period."

Lakshmi = cook:

> "Customers nearby are looking for traditional sweet boxes. You already make sweets."

The festival should naturally take visual priority on the homepage when relevant.

---

## CUSTOMER HOMEPAGE

The exact same festival should produce a different homepage.

Example:

### DIWALI IS COMING

Available near you:

* traditional sweets
* handmade gift items
* festival food
* custom clothing
* workshops
* local experiences

The customer sees actual nearby inventory/services, not generic festival content.

The festival is therefore:

```text
SAME EVENT
   ↓
Senior Intelligence → "What can I earn?"
Customer Intelligence → "What can I buy/book?"
```

---

# 8. LOCAL-FIRST PRODUCT MODEL

Location is a foundational part of SilverHands.

Everything important is location-aware:

* products
* services
* jobs
* customers
* community
* opportunities
* demand
* collaborations

Represent locality using:

```text
India
→ State
→ City
→ Locality / Area
→ Pincode
→ Coordinates where appropriate
```

Also maintain:

* T1 city
* T2 city
* T3 city

T1/T2/T3 cities must all be first-class citizens.

Do not design the platform as "Delhi/Mumbai/Bangalore only".

---

# 9. SENIOR TRAVEL / WORK RADIUS

A senior/homemaker should specify:

### Where are you willing to work?

Options:

* At home
* Online
* Within 2 km
* Within 5 km
* Within 10 km
* Flexible

This must influence matching.

Examples:

```text
Opportunity:
2.4 km away

Senior:
Maximum travel = 5 km

→ Suitable
```

```text
Opportunity:
12 km away

Senior:
Maximum travel = 5 km

→ Exclude or strongly deprioritize
```

Online opportunities can ignore physical distance.

The interface must visibly state:

* Online
* 2.4 km away
* Customer location
* At senior's location
* At customer's location

---

# 10. STANDOUT FEATURE 3 — INTUITIVE LEFT/RIGHT OPPORTUNITY DECK

Senior users should not have to browse complicated job boards.

Create a card-based opportunity deck.

Use a proven React swipe package such as:

**react-tinder-card**

if compatible with the current React setup.

Do not create an unnecessarily complicated custom gesture implementation.

Cards can represent:

### Job opportunities

### Service requests

### Product orders

### Collaboration opportunities

### AI-generated livelihood opportunities

Example:

---

**REMOTE BOOKKEEPING**

₹10,000/month

8 hrs/week

Online

Why this matches:

* 35 years accounting
* Excel
* bookkeeping

**Swipe right = Interested**

**Swipe left = Pass**

---

Another card:

**ACCOUNTING HELP**

Local shop

2.3 km away

₹3,000/month

Part-time

---

Another:

**TELUGU TUTORING**

2 children

3.4 km away

₹500/session

---

Another:

**COLLABORATION**

Cooking + Accounting

1.9 km apart

Potential local food venture

---

IMPORTANT:

Swiping is not cosmetic.

The swipe must cause a real state transition.

Right:

```text
interested
→ next action
```

Left:

```text
passed
→ remove from current deck
```

Also provide accessible non-swipe alternatives:

* Pass
* Interested
* View Details

The feature must work without gestures.

---

# 11. STANDOUT FEATURE 4 — SENIOR-TO-SENIOR SKILL COMPLEMENT MATCHING

This is different from normal social networking.

The system finds complementary skills.

Example:

Senior A:

Cooking
Traditional food

Senior B:

Accounting
Small business support

AI:

> "Your skills could complement each other."

Potential outcome:

**Small local food business**

Other examples:

```text
Cooking + Packaging
Tailoring + Embroidery
Teaching + Language
Craft + Marketing
Music + Events
Gardening + Accounting
Food + Delivery coordination
```

Matching should consider:

* skill complementarity
* geography
* availability
* interests
* work mode

Do not imply a partnership has been created.

The system suggests the collaboration.

Users must accept.

---

# 12. STANDOUT FEATURE 5 — LOCAL DEMAND INTELLIGENCE

SilverHands should understand not only:

> "What can this senior do?"

but also:

> **"What do people nearby currently need?"**

Demand can come from:

* searches
* service requests
* community posts
* job postings
* products
* order activity
* festival context

Example:

```text
Chennai
Telugu tutoring

Demand:
High

Supply:
Low
```

Then:

> "You have Telugu + teaching experience. There is local demand for this service."

This is a critical part of the local economy story.

---

# 13. STANDOUT FEATURE 6 — SKILL REMIX

AI can combine existing skills to produce new livelihood possibilities.

Example:

```text
Accounting
+
Teaching
+
Tamil
        ↓
Tamil-medium Accounting Tutor
```

Another:

```text
Cooking
+
Teaching
        ↓
Weekend Cooking Workshop
```

Another:

```text
Tailoring
+
Embroidery
        ↓
Custom Festival Clothing Service
```

This is not keyword matching.

Use LLM reasoning selectively.

Cache the result.

---

# 14. STANDOUT FEATURE 7 — "WHAT SHOULD I DO NOW?"

Do not expose an "AI Recommendations" dashboard full of boxes.

Instead, the system should quietly surface a small number of highly relevant actions.

Example:

### Something worth considering

> "Diwali is approaching. Customers within 5 km are looking for traditional sweets. You already make sweets."

[See Opportunity]

Another day:

> "A local company 3 km away needs part-time bookkeeping help."

[View]

Another:

> "A senior near you has cooking expertise and may complement your accounting skills."

[Explore]

The AI should behave like an intelligent ranking engine, not a noisy chatbot.

---

# 15. AI RECOMMENDATION COST CONTROL

AI must be central without burning API/token quota.

Use three levels.

## LEVEL 1 — NORMAL CODE

Use deterministic logic for:

* location
* radius
* city
* T1/T2/T3
* availability
* category
* dates
* festival timing
* skill overlap
* price
* rating
* status
* work mode

Do NOT call an LLM for these.

---

## LEVEL 2 — SEMANTIC MATCHING

Use embeddings or lightweight semantic techniques for:

* related skills
* semantic search
* product similarity
* service similarity
* opportunity similarity

---

## LEVEL 3 — LLM

Only use an LLM for high-value reasoning:

* life-story skill extraction
* hidden skill reasoning
* skill remix
* complex natural-language search interpretation
* descriptions
* business/service suggestions
* explanation generation

Cache generated results.

Persist them.

Do not regenerate the same content repeatedly.

---

# 16. AI SHOULD NOT CONSTANTLY INTERRUPT

Use recommendation relevance thresholds.

Highly relevant:

→ prominent

Moderately relevant:

→ normal card

Weak:

→ subtle

Poor:

→ don't show

The platform should sometimes show:

> "Nothing particularly relevant nearby right now."

That is acceptable.

Do not fabricate recommendations.

---

# 17. SERVICE BOUQUET — THIS IS A CORE PART OF THE PRODUCT

SilverHands is not only products and jobs.

A **managed service marketplace** is a major product pillar.

Services must be grouped into a clear bouquet.

At minimum support:

### EDUCATION & LEARNING

* language tuition
* school tutoring
* exam preparation
* computer basics
* accounting tutoring
* music lessons
* traditional arts

### KNOWLEDGE & MENTORING

* business mentoring
* bookkeeping guidance
* career mentoring
* practical consulting
* industry experience sharing

### HOME & PRACTICAL SKILLS

* tailoring
* gardening consultation
* cooking classes
* handicraft teaching
* repair/maintenance consultation where appropriate

### CULTURE & TRADITION

* traditional cooking sessions
* regional language
* crafts
* music
* cultural workshops

### FAMILY / CARE SERVICES

Potential future category:

* childcare / babysitting

This category must have stricter verification and safety controls.

---

# 18. ONLINE VS OFFLINE SERVICE MODE

Every service must specify:

### ONLINE

or

### OFFLINE

or

### BOTH

Examples:

Online:

* language tutoring
* accounting mentoring
* music lessons
* business consulting

Offline:

* tailoring
* local cooking classes
* gardening consultation
* local workshops

Both:

* tutoring
* mentoring
* cooking classes
* craft teaching

The UI must make this obvious.

---

# 19. MANAGED SERVICE LIFECYCLE

SilverHands must actually manage the service.

The generic service flow:

```text
Discover
↓
Request
↓
AI Matches
↓
Senior Accepts
↓
Schedule
↓
Reminder
↓
Service Starts
↓
Service Completed
↓
Payment State
↓
Review
↓
Rebook
```

This is fundamental.

SilverHands must not merely say:

> "Call this senior."

The platform manages the interaction.

---

# 20. ONLINE LANGUAGE TUITION — REFERENCE SERVICE

Implement this as the first fully working managed service.

Example:

Customer wants:

**Telugu tutoring**

Customer provides:

* student age
* preferred level
* preferred days
* preferred times
* language
* sessions per week

SilverHands:

1. Finds suitable seniors.
2. Applies skill + availability + location/online matching.
3. Shows match explanation.
4. Customer requests service.
5. Senior accepts.
6. Slot is scheduled.
7. Reminder is generated.
8. Online meeting information is displayed.
9. Session status can be changed.
10. Session is completed.
11. Review is requested.
12. Rebooking is offered.

The architecture must be reusable for other services.

---

# 21. CHILDCARE / BABYSITTING

Babysitting can exist as a controlled service category.

Do NOT implement it as an ordinary open marketplace.

Required conceptual safety controls:

* senior identity verification
* age verification
* parent identity verification
* service area
* emergency contact
* child age
* duration
* availability
* booking consent
* reporting mechanism
* clear safety policy
* no public exact-address exposure

The senior must NOT see unnecessary child personal data.

The customer must NOT see unnecessary senior identity information.

For the hackathon, prioritize the architecture and controlled booking model rather than pretending all real-world safeguarding infrastructure is already solved.

---

# 22. PRODUCTS — OPEN CATEGORY MARKETPLACE

Products must NOT be restricted to a short hardcoded list from the original problem statement.

Seniors/homemakers can sell many legitimate categories.

Examples:

* food
* crafts
* clothing
* handmade goods
* plants
* decorations
* educational material
* artwork
* gifts
* household items
* traditional goods
* regional products

AI categorizes and keywords the product from the provider's description.

---

# 23. STORE — CITY FIRST

The store is publicly accessible.

The user should naturally select or see:

* city
* nearby
* locality

Every product displays:

* price
* seller
* city
* distance if available
* category
* availability
* rating
* festival relevance when applicable

Filter by:

* city
* nearby
* category
* price
* rating
* availability
* festival

---

# 24. CUSTOMER / GEN Z PRODUCT EXPERIENCE

Customers should feel they are browsing a local discovery marketplace.

The messaging should NOT be:

> "Support senior citizens."

It should be:

> **Discover authentic products, useful services and experiences from people around you.**

Customer motivations:

* unique products
* local products
* gifting
* festival shopping
* convenient services
* learning
* experiences
* authenticity
* recommendations
* proximity

---

# 25. FESTIVAL PRODUCT/SERVICE INTELLIGENCE

Festival recommendations are contextual.

The system should use:

* festival
* date
* region
* city
* demand
* senior skills
* existing inventory
* services

Senior view:

> What could you sell or offer?

Customer view:

> What can you buy or book nearby?

This must happen on the homepage.

Do NOT create a dedicated Festival Studio page.

---

# 26. COMMUNITY

Community is a core pillar.

It must NOT become generic Facebook-style social media.

Community should support:

* local requests
* local recommendations
* skill sharing
* workshops
* events
* collaboration
* service requests
* product discovery
* useful discussions

Every post can potentially produce a demand signal.

---

# 27. COMMUNITY → LIVELIHOOD PIPELINE

Example:

Customer posts:

> "Looking for someone nearby who can teach spoken Tamil."

System:

```text
Post
↓
Demand Signal
↓
Skill Matching
↓
Suitable Seniors
↓
Opportunity
↓
Service Request
```

This connects community and economy.

---

# 28. PUBLIC / ROLE EXPERIENCES

There must be three login types:

### Senior / Homemaker

### Company / Job Provider

### Customer

Public store and public product browsing must be accessible without login.

Role permissions must be enforced on the backend as well as frontend.

---

# 29. SENIOR HOME SCREEN

The senior dashboard is NOT a conventional SaaS dashboard.

It should answer:

> **What should I do next?**

Suggested structure:

```text
Good morning, Ramesh

Chennai · 5 km radius

[Something important now]

Festival / immediate request / pending order

[My Opportunities]

Swipe cards

[My Work Today]

Scheduled activity

[Ways you could earn]

1–3 recommendations

[My Community]

Nearby activity

[People I could collaborate with]
```

Keep the number of simultaneous sections low.

---

# 30. CUSTOMER HOME SCREEN

Customer home should answer:

> **What can I discover or do nearby right now?**

Possible sections:

* festival context
* nearby products
* nearby services
* recommendations
* experiences
* community requests
* current orders

---

# 31. COMPANY HOME SCREEN

Company dashboard:

* active jobs
* applications
* recommended seniors
* shortlisted candidates
* jobs needing attention

Company can:

* create job
* specify required skills
* specify location/radius
* specify remote/home-based
* specify schedule
* specify payment
* specify language

GSTIN is required.

---

# 32. JOB MATCHING

Matching should consider:

* skill match
* experience
* location
* travel radius
* online/offline
* availability
* language
* work preference
* job category
* schedule
* demand/relevance

Show:

### Why this matches you

Example:

> 94% match

> "Your accounting experience, Excel knowledge and preferred evening schedule align with this opportunity."

Do not show an unexplained number.

---

# 33. SENIOR OPPORTUNITIES CAN BE MORE THAN JOBS

The opportunity engine must produce:

* jobs
* service requests
* product opportunities
* festival opportunities
* teaching opportunities
* collaboration opportunities
* mentoring opportunities

This is one of the main ways SilverHands differs from a traditional employment portal.

---

# 34. SENIOR INCOME VIEW

Show simplified:

* current earnings state
* completed work
* pending payments
* products sold
* services completed
* accepted jobs

Do not create a complicated finance dashboard.

---

# 35. TRUST

Required trust primitives:

### Senior

* age verified
* identity verification state
* skill confirmation

### Company

* GSTIN
* company verification state

### Customer

* basic account verification

### General

* reviews
* reports
* moderation
* completed work

Never expose sensitive ID details publicly.

---

# 36. AADHAAR / GOVERNMENT ID

The senior onboarding/verification flow may collect:

* Aadhaar
* PAN
* Voter ID
* Passport
* Driving Licence
* other approved government ID

However:

**Never expose raw Aadhaar numbers publicly.**

Do not log them.

Do not put them in product/profile responses.

Prefer storing:

* document type
* masked identifier if genuinely required
* verification status
* verification reference
* consent
* timestamps

The public UI only displays:

**Age Verified**

Treat privacy as part of the architecture.

---

# 37. MOBILE-FIRST SENIOR UX

Mandatory.

The senior experience must be designed at mobile width first.

Use:

* large touch targets
* large text
* short copy
* visual categories
* simple navigation
* predictable actions
* no dense tables
* no complicated forms
* no tiny icons
* no hover-only controls
* no hidden critical features

The product must remain equally usable on laptop/desktop.

---

# 38. ACCESSIBILITY

Implement:

* semantic HTML
* labels
* ARIA
* accessible forms
* keyboard navigation
* focus styles
* accessible modals
* accessible alerts
* screen-reader-friendly controls
* sufficient contrast

Swipe MUST have button alternatives.

No important action should depend solely on gesture.

---

# 39. UI TECHNOLOGY — VERY IMPORTANT

## USE PLAIN BASE DAISYUI

The UI component layer must be **base/vanilla daisyUI**.

Do not add:

* shadcn
* Radix
* Material UI
* Chakra
* Ant Design
* Bootstrap
* Flowbite
* Headless UI
* another design system
* a custom component framework

Do not build a second design system on top of daisyUI.

Use standard daisyUI primitives and themes.

Tailwind may be used for ordinary layout/responsive utility needs, but do not create an independent custom component ecosystem.

The product should look like **excellent product design built with daisyUI**, not like a generic AI-generated dashboard.

---

# 40. VISUAL DESIGN

NO AI SLOP.

Do not use:

* purple AI gradients
* glowing blobs
* glassmorphism everywhere
* neon effects
* random gradient cards
* "AI magic" visual clichés
* generic SaaS dashboards
* giant meaningless hero graphics
* excessive rounded containers
* unnecessary animation
* decorative complexity

Use:

* whitespace
* hierarchy
* typography
* photography/appropriate illustrations
* strong information architecture
* consistent daisyUI components
* restrained color use
* accessible contrast

Design should be:

**Indian + modern + human + trustworthy + dignified + practical.**

---

# 41. NO "AI" LABEL EVERYWHERE

Do not call everything:

* AI card
* AI recommendation
* AI-powered profile
* AI opportunity
* AI assistant

The intelligence should mostly be apparent from the quality of the behavior.

Label AI only when useful to explain why something happened.

---

# 42. FRONTEND TECHNOLOGY

Mandatory:

* React
* Vite
* JavaScript or TypeScript
* Tailwind CSS
* base daisyUI
* React Router

Use TypeScript if the current repository supports it cleanly.

Use a proven swipe package where appropriate.

Avoid unnecessary frontend dependencies.

---

# 43. BACKEND TECHNOLOGY

Mandatory:

* Python
* FastAPI
* Pydantic
* REST APIs

Use a modular FastAPI application.

Routes must be separated.

Business logic must not live inside route handlers.

AI logic must be isolated.

Database access must be isolated.

---

# 44. DATABASE

MongoDB / MongoDB Atlas.

Use collections according to actual domain responsibilities.

Core entities:

```text
users
senior_profiles
companies
skills
jobs
applications
services
service_requests
service_bookings
products
orders
reviews
community_posts
community_comments
collaborations
recommendations
demand_signals
festival_events
cities
verification_records
notifications
```

Do not create entities that have no meaningful purpose.

---

# 45. LOCATION DATA

City records should include where appropriate:

* city
* state
* tier
* coordinates

Users/providers may contain:

* city
* locality
* pincode
* coordinates
* travel radius

Use geospatial querying where appropriate.

Do not require location permission to use basic browsing.

Allow manual city selection.

---

# 46. ORDER STATE MACHINE

Orders should have explicit states:

```text
pending
accepted
preparing
ready
out_for_delivery
delivered
completed
cancelled
```

Do not let arbitrary pages invent their own status names.

---

# 47. SERVICE STATE MACHINE

```text
requested
accepted
scheduled
in_progress
completed
cancelled
```

Support:

* online
* offline
* hybrid

---

# 48. JOB STATE MACHINE

```text
draft
published
application_received
shortlisted
accepted
in_progress
completed
cancelled
```

Keep transitions controlled.

---

# 49. SEARCH

Support both structured search and natural-language search.

Example:

> "I need a Telugu tutor for my daughter near Adyar in Chennai."

Extract:

```text
service
language = Telugu
target = child
location = Adyar, Chennai
```

Another:

> "Find me a handmade Diwali gift under ₹1000 in Coimbatore."

Extract:

```text
product
festival = Diwali
budget <= 1000
city = Coimbatore
```

Use LLM parsing only when deterministic parsing is insufficient.

---

# 50. PRODUCT CREATION FLOW

Senior/homemaker should be able to create a product with minimal typing.

Flow:

```text
Create Product
↓
Tell us what you make
↓
Text OR existing onboarding-derived information
↓
AI generates:
  title
  category
  keywords
  description
  suggested price range if appropriate
↓
Senior reviews
↓
Add photos
↓
Publish
```

Do not automatically publish without confirmation.

---

# 51. SERVICE CREATION FLOW

Same philosophy.

Senior says/types what they can offer.

The system generates:

* service title
* description
* keywords
* category
* online/offline mode
* suggested duration
* suggested audience

Senior confirms.

Then:

**Set availability**

and publish.

---

# 52. MANAGED SERVICE BOUQUET ARCHITECTURE

Do NOT hard-code one service flow for every service.

Define a reusable service model containing:

* category
* mode
* duration
* location policy
* scheduling required
* meeting required
* fulfillment type
* price model
* age/safety requirements
* cancellation policy
* booking workflow

Then service types can reuse the same engine.

---

# 53. EXAMPLE SERVICE BOUQUET

The UI should make the bouquet discoverable visually.

### Learn

* Language Tuition
* Academic Tutoring
* Music
* Crafts
* Cooking

### Grow

* Business Mentoring
* Accounting Support
* Career Mentoring
* Practical Consulting

### Home & Local

* Tailoring
* Gardening
* Local Assistance

### Tradition

* Regional Cooking
* Handicrafts
* Traditional Arts
* Cultural Knowledge

### Family

* Childcare / Babysitting
* Other future family services

Not all need separate implementations initially.

Build one or two deeply and make the architecture extensible.

---

# 54. GEN Z CUSTOMER STRATEGY

Gen Z is an important customer audience.

Do not make the product appeal to them through charity.

Make it appealing through:

* convenience
* local discovery
* authenticity
* interesting products
* unique gifts
* affordable experiences
* skill learning
* recommendations
* nearby availability
* festival relevance

A customer should think:

> "This is useful/cool/interesting."

not:

> "I am helping old people."

---

# 55. PUBLIC STORE

The store must work without authentication.

Visitor can:

* browse
* search
* city filter
* category filter
* open product
* inspect seller summary
* see price
* see availability
* begin transaction

Login is only required for protected actions.

---

# 56. COMMUNITY HOME

Community should be region-first.

Example:

```text
India
→ Tamil Nadu
→ Chennai
→ Local area
```

The user should see:

* nearby discussions
* requests
* workshops
* opportunities
* collaborations
* relevant services/products

Do not create an algorithmic social-media feed based primarily on likes.

---

# 57. COMMUNITY POST TYPES

Use structured post types where useful:

* Need
* Offer
* Event
* Recommendation
* Collaboration
* Discussion

Example:

### NEED

"Looking for someone who can teach Tamil."

This can generate demand.

---

# 58. COMMUNITY MODERATION

Implement:

* report
* hide
* moderation status
* basic admin review

Do not overbuild.

---

# 59. NOTIFICATION PRINCIPLE

Notifications should be meaningful.

Examples:

* new suitable opportunity
* service request
* order
* schedule
* reminder
* collaboration
* festival recommendation
* review

Avoid spam.

---

# 60. ADMIN

Create only what is necessary:

* users
* reports
* verification states
* jobs
* products
* services
* community moderation
* categories
* cities

Senior/customer experience is more important than admin UI.

---

# 61. DEMO DATA MUST FORM A REAL STORY

Seed connected demo data.

Example:

### Ramesh

Chennai
Retired accountant

Skills:

* Accounting
* Excel
* Bookkeeping
* Mentoring
* Tamil
* English

Preference:

Within 5 km
Evenings
Part-time

### Lakshmi

Chennai

Skills:

* Cooking
* Pickles
* Traditional sweets

### Meena

Chennai

Skills:

* Tailoring
* Embroidery

Create local:

* jobs
* customers
* orders
* service requests
* products
* community requests
* festivals
* collaborations

The records must reference each other meaningfully.

---

# 62. THE FINAL DEMO MUST DEMONSTRATE THESE EXACT STORIES

## STORY A — RETIRED PROFESSIONAL

Ramesh speaks his story.

AI discovers:

Accounting
Excel
Bookkeeping
Mentoring

Then:

Nearby opportunities.

He swipes right.

Opportunity becomes accepted.

It appears in his work state.

---

## STORY B — CUSTOMER

A Gen Z customer opens Chennai.

Diwali is approaching.

The homepage surfaces relevant local products/services.

Customer searches:

> "Unique Diwali gift under ₹1000."

Nearby results appear.

Customer selects a product and orders.

Order lifecycle is visible.

---

## STORY C — MANAGED SERVICE

Customer wants Telugu tuition.

Search.

Match.

Book.

Schedule.

Reminder.

Online session details.

Completion.

Review.

Rebook.

The judges must be able to see:

> SilverHands manages the service.

---

## STORY D — SENIOR COLLABORATION

Ramesh sees:

> "A senior nearby knows cooking. You know accounting."

AI explains:

> "You have complementary skills that could support a small food business."

Both can choose whether to connect.

---

# 63. THE APP MUST NOT BE A COLLECTION OF HTML PAGES

This is a hard requirement.

A page existing is NOT feature completion.

A feature is complete only when:

```text
UI action
→ API call
→ backend business logic
→ database state change
→ updated state returned
→ UI reflects new state
→ next relevant workflow can continue
```

Example:

"Accept opportunity"

is not complete merely because a toast says:

> Opportunity accepted!

The system must actually update the opportunity/application/service/order state.

---

# 64. NO DEAD BUTTONS

Every button in the primary workflows must:

* work
* navigate correctly
* update state
* call appropriate API
* display error if unsuccessful

No fake action buttons.

No "Coming Soon" placeholders for core features.

---

# 65. ERROR STATES

Every API-driven feature must support:

* loading
* success
* empty
* error

No indefinite loading.

No blank white screens.

No raw Axios/FastAPI stack traces.

---

# 66. AUTHENTICATION

Three roles:

```text
SENIOR
COMPANY
CUSTOMER
```

Implement:

* registration
* login
* logout
* persistence
* route protection
* role authorization

Provide seeded demo accounts.

The judge must be able to enter the product immediately.

---

# 67. MOBILE SIGN-IN

Sign-in must be optimized for mobile.

Role cards:

**Senior / Homemaker**

**Company**

**Customer**

Then the relevant login fields.

Do not create unnecessary friction.

---

# 68. API ARCHITECTURE

Use:

```text
React
 ↓
API Client
 ↓
FastAPI Routers
 ↓
Service Layer
 ↓
Repository/Data Layer
 ↓
MongoDB
```

AI:

```text
FastAPI
 ↓
AI Service
 ↓
External AI API
```

Never expose AI keys to React.

---

# 69. FRONTEND STRUCTURE

Use a feature-oriented structure:

```text
src/
  app/
  pages/
  layouts/
  components/
  features/
    auth/
    senior/
    opportunities/
    store/
    services/
    community/
    matching/
    recommendations/
    company/
    customer/
  api/
  hooks/
  context/
  i18n/
  utils/
  assets/
```

Keep components reasonably small.

Do not build 2000-line components.

---

# 70. BACKEND STRUCTURE

Use:

```text
app/
  main.py
  config/
  routers/
  schemas/
  models/
  repositories/
  services/
  ai/
  security/
  utils/
  tests/
```

Separate:

* routes
* validation
* business rules
* database
* AI
* security

Do not put everything in `main.py`.

---

# 71. AI SERVICE STRUCTURE

Centralize prompts and AI calls.

Do not place AI prompts across React components.

Use services such as:

```text
skill_extraction.py
description_generation.py
query_interpretation.py
opportunity_reasoning.py
skill_remix.py
```

AI calls must be:

* centralized
* logged safely
* cacheable
* testable
* replaceable

---

# 72. SECURITY

Implement:

* password hashing
* JWT
* authorization
* input validation
* Pydantic schemas
* CORS
* server-side secrets
* safe logging

Sensitive information must never enter logs.

---

# 73. AADHAAR / GOVERNMENT ID PRIVACY

Never expose raw government ID numbers.

Never put them into:

* product documents visible to customers
* public profiles
* community data
* API responses not requiring them
* logs

Only verified state should be broadly visible.

---

# 74. CODE QUALITY STANDARD

Write maintainable production-style code.

Use:

* clear names
* typed interfaces/models
* reusable functions
* domain separation
* consistent error handling
* sensible abstractions
* tests for business-critical functionality

Avoid:

* duplicated code
* giant functions
* unexplained magic numbers
* hidden side effects
* duplicated API clients
* business logic scattered in JSX

---

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



# 76. SPRINT GATE RULE

After every sprint:

1. Run the application.
2. Run backend tests.
3. Run relevant frontend tests.
4. Manually exercise affected flows.
5. Check mobile.
6. Check console.
7. Check API/network failures.
8. Check previous critical workflows.

If a critical flow is broken:

**STOP. FIX IT. THEN MOVE FORWARD.**

Do not pile another feature on top of broken functionality.

---

# 77. TESTING PHILOSOPHY

Tests should protect business behavior.

Do not create meaningless tests for coverage numbers.

Critical tests:

### Authentication

login
logout
role authorization

### Senior

onboarding
skill extraction
skill confirmation
matching
swipe state

### Store

product creation
publication
city filtering
order lifecycle

### Services

request
match
booking
schedule
completion

### Community

post
request
matching

### AI

structured output validation
fallback behavior
cache behavior

---

# 78. AI FAILURE MUST NOT DESTROY THE APP

If AI API fails:

The platform should continue functioning.

Provide structured fallback data for demo mode.

Do not leave:

"Loading AI..."

forever.

Do not crash the page.

Do not expose model errors directly.

---

# 79. DEMO MODE

Create a controlled demo environment.

Demo data must be coherent.

Demo users:

### Ramesh

Chennai
Retired accountant

### Lakshmi

Chennai
Traditional cooking

### Meena

Chennai
Tailoring / embroidery

Create customers and companies that create meaningful interactions between them.

---

# 80. FINAL PRODUCT STORY

The judges should understand SilverHands through this sequence:

```text
A person has spent decades learning and doing things.
              ↓
SilverHands listens to their story.
              ↓
AI identifies what they can offer.
              ↓
SilverHands finds what people nearby need.
              ↓
The senior sees a few relevant opportunities.
              ↓
They choose with a simple swipe.
              ↓
SilverHands manages the job/service/order.
              ↓
They earn.
              ↓
They become part of a local skill community.
              ↓
Their skills can combine with another senior's skills.
              ↓
AI finds more opportunities.
```

For customers:

```text
A Gen Z customer has a need or curiosity.
              ↓
SilverHands understands location + context + festival + intent.
              ↓
It surfaces useful local products/services.
              ↓
Customer buys/books.
              ↓
SilverHands manages the process.
```

---

# 81. ABSOLUTE DO-NOT-BUILD-AS

Do NOT turn SilverHands into:

* a generic job board
* a generic e-commerce clone
* a generic social network
* a generic AI dashboard
* a chatbot application
* a collection of HTML pages
* fake feature demonstrations
* a large set of disconnected cards
* a visually attractive but non-functional prototype

---

# 82. ABSOLUTE UI RULE

Use:

**React + base daisyUI + Tailwind layout utilities**

Do not introduce another UI library.

Do not create a custom component framework.

Do not use AI-generated "design systems".

Do not make every page look different.

Do not create arbitrary gradients/colors.

The product should feel like **one carefully designed application**.

---

# 83. ABSOLUTE PRODUCT RULE

Do not ask:

> "What page should we build next?"

Ask:

> **"What user outcome are we enabling next?"**

The product is complete only when:

```text
User action
→ frontend
→ API
→ backend business logic
→ database
→ changed state
→ updated UI
→ next workflow
```

actually works.

---

# 84. ABSOLUTE AI RULE

Do not ask an LLM to do what normal software can do.

Do not call AI unnecessarily.

Do not generate recommendations merely to fill space.

Do not regenerate unchanged content.

Cache useful AI results.

Use deterministic ranking first.

Use semantic matching second.

Use expensive reasoning only where it creates meaningful product value.

---

# 85. ABSOLUTE SENIOR RULE

Never force a senior to understand the system.

They should mostly need to answer:

**What do you know?**

**What do you want to do?**

**How far can you travel?**

**When are you available?**

**Do you want this opportunity?**

**Are you ready to accept this work?**

Everything else should be simplified by the system.

---

# 86. FINAL SUCCESS CRITERIA

The application is considered successful only when all of these are true:

### Product

* SilverHands has a clear identity.
* Senior/homemaker livelihood is the primary purpose.
* Gen Z is a credible customer segment.
* Store, services and community form one ecosystem.
* AI is central to intelligence but not intrusive.

### Senior

* multilingual voice onboarding works
* skill extraction works
* profile is generated
* local radius works
* nearby work is visible
* swipe opportunities work
* services can be created
* products can be created
* income opportunities appear
* collaboration recommendations appear
* community works

### Customer

* public store works
* city-specific discovery works
* festival-aware homepage works
* natural search works
* products can be ordered
* services can be requested/booked

### Company

* GSTIN registration works
* job creation works
* senior matching works
* application flow works

### Service

* bouquet exists
* online/offline exists
* one service is fully managed end-to-end
* language tuition works as a reference service

### Community

* regional posts work
* demand signals can be generated
* senior-to-senior skill matching works

### Accessibility

* large touch targets
* simple layouts
* responsive
* ARIA
* keyboard accessible
* multilingual
* mobile-first

### Engineering

* React works
* FastAPI works
* MongoDB works
* APIs are connected
* authentication works
* errors are handled
* no infinite loading
* no blank core pages
* no critical dead buttons
* no secrets committed
* AI failures do not destroy the application

---

# 87. FINAL COMMAND TO THE AGENT

Do not interpret this specification as permission to generate everything immediately.

First inspect the repository.

Then establish the architecture.

Then build in the sprint order.

After each sprint, keep the product runnable.

Prefer a working vertical slice over breadth.

Do not dump hundreds of files.

Do not repeatedly rewrite functioning code.

Do not show internal reasoning or chain-of-thought.

Keep execution updates concise.

Use proven libraries when appropriate.

Use base daisyUI only as the UI component system.

Use React + FastAPI + MongoDB.

Build a product whose state actually flows through the system.

The final application should allow a judge to experience:

**A senior tells SilverHands their story → AI discovers their skills → local opportunities appear → the senior chooses an opportunity → SilverHands manages the work/service/order → income is generated → community and AI create the next opportunity.**

That is SilverHands.

Do not build pages that merely resemble that story.

**Build the system that makes the story actually happen.**
