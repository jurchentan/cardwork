# CardWork — Development Epics

**Project:** CardWork
**Author:** Jack.ark
**Date:** 2026-03-17
**Status:** Draft — from GDD workflow

---

## Epic Overview

| # | Epic Name | Scope | Dependencies | Est. Stories |
|---|---|---|---|---|
| 1 | Foundation & Core Loop | Session logging, timer, AI classification, reflection input, card draw reveal | None | 6–8 |
| 2 | Card System | Card types, attributes, description/synergy text, 18-card deck, starter cards | Epic 1 | 5–7 |
| 3 | Battle System | Turn structure, hand management, daily mini-battle, enemy AI, win/lose | Epic 2 | 6–8 |
| 4 | Weekly Structure | Weekly reset, Epic declaration, boss stages, results screen, Revenge Task | Epic 3 | 6–8 |
| 5 | UI & Game Feel | Duolingo aesthetic, card draw animation, battle feedback, push notifications | Epic 3 | 5–7 |
| 6 | Integrity & Polish | 30-min gate, AI plausibility check, offline-first, local persistence | Epic 4 + 5 | 4–6 |

---

## Epic 1: Foundation & Core Loop

### Goal

Establish the heartbeat of the game — a player can log a work session, receive a card, and see it added to their deck. Nothing else exists without this.

### Scope

**Includes:**
- Session intent input (text/voice) with AI work type classification
- Session timer (start/stop)
- 30-minute minimum session duration enforcement
- Post-session reflection input (text/voice)
- AI plausibility check on reflection (basic — pass/fail)
- Card draw trigger on successful reflection
- Card draw reveal animation (placeholder)
- Card added to weekly deck (local state)
- Basic app shell and navigation (home screen, log screen, deck screen)
- Local data persistence for session and deck state

**Excludes:**
- Battle system (Epic 3)
- Weekly boss (Epic 4)
- Full Duolingo UI polish (Epic 5)
- Offline hardening (Epic 6)

### Dependencies

None — this is the foundation epic.

### Deliverable

A player can open the app, speak their session intent, run a timer for 30+ minutes, give a reflection, and see a card appear in their deck. The loop closes. No battle yet — just the earn side of the game.

### Stories

- As a player, I can speak or type my session intent so that the AI classifies it into a work type tag
- As a player, I can start and stop a session timer so that my work session is tracked
- As a player, I am prevented from ending a session before 30 minutes so that card rewards reflect real effort
- As a player, I can give a short reflection after my session so that the game evaluates whether I completed meaningful work
- As a player, I receive a card when my reflection is accepted so that my effort is immediately rewarded
- As a player, I can see my earned cards in my weekly deck so that I know what I've built this week
- As a player, my session and deck data is saved locally so that I don't lose progress if I close the app

---

## Epic 2: Card System

### Goal

Define and implement the full card object — types, attributes, effects, selective costs, and description text including synergy information. Cards must exist as complete game objects before battles can be fought.

### Scope

**Includes:**
- 4 card types: [Focus], [Body], [Mind], [Rest]
- Card attributes: Damage, Shield, Effect values
- Selective cost notation (effect-based costs on specific cards)
- Card description text (includes synergy information where applicable)
- Typographic card UI design (no illustrations — text-based layout)
- Card type → colour coding (one accent colour per type)
- 3 starter cards (fixed set for MVP, issued every Monday)
- 18-card weekly deck maximum (3 sessions/day × 5 days + 3 starters)
- Duplicate card handling
- Card data structure and local storage

**Excludes:**
- Card rarity tiers (post-MVP)
- Card upgrading (post-MVP)
- Epic-influenced starter cards (post-MVP)
- Full synergy balancing (ongoing — card design phase)

### Dependencies

Epic 1 — cards must be generated from sessions before the card system can be tested end-to-end.

### Deliverable

A complete card object exists and renders correctly. All 4 card types display with correct attributes, description text, and colour coding. The 18-card weekly deck structure is functional. Starter cards are issued on Monday reset.

### Stories

- As a developer, I can define a card object with type, damage, shield, effect, cost, and description so that cards have consistent structure
- As a player, I can see my earned card displayed with all its attributes so that I understand what I've earned
- As a player, I can see synergy information in a card's description text so that I can discover combinations naturally
- As a player, I receive 3 starter cards at the start of each week so that I can battle even if I haven't logged yet
- As a player, my weekly deck correctly caps at 18 cards so that the game respects the 5-day work week structure
- As a developer, card data persists correctly in local storage so that the deck survives app restarts

---

## Epic 3: Battle System

### Goal

Implement the full battle loop — Slay the Spire-style hand management, daily mini-battle, enemy AI, and win/lose conditions. End of this epic = first playable vertical slice.

### Scope

**Includes:**
- Battle screen layout (Slay the Spire style: cards bottom, enemy top)
- Draw 3 cards per turn from deck
- Play 1 card per turn (effect resolves immediately)
- Discard remaining 2 cards to discard pile
- Deck → hand → discard cycle (reshuffle when deck exhausted)
- Selective cost enforcement (cards with effect-based costs)
- Enemy HP, player HP display
- Enemy attack logic (basic fixed pattern for MVP)
- Win condition: enemy HP = 0
- Lose condition: player HP = 0
- Daily mini-battle access (unlocks after first card draw of the day)
- Win reward: full daily rewards (XP placeholder)
- Lose consequence: reduced rewards + Revenge Task assigned
- Revenge Task: small real-world prompt displayed on loss

**Excludes:**
- Weekly boss (Epic 4)
- Enemy intent reveal (post-MVP [Mind] mechanic)
- Full UI polish (Epic 5)
- Multiple enemy types / battle variety (post-MVP)

### Dependencies

Epic 2 — cards must exist as complete objects before battle can use them.

### Deliverable

**Vertical slice complete.** A player logs a session, earns a card, and fights a daily mini-battle with it. Win or lose, the consequence is clear. The core loop — log → draw → battle — is playable end-to-end.

### Stories

- As a player, I can see a battle screen with my hand at the bottom and enemy at the top so that the battle layout is clear
- As a player, I draw 3 cards at the start of each turn so that I always have choices
- As a player, I can play 1 card per turn and see its effect resolve immediately so that battle feels responsive
- As a player, my unplayed cards are discarded and my deck reshuffles when exhausted so that the card cycle works correctly
- As a player, I can see enemy HP and my own HP so that I understand the battle state
- As a player, I win the battle when enemy HP reaches zero so that effort is rewarded
- As a player, I lose the battle when my HP reaches zero and receive a Revenge Task so that failure is a re-engagement hook
- As a player, the daily mini-battle unlocks after my first card draw of the day so that the daily rhythm is enforced

---

## Epic 4: Weekly Structure

### Goal

Implement the full weekly cadence — Monday reset, Epic declaration, weekly boss with 3 stages, results screen, and the complete reward/consequence loop. After this epic, the game is feature-complete for MVP.

### Scope

**Includes:**
- Monday reset (weekly deck cleared, new week begins)
- Epic declaration screen (player names their week's goal — motivational only, no mechanical effect MVP)
- Weekly boss battle (uses full accumulated deck)
- Boss with 3 stages (HP resets between stages)
- Stage 1 tuned to be beatable with 1 session's cards
- Stage 3 requires full disciplined week + synergy play
- Weekly boss locked to end of 5-day window (cannot trigger early)
- Boss defeat/progress → meta-XP awarded (placeholder value)
- Weekly results screen (cards earned, stages reached, sessions logged)
- Full win/lose flow for boss (meta-XP awarded regardless of outcome)
- Weekly state persistence

**Excludes:**
- Meta-XP level system (post-MVP)
- Boss scaling to meta-level (post-MVP)
- Epic-themed bosses (post-MVP)
- Multiple boss visual designs (post-MVP)

### Dependencies

Epic 3 — battle system must be functional before the boss can be built on top of it.

### Deliverable

A complete week of CardWork is playable. Player declares Monday Epic, logs sessions Mon–Fri, fights daily battles, then fights the weekly boss on Friday. Results screen shows the week's story. Meta-XP awarded. Monday resets cleanly.

### Stories

- As a player, my deck and weekly state reset every Monday so that each week is a fresh start
- As a player, I can declare an Epic on Monday so that my week has a named goal and motivational focus
- As a player, I can fight the weekly boss using my full accumulated deck so that the week's effort has a climax
- As a player, the weekly boss has 3 stages with increasing difficulty so that different effort levels reach different depths
- As a player, I cannot trigger the weekly boss before the end of the 5-day window so that the weekly rhythm is preserved
- As a player, I see a results screen after the boss fight showing my week's stats so that I can reflect on my effort
- As a player, I earn meta-XP regardless of boss outcome so that no week feels wasted
- As a player, failing the boss at Stage 1 still awards meta-XP so that even a hard week has value

---

## Epic 5: UI & Game Feel

### Goal

Apply the Duolingo-inspired visual identity across all screens and implement the key feel moments — especially the card draw reveal animation. The game should feel like a reward to look at and interact with.

### Scope

**Includes:**
- Duolingo-inspired UI pass (white backgrounds, bold accent colours, rounded elements) across all screens
- Card draw reveal animation (~1 minute, Clash Royale chest-open energy) — highest priority
- Battle hit feedback animations (card play, damage dealt, shield absorbed)
- Stage clear celebration moment
- Weekly results screen visual design
- Monday reset / Epic declaration screen visual design
- Push notifications (daily battle reminder, weekly boss reminder, session streak nudge)
- App icon and basic branding (placeholder acceptable)
- Card colour coding finalised (one accent colour per type)
- HP bar styling (Duolingo progress bar aesthetic)

**Excludes:**
- Audio (post-MVP entirely)
- World skin / lore visuals (post-MVP)
- Multiple arena visuals (post-MVP)
- Character/enemy illustrations (placeholder acceptable)

### Dependencies

Epic 3 — battle system must exist before feel can be applied to it.

### Deliverable

The game looks and feels like CardWork, not a prototype. The card draw animation earns its 1 minute. Battle feedback is punchy. Every interaction delivers a micro-reward signal.

### Stories

- As a player, all screens use the Duolingo-inspired visual style so that the game feels clean, modern, and motivational
- As a player, the card draw reveal plays a satisfying ~1 minute animation so that earning a card feels like a genuine reward
- As a player, playing a card in battle produces satisfying hit feedback so that every action feels responsive
- As a player, clearing a boss stage triggers a celebratory moment so that progress is acknowledged
- As a player, I receive push notifications reminding me to log sessions and fight battles so that the game stays in my daily routine
- As a player, card colours clearly distinguish the 4 card types so that my hand is readable at a glance

---

## Epic 6: Integrity & Polish

### Goal

Harden the game's integrity systems, close offline gaps, and ensure the session gate and AI plausibility checks work robustly. Make the game shippable.

### Scope

**Includes:**
- 30-minute session gate — robust enforcement, tamper-resistant timer
- AI plausibility check robustness (handle edge cases: empty reflection, gibberish, offline)
- Offline fallback flow (manual work type tag selection when AI unavailable)
- Reflection stored locally and synced when online
- Local data persistence audit (no data loss on crash, app kill, device restart)
- Session timer reliability on mobile (background timer accuracy)
- Data privacy — session descriptions and reflections handled appropriately
- Basic error states and empty states (no sessions logged, no cards, failed AI call)
- Performance pass (cold-start under 3 seconds, session log screen instant)
- Bug fix and stability pass

**Excludes:**
- Pattern detection / advanced integrity (post-MVP)
- Cloud saves (post-MVP)
- Analytics / telemetry (post-MVP)

### Dependencies

Epics 4 + 5 — all features must exist before integrity and polish pass can be comprehensive.

### Deliverable

A shippable MVP. Core loop is stable, session gate is enforced, offline works, no critical data loss scenarios. Ready for closed beta.

### Stories

- As a player, I cannot bypass the 30-minute session minimum so that card rewards are always earned honestly
- As a player, the app correctly handles AI unavailability with a manual fallback so that I can always log sessions
- As a player, my session data is never lost if the app crashes or I close it mid-session so that my work is always recorded
- As a player, the app opens in under 3 seconds so that logging a session is faster than opening Instagram
- As a developer, all offline scenarios are tested and handled gracefully so that the game works without internet
- As a developer, session descriptions and reflections are stored with appropriate privacy handling so that user data is protected
