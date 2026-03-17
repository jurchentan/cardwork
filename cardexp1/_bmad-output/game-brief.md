---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/brainstorming/jessiclaw-legacy-brainstorming.md'
documentCounts:
  brainstorming: 1
  research: 0
  notes: 0
workflowType: 'game-brief'
lastStep: 0
project_name: 'cardexp1'
user_name: 'Jack.ark'
date: '2026-03-17'
game_name: 'CardWork'
---

# Game Brief: CardWork

**Date:** 2026-03-17
**Author:** Jack.ark
**Status:** Draft for GDD Development

---

## Executive Summary

CardWork is a deck-building RPG where your real-world productivity sessions generate the cards you battle with each week. Built for people who want to be productive but keep losing the battle to procrastination and doing nothing, CardWork redirects the same short-hit dopamine loop that powers social media toward real effort. Log your work, earn your cards, fight your boss.

**Target Audience:** 18–35 year olds who want to be productive, play games casually, and respond to short-session high-feedback loops.

**Core Pillars:** Effort Integrity · Short-Hit Satisfaction · Strategic Depth · Progressive Mastery

**Key Differentiators:** Your deck is your work week. The loop competes with TikTok, not Todoist. No zero weeks — the boss is always beatable from Stage 1. AI classifies session input into a work type tag; fixed lookup table selects the card — minimal AI cost, no generation.

**Platform:** Mobile (iOS/Android)

**Success Vision:** Players open CardWork instead of scrolling Instagram — because logging a session and drawing a card feels better than doing nothing.

---

## Game Vision

### Core Concept

A deck-building RPG where your real-world productivity sessions generate the cards you battle with each week.

### Elevator Pitch

CardWork is a weekly deck-building RPG where your real productivity builds your battle deck. Log your work sessions each day — deep focus, task sprints, learning, recovery — and watch your work week transform into a hand of cards. At the end of the week, you fight the boss with exactly the deck your effort earned.

### Vision Statement

CardWork is built for people who want to be productive but keep losing the battle to procrastination and doing nothing. The same short-term reward loop that makes social media addictive — the hit, the reveal, the next stage — is rebuilt here around real effort. Every work session earns cards. Every card is a small win. On Friday you open your hand, walk into battle, and feel exactly how well your week went — not as a statistic, but as a fight you win or lose on your own terms. The deeper your routine, the higher the stage you reach. That feeling is the product.

---

## Target Market

### Primary Audience

People aged 18–35 who want to be more productive but consistently lose attention to passive consumption — social media, doomscrolling, doing nothing. They've tried productivity apps and found them boring or joyless. They play mobile or PC games casually and respond to short-session, high-feedback loops.

### Secondary Audience

Existing deck-builder and card game fans (Slay the Spire, Hearthstone players) open to a game with a real-world hook. Also students, freelancers, and indie hackers who already track their time and would find the card metaphor immediately compelling.

### Market Context

The productivity app market is saturated with utilitarian tools (Todoist, Notion, Toggl). The gamified productivity space is thin and mostly shallow (Habitica, Forest). The card/deck-builder genre is proven and has a loyal audience. CardWork sits at an unoccupied intersection: the dopamine loop of a card game, pointed at real-world effort. The direct competitor for attention is not Todoist — it's TikTok and Instagram.

---

## Game Fundamentals

### Core Gameplay Pillars

**1. Effort Integrity**
The cards you earn must honestly reflect the work you did. No shortcuts, no fake loops. The game only works if the input is real.

**2. Short-Hit Satisfaction**
Every interaction — logging a session, drawing a card, playing a hand — must deliver an immediate dopamine hit. No deferred rewards without micro-rewards along the way.

**3. Strategic Depth**
The battle layer must have enough decision-making that skill matters. Your hand is shaped by effort; how you play it is shaped by thinking.

**4. Progressive Mastery**
A brand new player with 1 day of work should taste victory. A disciplined weekly player should unlock things the casual player never sees.

**Pillar Priority:** When pillars conflict, prioritize: Effort Integrity → Short-Hit Satisfaction → Progressive Mastery → Strategic Depth

### Primary Mechanics

- **Log** — start a timer, tag the work type, end the session
- **Draw** — receive a card generated from that session
- **Build** — watch your deck grow across the week
- **Deploy** — choose which cards to play in battle
- **Battle** — fight staged encounters with your earned hand
- **Progress** — push through boss stages based on deck strength and play skill
- **Unlock** — earn meta-progression rewards that persist week to week

**Core Loop:** Log work → earn cards → build weekly deck → daily mini-battles and events (immediate feedback) → weekly boss battle (Epic climax) → unlock meta rewards → declare next week's Epic

**Battle Cadence:**
- *Daily / per-session:* Mini-battles and events fire from cards earned that day — immediate dopamine, small wins, keeps engagement tight throughout the week
- *Weekly:* The big boss — fought with the full accumulated week's deck — is the climax of the Epic. Multi-staged: even 1 day of work can clear Stage 1; a full disciplined week can reach the deepest stages.

### Player Experience Goals

| Feeling | When It Fires |
|---------|--------------|
| **Recognition** | Opening your hand and seeing your week reflected back as cards |
| **Anticipation** | Knowing a long session today earns a more powerful card |
| **Tension** | Playing your hand against the boss — will it be enough? |
| **Satisfaction** | Clearing a boss stage you couldn't reach last week |
| **Identity** | Your deck shape tells the story of how you work |

**Emotional Journey:** Slow build (Monday/Tuesday) → momentum (mid-week) → anticipation (Thursday) → payoff (Friday boss battle) → reflection (results screen) → renewed motivation (new Epic declared Monday)

---

## Scope and Constraints

### Target Platforms

**Primary:** Mobile (iOS/Android)
**Secondary:** PC/Web — post-MVP

### Budget Considerations

Self-funded / shoestring. No outsourcing budget for MVP. All development handled in-house by the small team. Art and music capability exists within the team but is deferred post-MVP — MVP ships with placeholder/minimal assets.

### Team Resources

Small team. Core roles covered in-house. Art and audio production intentionally scoped out of MVP to maintain focus on core loop validation.

**Skill Gaps:** None blocking MVP — art and music are a known gap addressed post-MVP.

### Technical Constraints

- Greenfield — no engine committed yet
- Mobile-first design: touch controls, short session architecture, offline-capable
- No multiplayer or online features for MVP
- No external service dependencies for MVP (no server-side card generation, no cloud saves required at launch)
- Timer + tag input is the only data collection mechanism — keep it frictionless

### Scope Realities

MVP proves one thing: does the productivity → card → battle loop create genuine motivation to work? Everything else is post-validation. Ship lean, learn fast.

---

## Reference Framework

### Inspiration Games

**Slay the Spire**
- Taking: Deck-building as the strategic core, run structure, card synergy depth, roguelite meta-progression
- Not Taking: Random map exploration, purely fictional context, no real-world input hook

**Clash Royale**
- Taking: Short-session card deployment, immediate battle feedback, mobile-native feel, always-one-more-battle loop
- Not Taking: PvP / competitive ladder, real-money card upgrades, pay-to-win mechanics

**TikTok / Instagram** *(engagement model reference, not a game)*
- Taking: The short-hit dopamine loop, the scroll-reveal mechanic as inspiration for card draw, habitual daily opening
- Not Taking: Passive consumption, infinite feed, zero real-world output required

**Habitica**
- Taking: Productivity as the input to game progress, daily habit tracking concept
- Not Taking: Avatar RPG skin over a to-do list, shallow game mechanics, no real strategic layer

### Competitive Analysis

**Direct Competitors:**

| Competitor | What They Do Well | Where They Fall Short |
|-----------|------------------|----------------------|
| Habitica | Productivity input concept | Game layer is too shallow — feels like a to-do list with a costume |
| Forest / Be Focused | Timer-based focus sessions | Zero game output — no strategic reward loop |
| Slay the Spire | Deep card strategy, satisfying runs | No real-world input — progression is purely fictional |
| Clash Royale | Mobile card battles, habit-forming sessions | No personal meaning — cards have no connection to your life |

### Key Differentiators

1. **Your deck is your work week** — no other card game uses real-world effort as the literal input to card generation
2. **The loop competes with social media, not productivity apps** — competing for the same dopamine budget as TikTok, redirected toward real effort
3. **Staged bosses mean no zero weeks** — even one session gets you into the fight; a full disciplined week unlocks deeper stages
4. **Work identity = deck identity** — how you work shapes what you play with, creating genuine self-reflection

**Unique Value Proposition:**
CardWork is the only card battler where the strength of your hand is a direct reflection of your real work week — making productivity feel like progress you can fight with.

---

## Content Framework

### World and Setting

Abstract / minimal for MVP. No world skin, no lore. Clean UI focused entirely on the card and battle mechanics. Post-MVP: conceptual enemies and bosses themed to the player's declared Epic goal — gym week spawns physical challenge bosses, coding week spawns logic bosses, social week spawns social bosses. The world grows from the player's real goals.

### Narrative Approach

Emergent / minimal. The deck IS the narrative. The story of the week is told through the results screen after the boss fight — cards earned, stages reached, work types logged. No cutscenes or dialogue for MVP.

**Story Delivery:** Results screen post-battle. Deck composition as self-reflection. No authored narrative for MVP.

### Content Volume

MVP content scope:
- 4 card classes × 4 rarity tiers = 16 base card variants
- 1 boss with 3 stages
- Daily mini-battle encounter pool (small set, expandable post-MVP)
- Weekly Epic declaration screen

---

## Art and Audio Direction

### Visual Style

Pixel art, clean and motivational. Deferred to post-MVP — placeholder assets ship with MVP. Reference mood: clean, readable, satisfying feedback animations (card draw, battle hit, stage clear).

**References:** Slay the Spire (card readability), Clash Royale (mobile battle feedback), clean motivational aesthetic

### Audio Style

Deferred to post-MVP. Team has in-house capability — music and sound production begins after core loop validation.

### Production Approach

Asset store / placeholder assets for MVP. In-house pixel art and music production begins post-loop validation. AI tools acceptable for placeholder content during development.

---

## Risk Assessment

### Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Loop doesn't feel motivating | High | Critical | MVP exists to test this — tight card draw feedback, session summary screen, immediate mini-battle after logging |
| Mid-week drop-off | High | High | Daily mini-battles ensure there's always a reason to open the app today |
| Feature creep before validation | High | High | Hard MVP scope discipline — ship the loop first, everything else post-validation |
| Boss difficulty imbalance | Medium | High | Stage 1 beatable with 1 card; staged playtesting before launch |
| Trust abuse (fake sessions) | High | Medium | Trust is an MVP philosophy; self-correcting (fake decks = weak play); pattern detection post-MVP |
| Discoverability | Medium | Medium | Post-MVP problem — MVP validates loop, not acquisition |

### Technical Challenges

- Card generation is deterministic — AI performs a single lightweight classification call to map the user's session description to one of 4 work type tags; a fixed lookup table then selects the card. No dynamic card generation, no AI-authored content.
- Battle balance: staged boss difficulty must scale correctly with realistic deck sizes (1 day vs 5 days of work)
- Mobile timer reliability: background timer accuracy on iOS/Android
- Offline-first architecture: no server dependency for MVP

### Market Risks

- Gamified productivity is a proven failure category — CardWork must feel like a real game first, productivity tool second
- Mobile card game market is competitive — discoverability is a post-MVP challenge

### Mitigation Strategies

- Validate the core loop with a small closed beta before public launch
- Prioritise game feel over feature completeness — the card draw and battle animations must feel satisfying even with placeholder art
- Keep MVP scope locked — Epic themes, world skin, and audio are explicitly post-MVP

---

## Success Criteria

### MVP Definition

The minimum shippable CardWork proves one thing: does the productivity → card → battle loop create genuine motivation to work?

Feature set:
- Timer input with spoken/typed session description
- AI classification of session description → one of 4 work type tags (Deep Focus, Execution, Learning, Recovery) — single lightweight classification call only
- Deterministic card selection: work type + duration → fixed card from predefined lookup table (16 base card variants)
- Daily mini-battle using that day's earned cards
- Weekly boss with 3 stages
- Weekly Epic declaration screen
- Basic meta-progression (XP / level carries week to week)
- Placeholder art, no audio

Explicitly out of scope for MVP: world skin, Epic-themed bosses, art production, music, multiplayer, cloud saves, AI-generated card content

### Success Metrics

- Players log at least 3 sessions in their first week
- 40%+ of players return for a second weekly Epic
- Qualitative beta feedback confirms card draw feels rewarding
- Revenue covers hosting/distribution costs within 3 months of launch

### Launch Goals

Closed beta with target audience first. Validate loop before public release. App Store + Google Play launch post-validation.

---

## Next Steps

### Immediate Actions

1. Proceed to GDD — translate this brief into a full game design spec
2. Design the deterministic card lookup table — 4 types × 4 rarities = 16 base cards, design each card's battle effect
3. Prototype the core loop — session input → AI tag classification → card draw → mini-battle in the simplest possible implementation
4. Design the staged boss encounter — Stage 1 beatable with 1 card, Stage 3 requires a full strong week

### Research Needs

- Mobile timer reliability on iOS/Android background processes
- App Store / Google Play submission requirements
- Lightweight AI classification API options (cost per call, latency, offline fallback)
- Existing card battle engines / frameworks suitable for mobile

### Open Questions

- What does the meta-progression system unlock week to week?
- How are daily mini-battle encounters structured — fixed encounters or a small rotating pool?
- Does the weekly Epic declaration affect anything mechanically in MVP, or is it purely motivational framing?
- What is the offline fallback if AI classification is unavailable — manual tag selection?

---

## Appendices

### A. Research Summary

Primary input: Jessiclaw Legacy Brainstorming Session (2026-03-17) — 50 ideas across cross-pollination, SCAMPER, and assumption-reversal techniques. Key synthesis candidates informed the card agency system and strategic layer design.

### B. Stakeholder Input

Designed in collaboration with Jack.ark. Key decisions: hard 7-day weekly reset, deterministic card generation with lightweight AI classification, 4 work type tags for MVP, staged boss with minimum Stage 1 reachable from 1 day's work, daily mini-battles for mid-week engagement, post-MVP Epic-themed conceptual bosses.

### C. References

- Slay the Spire — deck-building structure and roguelite progression
- Clash Royale — mobile card battle loop and session cadence
- Habitica — productivity-as-input concept (avoided: shallow game layer)
- TikTok / Instagram — engagement model reference (dopamine loop redirected toward effort)

---

_This Game Brief serves as the foundational input for Game Design Document (GDD) creation._

_Next Steps: Use the `bmad-gds-gdd` command to create detailed game design documentation._
