---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/gdd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
---

# CardWork - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for CardWork, decomposing the requirements from the GDD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: The system must allow a player to input a session intent via text or voice before starting a work session timer.
FR2: The system must classify the session intent into one of 4 work type tags (Deep Focus, Physical, Learning, Recovery) using an AI classification call.
FR3: The system must provide a manual tag selection fallback (4-option list) when AI classification is unavailable (offline or API failure).
FR4: The system must start a session timer upon intent submission and enforce a minimum duration of 30 minutes before a card can be awarded.
FR5: The system must prevent card awarding if the session timer is stopped before 30 minutes have elapsed.
FR6: The system must prompt the player to submit a short text or voice reflection after the session timer ends.
FR7: The system must evaluate the plausibility of the post-session reflection using AI and award a card only if the reflection is plausible.
FR8: The system must assign an optional Revenge Task when a reflection is deemed implausible/empty (session not completed honestly).
FR9: The system must trigger a card draw reveal animation (~1 minute) immediately after a valid session reflection is accepted.
FR10: The system must determine card type based on the work type tag (Deep Focus→[Focus], Physical→[Body], Learning→[Mind], Recovery→[Rest]).
FR11: The system must add the newly drawn card to the player's weekly deck after the draw reveal animation.
FR12: The system must enforce a maximum of 3 cards earned per day (3 sessions/day maximum).
FR13: The system must issue 3 fixed starter cards to the player at the start of each Monday reset.
FR14: The system must cap the weekly deck at 18 cards total (3 starter + up to 15 earned).
FR15: The system must support duplicate cards in the weekly deck (e.g., 3 [Body] cards from 3 physical sessions).
FR16: Each card must display: card name, card type tag, damage value, shield value, effect description, selective cost notation (if applicable), and synergy information in description text.
FR17: The system must support selective effect-based costs on specific cards (e.g., "no [Body] cards next turn") — not a universal resource bar.
FR18: The system must make the daily mini-battle available each evening after the player's first card draw of the day.
FR19: The daily mini-battle must use only the cards earned that day (not the full weekly deck).
FR20: The system must implement Slay the Spire-style turn structure: draw 3 cards per turn, player plays 1 card, discard remaining 2, enemy acts, repeat.
FR21: The player must always take the first turn in battle.
FR22: The enemy must display its intended next action (attack value, shield, special effect) before the player plays their card each turn (visible enemy intent — MVP scope).
FR23: The system must resolve card effects immediately when a card is played.
FR24: The discard pile must reshuffle into the deck when the draw pile is exhausted.
FR25: The battle win condition is: enemy HP reduced to zero.
FR26: The battle lose condition is: player HP reduced to zero.
FR27: A daily mini-battle loss must result in reduced rewards and optionally assign a Revenge Task.
FR28: A daily mini-battle win must award full daily rewards (XP placeholder for MVP).
FR29: The weekly boss battle must be locked and inaccessible until the end of the 5-day window (Friday end) — cannot be triggered early.
FR30: The weekly boss battle must use the full accumulated weekly deck.
FR31: The weekly boss must have a minimum of 3 stages; each stage resets boss HP (separate encounter per stage).
FR32: Boss Stage 1 must be designed to be beatable with 1 session's worth of cards (3 cards minimum).
FR33: Boss Stage 3 must require a full, synergy-aware deck to complete.
FR34: Meta-XP must be awarded to the player regardless of weekly boss outcome (win or lose any stage).
FR35: The weekly results screen must display: cards earned, stages reached, and sessions logged for the week.
FR36: The system must reset the weekly deck (clear all earned cards) and trigger Monday flow on weekly reset.
FR37: The Monday reset must include an Epic declaration screen where the player names their weekly goal (motivational only — no mechanical effect in MVP).
FR38: The home screen must surface the currently available action (log session / fight daily battle / fight weekly boss) based on current game state.
FR39: The system must send push notifications: daily battle reminder, weekly boss reminder, session streak nudge.
FR40: The system must store all session, deck, card, battle, and progression data in local storage (offline-first, no server dependency for MVP).
FR41: The system must survive app crashes and restarts without critical data loss (crash-safe writes).
FR42: The card draw reveal animation must be the highest-priority animation in the game (~1 minute, Clash Royale chest-open energy).
FR43: The battle screen layout must follow Slay the Spire composition: enemy at top-centre, player hand at bottom, HP bars visible.
FR44: The UI must follow Duolingo-inspired visual style: white/light backgrounds, bold accent colours per card type, rounded UI elements, generous whitespace.
FR45: All UI interactions must be mouse-click on PC, mapping directly to tap on mobile — no keyboard shortcuts required for MVP.
FR46: Minimum tap target size for mobile must be 44×44pt.
FR47: The app cold-start load time must be under 3 seconds.
FR48: The session log screen must load instantly (under 0.5 seconds).
FR49: The system must initialize the Expo project using `npx create-expo-app@latest --template default@sdk-55` as the first implementation story.

### Non-Functional Requirements

NFR1: Performance — App cold-start must complete in under 3 seconds on target devices.
NFR2: Performance — Session log screen must load instantly (< 0.5 seconds).
NFR3: Performance — Target 60fps on PC development platform; minimum 30fps on mobile target.
NFR4: Reliability — Crash rate must be under 1% of sessions in closed beta.
NFR5: Reliability — Session timer must be accurate to within ±5 seconds even when app is backgrounded.
NFR6: Reliability — Zero critical data loss events on app crash or restart.
NFR7: Reliability — Offline fallback must activate 100% successfully when AI is unavailable.
NFR8: Performance — AI classification API call must respond within 2 seconds.
NFR9: Offline — Core loop (log, draw, battle) must function fully without internet connectivity.
NFR10: Privacy — Session descriptions and reflection text are personal data and must be stored with appropriate privacy handling and not leaked to UI code paths.
NFR11: Integrity — The 30-minute session minimum must be tamper-resistant and enforced by the system, not by client-side trust alone.
NFR12: Maintainability — Card definitions, enemy stats, and stage difficulty must be configurable without code changes (balance/tuning at design-time).
NFR13: Security — AI provider credentials must never be hardcoded in UI code paths; access abstracted behind secure config layer.
NFR14: Accessibility — Voice input must have a text fallback always available for session description and reflection input.
NFR15: Usability — Starting a session must require no more than 2 taps/clicks from the home screen.

### Additional Requirements (from Architecture)

- **Starter Template:** Project must be initialized using `npx create-expo-app@latest --template default@sdk-55` (Expo React Native). This is Epic 1, Story 1.
- **Database:** SQLite via `expo-sqlite` as the primary local data store. Schema includes: `sessions`, `session_intents`, `session_reflections`, `cards`, `weekly_decks`, `battles_daily`, `battles_weekly`, `epics`, `meta_progress`, `outbox_ai_requests`.
- **Migration strategy:** Explicit versioned migrations using `PRAGMA user_version`; forward-only for MVP.
- **Domain boundaries:** Feature-sliced modules — `features/sessions`, `features/cards`, `features/battle`, `features/weekly-cycle`, `features/notifications`. Each contains `domain/`, `application/`, `infrastructure/`, `ui/`.
- **AI adapter pattern:** `ClassifierProvider` adapter with remote implementation + offline/manual fallback. Never call AI directly from UI.
- **Result envelope pattern:** All service boundaries return `{ ok: true, data: T }` or `{ ok: false, error: { code, message, retriable } }`. Never throw raw errors across domain boundaries.
- **Domain events:** Named `domain.entity.action.v1` (e.g., `session.timer.completed.v1`, `card.awarded.v1`). Immutable payloads with `eventId`, `occurredAt`, `correlationId`.
- **State management:** Domain state transitions must be pure and deterministic. Side effects (AI calls, notifications, persistence) in orchestrators/effects layer only.
- **Naming conventions:** DB `snake_case`, app/domain `camelCase`, components `PascalCase`, hooks `use*` prefix, constants `SCREAMING_SNAKE_CASE`.
- **CI/CD:** Git pipeline with mandatory typecheck, lint, unit tests, build validation on all PRs. EAS Build + EAS Submit path for mobile.
- **Notification strategy:** `expo-notifications` with channelized Android setup.
- **Error handling:** Classify errors as user-correctable / transient-retriable / fatal. Structured logs with `feature`, `operation`, `correlationId`, `errorCode`.
- **Loading states:** Intent-specific loading flags (e.g., `isClassifyingSession`, `isSavingReflection`). Operations >300ms must show progress affordance.

### UX Design Requirements

No UX Design document found. UX direction is captured in the GDD Art & Audio Direction section.

### FR Coverage Map

FR1: Epic 1 - Session intent input via text/voice
FR2: Epic 1 - AI work-type classification
FR3: Epic 1 - Manual fallback when AI unavailable
FR4: Epic 1 - Session timer with 30-minute gate
FR5: Epic 1 - No reward before 30 minutes
FR6: Epic 1 - Post-session reflection capture
FR7: Epic 1 - Reflection plausibility validation
FR8: Epic 1 - Optional Revenge Task on implausible reflection
FR9: Epic 1 - Card reveal trigger after valid reflection
FR10: Epic 1 - Work-tag to card-type mapping
FR11: Epic 1 - Add card to weekly deck
FR12: Epic 2 - 3-card daily earn cap
FR13: Epic 2 - Monday starter cards issuance
FR14: Epic 2 - Weekly deck cap at 18 cards
FR15: Epic 2 - Duplicate card handling
FR16: Epic 2 - Complete card surface and readability
FR17: Epic 2 - Selective effect-based cost support
FR18: Epic 3 - Daily battle unlock cadence
FR19: Epic 3 - Daily battle uses daily cards only
FR20: Epic 3 - Core turn structure implementation
FR21: Epic 3 - Player-first turn order
FR22: Epic 3 - Visible enemy intent each turn
FR23: Epic 3 - Immediate card effect resolution
FR24: Epic 3 - Deck/Discard reshuffle loop
FR25: Epic 3 - Win condition handling
FR26: Epic 3 - Lose condition handling
FR27: Epic 3 - Loss consequence flow
FR28: Epic 3 - Win reward flow
FR29: Epic 4 - Weekly boss time lock
FR30: Epic 4 - Weekly boss uses full deck
FR31: Epic 4 - Three-stage boss structure
FR32: Epic 4 - Stage 1 accessibility tuning
FR33: Epic 4 - Stage 3 mastery tuning
FR34: Epic 4 - Meta-XP granted regardless of outcome
FR35: Epic 4 - Weekly results presentation
FR36: Epic 4 - Monday weekly reset behavior
FR37: Epic 4 - Epic declaration ritual
FR38: Epic 5 - State-aware home action surfacing
FR39: Epic 5 - Push reminders and nudges
FR40: Epic 6 - Offline-first local persistence
FR41: Epic 6 - Crash/restart data resilience
FR42: Epic 5 - Priority card reveal animation quality
FR43: Epic 3 - Battle screen composition
FR44: Epic 5 - Duolingo-inspired visual system
FR45: Epic 5 - PC click to mobile tap interaction parity
FR46: Epic 5 - Mobile minimum tap-target size
FR47: Epic 6 - Cold-start performance budget
FR48: Epic 6 - Session screen instant load target
FR49: Epic 1 - Expo starter initialization as first implementation story

## Epic List

### Epic 1: Session-to-Card Core Loop
Players can log real work sessions, pass integrity checks, and earn a revealed card added to their weekly run.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR49

### Epic 2: Card and Deck Foundations
Players can build and understand a complete weekly deck with card attributes, starter cards, duplicates, and cap rules.
**FRs covered:** FR12, FR13, FR14, FR15, FR16, FR17

### Epic 3: Daily Battle Experience
Players can enter and complete daily battles with clear turn flow, enemy intent visibility, and outcome consequences.
**FRs covered:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR43

### Epic 4: Weekly Progression Arc
Players experience the full Monday-to-Friday cadence, culminating in a staged weekly boss and reflective results.
**FRs covered:** FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37

### Epic 5: Motivation, UX Feel, and Engagement
Players get a rewarding, readable, and habit-forming interface with strong reveal moments and reminders.
**FRs covered:** FR38, FR39, FR42, FR44, FR45, FR46

### Epic 6: Integrity, Offline Reliability, and Performance
Players can trust the app to stay fast, preserve progress, and function reliably without network dependency.
**FRs covered:** FR40, FR41, FR47, FR48

## Epic 1: Session-to-Card Core Loop

Players can log real work sessions, pass integrity checks, and earn a revealed card added to their weekly run.

### Story 1.1: Initialize Mobile Foundation with Expo Starter

As a developer,
I want to initialize the project using the mandated Expo starter and baseline architecture boundaries,
So that all subsequent gameplay stories are built on a consistent, approved foundation.

**Acceptance Criteria:**

**Given** no initialized mobile app project
**When** the project is scaffolded with `npx create-expo-app@latest --template default@sdk-55`
**Then** the app boots successfully in development
**And** the baseline folder structure and typed config conventions are established for feature-sliced implementation.

### Story 1.2: Capture Session Intent and Start a Session in Two Taps

As a player,
I want to enter intent by text or voice and quickly start a session timer,
So that logging work feels frictionless.

**Acceptance Criteria:**

**Given** I am on the home/session start screen
**When** I provide intent (text or voice) and start session
**Then** a session starts with a running timer and saved intent
**And** the start flow can be completed within two taps/clicks from home.

### Story 1.3: Classify Intent with Offline Manual Fallback

As a player,
I want my session intent classified into a work type even when network/API fails,
So that I can always continue the loop.

**Acceptance Criteria:**

**Given** I start a session with an intent
**When** classifier service is available
**Then** intent is tagged as Deep Focus, Physical, Learning, or Recovery
**And** if classification fails/offline, I can manually choose from the same four options without blocking session flow.

### Story 1.4: Enforce 30-Minute Integrity Gate with Reliable Timer

As a player,
I want rewards blocked before 30 minutes and timer behavior to remain accurate across app lifecycle changes,
So that card rewards reflect real effort.

**Acceptance Criteria:**

**Given** an active session under 30 minutes
**When** I attempt to end and claim reward
**Then** no card can be awarded
**And** timer state remains accurate and recoverable across background/foreground interruptions within defined tolerance.

### Story 1.5: Submit Reflection and Run Plausibility Check

As a player,
I want to submit a short reflection and have it evaluated for plausibility,
So that meaningful completion determines reward eligibility.

**Acceptance Criteria:**

**Given** a session of at least 30 minutes
**When** I submit text or voice reflection
**Then** the system evaluates plausibility and returns pass/fail
**And** implausible/empty reflection prevents card reward and can assign an optional Revenge Task.

### Story 1.6: Award and Reveal Card, Then Persist Session Outcome

As a player,
I want a successful reflection to trigger a satisfying card reveal and add the card to my weekly deck,
So that effort becomes immediate, visible progress.

**Acceptance Criteria:**

**Given** a plausible reflection result for a valid session
**When** reward resolution runs
**Then** card type is mapped from work tag and reveal sequence is triggered before completion
**And** the awarded card and session outcome are persisted so progress survives app restart.

## Epic 2: Card and Deck Foundations

Players can build and understand a complete weekly deck with card attributes, starter cards, duplicates, and cap rules.

### Story 2.1: Define Card Domain Model and Persistence Mapping

As a developer,
I want a canonical card model and repository mapping between app/domain and SQLite,
So that cards are stored consistently and safely across the app lifecycle.

**Acceptance Criteria:**

**Given** card data needs persistence
**When** card entities are created/read via repositories
**Then** required fields (name, type, damage, shield, effect, optional selective cost, synergy text) are represented consistently
**And** DB `snake_case` to app `camelCase` mapping is enforced at repository boundaries.

### Story 2.2: Render Full Card Face with Type Clarity

As a player,
I want each card to clearly show all gameplay information,
So that I can understand what the card does at a glance.

**Acceptance Criteria:**

**Given** I view a card in deck or reveal contexts
**When** the card UI renders
**Then** it displays name, type tag, damage, shield, effect text, selective cost notation (if present), and synergy description
**And** type styling remains visually distinct and readable.

### Story 2.3: Enforce Daily Earn Limit and Weekly Deck Cap

As a player,
I want card earning to follow clear weekly structure limits,
So that the run stays balanced and predictable.

**Acceptance Criteria:**

**Given** I have already earned 3 cards in a day
**When** I complete another valid session that day
**Then** no additional card is added for that day
**And** weekly deck total never exceeds 18 cards including starters.

### Story 2.4: Issue Monday Starter Cards Automatically

As a player,
I want to receive 3 starter cards every Monday reset,
So that I can always enter battles even with low early-week activity.

**Acceptance Criteria:**

**Given** a new weekly cycle begins on Monday
**When** reset orchestration runs
**Then** 3 fixed starter cards are added exactly once for the new week
**And** starter issuance state persists across app restart to prevent duplicate grants.

### Story 2.5: Support Duplicate Cards in Weekly Deck

As a player,
I want duplicate cards to be retained when I earn repeated work-type outcomes,
So that my deck reflects how my real week actually went.

**Acceptance Criteria:**

**Given** I earn the same card type multiple times
**When** cards are added to weekly deck
**Then** duplicates are stored and visible as separate instances/entries
**And** duplicate handling does not break deck cap or battle draw logic.

## Epic 3: Daily Battle Experience

Players can enter and complete daily battles with clear turn flow, enemy intent visibility, and outcome consequences.

### Story 3.1: Unlock and Enter Daily Mini-Battle from Valid Day State

As a player,
I want the daily mini-battle to unlock only after my first card draw of the day,
So that battle cadence matches the intended daily rhythm.

**Acceptance Criteria:**

**Given** I have not earned a card today
**When** I open the home flow
**Then** daily battle entry is locked
**And** it unlocks after the first successful card draw of that day.

### Story 3.2: Initialize Battle Board with Correct Daily Deck and Layout

As a player,
I want to see a clear battle board with enemy top, hand bottom, and HP visibility,
So that I immediately understand the encounter state.

**Acceptance Criteria:**

**Given** I start a daily battle
**When** battle scene loads
**Then** only that day's earned cards are loaded into battle deck
**And** layout presents enemy at top-center, player hand at bottom, with both HP bars visible.

### Story 3.3: Execute Core Turn Loop (Draw 3, Play 1, Discard 2)

As a player,
I want a predictable turn system with meaningful card choice each turn,
So that combat feels strategic and consistent.

**Acceptance Criteria:**

**Given** a running battle turn
**When** my turn starts
**Then** exactly 3 cards are drawn to hand
**And** after I play 1 card, remaining 2 are discarded before enemy phase begins.

### Story 3.4: Resolve Card Effects, Selective Costs, and Deck Reshuffle

As a player,
I want card effects and costs to resolve correctly,
So that battle outcomes are trustworthy and learnable.

**Acceptance Criteria:**

**Given** I play a card with effects (and optional selective cost)
**When** play resolves
**Then** effects apply immediately and selective cost constraints are enforced in subsequent valid state
**And** when draw pile is exhausted, discard pile reshuffles and battle continues without state corruption.

### Story 3.5: Show Enemy Intent and Execute Enemy Phase Deterministically

As a player,
I want to see the enemy's next action before my choice,
So that I can make informed tactical decisions.

**Acceptance Criteria:**

**Given** a new player turn
**When** the battle UI updates
**Then** enemy intent (attack/shield/special) is visible before card selection
**And** enemy phase executes the displayed intent deterministically after player phase.

### Story 3.6: Complete Battle Outcomes with Rewards and Consequences

As a player,
I want wins and losses to resolve clearly with the right reward/consequence path,
So that battle results feel meaningful and fair.

**Acceptance Criteria:**

**Given** battle reaches terminal state
**When** enemy HP reaches zero
**Then** win state is shown and full daily rewards are granted
**And** when player HP reaches zero, loss state is shown with reduced rewards and optional Revenge Task assignment.

## Epic 4: Weekly Progression Arc

Players experience the full Monday-to-Friday cadence, culminating in a staged weekly boss and reflective results.

### Story 4.1: Execute Monday Reset and Start New Weekly Cycle

As a player,
I want the week to reset cleanly on Monday,
So that each run starts fresh and fair.

**Acceptance Criteria:**

**Given** a previous weekly cycle exists
**When** Monday reset is triggered
**Then** earned weekly cards are cleared and new weekly state is initialized
**And** reset persists correctly across app restarts without duplicate reset behavior.

### Story 4.2: Capture Weekly Epic Declaration

As a player,
I want to declare my weekly Epic goal at the start of the week,
So that my run has motivational intent.

**Acceptance Criteria:**

**Given** a new week has started
**When** I enter and confirm an Epic declaration
**Then** the declaration is saved and shown in weekly context
**And** it has no mechanical gameplay modifiers in MVP.

### Story 4.3: Gate Weekly Boss Access to End-of-Week Window

As a player,
I want weekly boss access to unlock only at the correct time,
So that the weekly rhythm is preserved.

**Acceptance Criteria:**

**Given** it is before end of the 5-day window
**When** I attempt to enter weekly boss
**Then** entry is blocked with clear state messaging
**And** boss entry unlocks only when end-of-week criteria are met.

### Story 4.4: Run Multi-Stage Weekly Boss with Full Weekly Deck

As a player,
I want to fight a staged boss using the full weekly deck,
So that the week's effort culminates in a meaningful challenge.

**Acceptance Criteria:**

**Given** weekly boss is unlocked
**When** I start the encounter
**Then** the full accumulated weekly deck is used for combat
**And** boss progresses through at least 3 stages with boss HP reset per stage.

### Story 4.5: Tune Stage Accessibility and Mastery Targets

As a player,
I want early stages to be approachable and deep stages to reward disciplined play,
So that progression feels motivating and skillful.

**Acceptance Criteria:**

**Given** stage tuning configuration
**When** Stage 1 is simulated/tested with minimal qualifying deck
**Then** Stage 1 is realistically beatable with 1 session's card baseline
**And** Stage 3 tuning requires a fuller, synergy-aware deck to clear reliably.

### Story 4.6: Resolve Weekly Boss Outcomes and Meta-XP

As a player,
I want weekly completion to grant progress regardless of outcome,
So that no week feels wasted.

**Acceptance Criteria:**

**Given** a weekly boss run ends at any stage outcome
**When** result resolution executes
**Then** meta-XP is awarded regardless of victory depth
**And** outcome state is persisted for weekly summary.

### Story 4.7: Present Weekly Results Screen

As a player,
I want a clear end-of-week results view,
So that I can reflect on effort and progression.

**Acceptance Criteria:**

**Given** weekly boss resolution is complete
**When** results screen loads
**Then** it displays cards earned, stages reached, and sessions logged
**And** values match persisted weekly records.

## Epic 5: Motivation, UX Feel, and Engagement

Players get a rewarding, readable, and habit-forming interface with strong reveal moments and reminders.

### Story 5.1: Surface the Correct Next Action on Home

As a player,
I want the home screen to always show my most relevant next action,
So that I can stay in flow without guessing what to do next.

**Acceptance Criteria:**

**Given** my current game state (session eligibility, daily battle availability, weekly boss lock/unlock)
**When** I open or return to home
**Then** the primary CTA reflects the correct next action (log session / daily battle / weekly boss)
**And** CTA transitions update immediately after state-changing events.

### Story 5.2: Implement Visual System for CardWork's Light, Bold Style

As a player,
I want a clean and energetic visual language,
So that the app feels motivating and easy to read.

**Acceptance Criteria:**

**Given** core gameplay screens
**When** UI theme tokens are applied
**Then** surfaces follow a bright, whitespace-first style with rounded components
**And** each card type uses a distinct bold accent color consistent across cards, buttons, and status cues.

### Story 5.3: Deliver Priority Card Reveal Animation

As a player,
I want card reveals to feel like a major reward moment,
So that completing a valid session feels emotionally satisfying.

**Acceptance Criteria:**

**Given** a card is awarded after valid session completion
**When** reveal sequence starts
**Then** a high-priority reveal animation plays before returning to normal flow
**And** reveal timing and interaction lock preserve the intended cinematic reward beat (~1 minute target) without double-triggering.

### Story 5.4: Ensure Input Parity Across Desktop and Mobile

As a player,
I want interaction behavior to feel consistent between PC and mobile,
So that controls remain intuitive on both platforms.

**Acceptance Criteria:**

**Given** any tappable gameplay control
**When** used on desktop or mobile
**Then** click interactions on PC map directly to tap interactions on mobile without keyboard dependency
**And** interaction outcomes remain functionally equivalent across platforms.

### Story 5.5: Enforce Mobile Tap-Target Accessibility Minimums

As a mobile player,
I want controls sized for reliable thumb interaction,
So that I can avoid mis-taps during key gameplay moments.

**Acceptance Criteria:**

**Given** interactive UI elements on mobile layouts
**When** rendered at runtime
**Then** all tappable targets meet or exceed 44x44pt minimum hit area
**And** dense layouts maintain this minimum via spacing or expanded hit slop.

### Story 5.6: Schedule and Trigger Engagement Notifications

As a player,
I want reminders at the right moments,
So that I remember to complete daily and weekly commitments.

**Acceptance Criteria:**

**Given** notification permissions are granted
**When** schedule rules are evaluated
**Then** daily battle reminders, weekly boss reminders, and session streak nudges are created with channelized delivery
**And** reminders adapt to player progress state to avoid irrelevant notifications.

## Epic 6: Integrity, Offline Reliability, and Performance

Players can trust the app to stay fast, preserve progress, and function reliably without network dependency.

### Story 6.1: Establish Offline-First Local Data Layer with SQLite

As a developer,
I want core gameplay entities persisted in local SQLite with versioned migrations,
So that the full MVP loop runs without server dependency.

**Acceptance Criteria:**

**Given** a fresh install or upgraded app version
**When** data layer initialization runs
**Then** required local tables for sessions, cards, decks, battles, weekly cycle, and progression exist with current schema version
**And** migration execution is forward-only and deterministic using tracked DB user version.

### Story 6.2: Implement Crash-Safe Write and Recovery Guarantees

As a player,
I want my progress to survive app crashes and restarts,
So that I never lose critical run data.

**Acceptance Criteria:**

**Given** a state-changing operation (session completion, card award, battle outcome)
**When** persistence occurs and the app is interrupted unexpectedly
**Then** committed records remain intact after restart without partial-corruption state
**And** recovery flow restores a consistent last-known-valid game state with no critical data loss.

### Story 6.3: Build Offline AI Fallback and Intent Outbox Handling

As a player,
I want intent/reflection steps to remain playable when network is unavailable,
So that the core loop never blocks on connectivity.

**Acceptance Criteria:**

**Given** AI provider is unreachable or request times out
**When** classification or plausibility evaluation is requested
**Then** fallback behavior activates (manual tag path and defined reflection handling) without blocking progression
**And** unresolved AI requests are tracked in a local outbox model for optional later reconciliation.

### Story 6.4: Meet Cold-Start Performance Budget

As a player,
I want the app to open quickly,
So that starting a work session feels immediate.

**Acceptance Criteria:**

**Given** production-like build on target devices
**When** app launches from cold start
**Then** time-to-interactive is under 3 seconds under defined test conditions
**And** startup instrumentation captures timing data to verify budget adherence.

### Story 6.5: Meet Instant Session Log Screen Performance Target

As a player,
I want the session log screen to appear instantly,
So that reviewing my history feels frictionless.

**Acceptance Criteria:**

**Given** realistic local dataset sizes for MVP usage
**When** I open the session log screen
**Then** first meaningful content appears within 0.5 seconds
**And** query strategy/index usage is tuned to sustain this target on supported devices.
