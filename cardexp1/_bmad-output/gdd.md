---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - '_bmad-output/game-brief.md'
  - '_bmad-output/brainstorming/jessiclaw-legacy-brainstorming.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: 'gdd'
lastStep: 0
project_name: 'cardexp1'
user_name: 'Jack.ark'
date: '2026-03-17'
game_type: 'card-game'
game_name: 'CardWork'
---

# CardWork - Game Design Document

**Author:** Jack.ark
**Game Type:** Card Game (Deck-Building RPG)
**Target Platform(s):** PC (development), Mobile iOS/Android (target)

---

## Executive Summary

### Game Name

CardWork

### Core Concept

CardWork is a deck-building RPG where your real-world productivity sessions generate the cards you battle with each week. Log your work sessions each day — deep focus, task sprints, learning, recovery — and watch your work week transform into a hand of cards. At the end of the week, you fight the boss with exactly the deck your effort earned.

The game is built for people who want to be productive but keep losing the battle to procrastination and doing nothing. The same short-term reward loop that makes social media addictive — the hit, the reveal, the next stage — is rebuilt here around real effort. Every work session earns cards. Every card is a small win. On Friday you open your hand, walk into battle, and feel exactly how well your week went — not as a statistic, but as a fight you win or lose on your own terms.

### Game Type

**Type:** Card Game (`card-game`)
**Framework:** This GDD uses the card-game template with type-specific sections for card types & effects, deck building, resource system, turn structure, card collection & progression, and game modes.

### Target Audience

**Primary:** Ages 18–35, productivity-minded individuals who consistently lose attention to passive consumption. They want to grow in the real world but find traditional productivity tools joyless.

**Secondary:** Existing card game and deck-builder fans (Slay the Spire, Hearthstone players) — bonus audience, not the design target.

### Unique Selling Points (USPs)

1. **Your deck is your work week** — real-world effort is the literal input to card generation
2. **Competing for the dopamine budget, not the productivity budget** — same neurological loop as Instagram, pointed at real effort
3. **Real-world synergies between habits** — cards that reflect reinforcing real-world habits buff each other in battle
4. **No zero weeks** — staged bosses mean everyone fights, regardless of how the week went

---

## Goals and Context

### Project Goals

1. **Validate the addiction transfer** *(Player Impact — MVP)*
   Prove that the productivity → card → battle loop creates genuine motivation to open CardWork instead of Instagram Reels. Success is a player reaching for the app to log a session rather than to scroll.

2. **Ship lean, learn fast** *(Technical + Business)*
   Deliver a closed beta that proves the core loop before scaling. One boss. One week. One clear answer: does this feel better than doing nothing?

3. **Achieve early retention signals** *(Business)*
   40%+ of beta players return for a second weekly Epic. 3+ sessions logged in week one. These are the two metrics that tell us the loop works.

4. **Build a game, not a productivity tool** *(Creative)*
   CardWork must feel like a real game that happens to reward real work — not a habit tracker with a card costume. Strategic depth, satisfying card draw, and genuine battle tension are non-negotiable.

### Background and Rationale

CardWork was born from a personal problem: the same person who wants to be productive keeps losing to Clash Royale, Instagram Reels, and the next short-hit dopamine loop. Traditional productivity apps (Todoist, Notion, Habitica) fail not because they're badly designed, but because they're competing on the wrong axis — they're optimising for utility, while the enemy is optimising for *feel*.

The Jessiclaw / OpenClaw project surfaced the core card mechanic — real-world task logging generating items that feed into a game layer — but its payoff structure was long-arc: items accumulated across story threads, climaxes resolved over weeks, narrative outcomes required sustained investment. Rich design, wrong loop length. The player who loses to doomscrolling will never wait that long.

CardWork is the short-loop version of that same insight. The week is the arc. Friday is the climax. The card draw after a session is the hit. The enemy isn't Todoist — it's TikTok — and to beat TikTok you have to offer the same immediate neurochemical reward, pointed at something real.

---

## Unique Selling Points (USPs)

### Competitive Positioning

| Competitor | Strength | Gap CardWork Fills |
|---|---|---|
| Habitica | Productivity-as-input concept | Game layer is too shallow — feels like a to-do list with a costume |
| Forest / Be Focused | Timer-based focus | Zero game output — no strategic reward loop |
| Slay the Spire | Deep card strategy, satisfying runs | No real-world input — purely fictional progression |
| Clash Royale | Mobile card battles, habit-forming sessions | No personal meaning — cards have no connection to your life |
| Instagram Reels / TikTok | Short-hit dopamine loop, habitual opening | Passive consumption — zero real-world output |

### Differentiators

1. **Your deck is your work week**
   No other card game uses real-world effort as the literal input to card generation. Your hand is a direct reflection of your actual week — how you worked, what you focused on, how balanced your life was.

2. **Competing for the dopamine budget, not the productivity budget**
   CardWork is not a productivity tool. It is a short-hit reward loop — built on the same neurological mechanisms as Instagram and Clash Royale — that points the addiction at real effort. The loop closes in seconds (log), minutes (card draw), and the week's payoff (boss battle).

3. **Real-world synergies between habits**
   Cards carry real-world tags. Habits that reinforce each other in real life (training + nutrition, deep work + recovery) create card synergies in battle. The game rewards a balanced, holistic week — not just grinding one work type.

4. **No zero weeks — staged bosses mean everyone fights**
   Stage 1 is beatable with one session. A full disciplined week reaches deeper stages. Every player has skin in the game, regardless of how the week went.

---

## Target Platform(s)

### Primary Platform

**Development Platform:** PC (Windows/Mac)
**Target Platform:** Mobile (iOS/Android)

All design decisions are made with mobile-first intent. PC is the development environment for MVP — faster iteration, easier testing, Slay the Spire-style card UI. The game ships to mobile as its true home.

### Platform Considerations

- **PC (MVP):** Keyboard + mouse input, standard display resolutions, no battery/thermal constraints during development
- **Mobile (Target):** Touch-first controls, portrait or landscape TBD, short-session architecture, offline-capable, battery and thermal aware
- All UI layout decisions made with mobile screen sizes and thumb-reach in mind from day one
- No server dependency for MVP — offline-first architecture supports both platforms

### Control Scheme

- **PC:** Mouse-driven card selection and battle interactions; keyboard shortcuts optional
- **Mobile (target):** Tap to select, drag to play cards, swipe gestures for navigation — all PC interactions designed to map cleanly to touch

---

## Target Audience

### Demographics

**Primary:** Ages 18–35, productivity-minded individuals who consistently lose attention to passive consumption (social media, doomscrolling). They want to build better habits and grow in the real world, but find traditional productivity tools joyless.

**Secondary:** Existing card game and deck-builder fans (Slay the Spire, Hearthstone players) — attracted by the game's strategic depth and novelty hook. Bonus audience, not the design target.

### Gaming Experience

**Natural card developer** — players begin with simple card interactions and organically discover synergies over time. The game teaches through play, not tutorials. Complexity is earned, not front-loaded.

### Genre Familiarity

Designed for players who may be new to deck-builders or have light familiarity. Slay the Spire serves as a design and UI reference, but CardWork must be approachable without prior card game knowledge. Strategic depth reveals itself progressively as players build their real-world habits.

### Session Length

| Session Type | Target Duration |
|---|---|
| Log session (start/end) | ~10 seconds |
| Card draw reveal | ~1 minute |
| Daily mini-battle | ~10 minutes |
| Weekly boss battle | ~30 minutes |

Designed for a life that fits around work — not the other way around. The game lives in the margins of the player's day.

### Player Motivations

Players are drawn to CardWork because it makes real-world growth feel like in-game progress. The deeper their habits, the stronger their deck. The game rewards holistic improvement — not just grinding one work type, but building a life that fires on multiple cylinders. Real-world synergies between habits are reflected in card mechanics, reinforcing the message: *a balanced week builds a powerful deck*.

---

## Goals and Context

### Project Goals

{{goals}}

### Background and Rationale

{{context}}

## Core Gameplay

### Game Pillars

**1. Effort Integrity** *(Foundation — highest priority)*
The cards you earn must honestly reflect the work you did. No shortcuts, no fake loops. The game only works if the input is real. Every mechanic that touches card generation must protect this principle first.

**2. Short-Hit Satisfaction** *(Hook — the addiction transfer engine)*
Every interaction — logging a session, drawing a card, playing a hand — must deliver an immediate dopamine hit. No deferred rewards without micro-rewards along the way. This is what makes CardWork compete with Instagram Reels, not Todoist.

**3. Progressive Mastery** *(Growth — real world and in-game)*
A brand new player with 1 day of work tastes victory. A disciplined, consistent player unlocks card synergies and deeper boss stages that the casual player never sees. Mastery in the game mirrors mastery in real life — the player who grows their habits grows their deck.

**4. Strategic Depth** *(Skill ceiling — earns replay)*
The battle layer has enough decision-making that skill matters. Your hand is shaped by effort; how you play it is shaped by thinking. Synergies between real-world habit cards reward players who build balanced weeks.

**Pillar Priority:** When pillars conflict, prioritize:
> Effort Integrity → Short-Hit Satisfaction → Progressive Mastery → Strategic Depth

---

### Core Gameplay Loop

CardWork operates on two interlocking cadences — daily and weekly.

**Daily Loop:**
```
Log session (~10s)
    ↓
Card draw reveal (~1 min) — the hit
    ↓
[Continue day — earn more cards]
    ↓
Night: Daily mini-battle (~10 mins) — fight with today's earned cards
    ↓
Win: full rewards | Lose: reduced rewards OR receive a Revenge Task
    ↓
Sleep → next session tomorrow
```

**Weekly Loop:**
```
Monday: Reset + declare new Epic (choose your week's goal/theme)
    ↓
Mon–Thu: Daily log → card draw → mini-battles → deck accumulates
    ↓
Week's end: Weekly Boss Battle (~20 mins) — fight with full week's deck
    ↓
Multi-staged boss: Stage 1 beatable with 1 session's cards
    ↓
Win or lose: meta-XP awarded regardless — no zero weeks
    ↓
Results screen: see your week reflected in cards and stages reached
    ↓
Monday: Reset → new Epic → repeat
```

**Loop Timing Summary:**

| Action | Duration |
|---|---|
| Log session (start/end) | ~10 seconds |
| Card draw reveal | ~1 minute |
| Daily mini-battle | ~10 minutes |
| Weekly boss battle | ~20 minutes |

**Loop Variation:** Each iteration differs based on session work type (which card is drawn), deck composition built across the week, and boss stage depth reached. A Deep Focus week plays differently to a Physical + Recovery week.

---

### Win/Loss Conditions

#### Victory Conditions

| Scope | Victory | Reward |
|---|---|---|
| **Daily mini-battle** | Defeat the daily encounter | Full daily rewards (bonus cards, XP, resources) |
| **Weekly boss — any stage** | Clear at least Stage 1 | Meta-XP, progression carries to next week |
| **Weekly boss — deep stages** | Reach Stage 2, 3+ | Bonus unlocks, rare card rewards, prestige signals |

#### Failure Conditions

| Scope | Failure | Consequence |
|---|---|---|
| **Daily mini-battle loss** | Defeated by daily encounter | Reduced rewards OR Revenge Task assigned |
| **Weekly boss — Stage 1 fail** | Cannot clear even Stage 1 | Meta-XP still awarded — not a total loss |
| **Zero sessions in a week** | No cards earned, no deck | Week resets on Monday — no penalty, fresh start |

#### Failure Recovery

**Revenge Task:** When a daily mini-battle is lost, the game optionally assigns a small real-world task (e.g., "do 10 push-ups", "write 3 sentences"). Completing the revenge task before the next battle restores partial rewards. This turns failure into a re-engagement hook rather than a dead end.

**No zero-week punishment:** Missing an entire week results in no deck, no boss fight — but Monday simply resets with a clean slate and a new Epic. The game does not shame inactivity. It just waits.

**Boss Stage 1 as floor:** Even the worst week (1 session logged) builds a deck capable of reaching Stage 1. Failing Stage 1 still grants meta-XP. Every week contributes to long-term progression.

---

## Game Mechanics

### Primary Mechanics

**1. Log** *(Effort Integrity)*
The entry point of the entire game. Every card, every battle, every reward traces back here.

- **Pre-session (~10s):** Player speaks or types their intent for the session (e.g., "I'm going to write 1,000 words of my report"). AI classifies the description into one of 4 work type tags: Deep Focus, Physical, Learning, or Recovery. Timer starts.
- **Minimum session duration: 30 minutes** — sessions under 30 minutes do not qualify for a card. This is the primary integrity mechanism.
- **Post-session:** Timer ends. Player gives a short text or voice reflection on how the session went (~10s–1min). AI evaluates plausibility:
  - **Plausible reflection** → card earned, draw sequence triggers
  - **Implausible/empty reflection** → no card, no reward + optional Revenge Task assigned
- **MVP input:** Text or voice reflection (replaces Yes/No button)
- **Post-MVP:** Reflection quality influences card rarity — richer reflections yield higher rarity cards

**2. Draw** *(Short-Hit Satisfaction)*
The dopamine hit. The moment the week's effort becomes something tangible.

- Triggers immediately after a completed session (Yes answer)
- ~1 minute animated reveal — Clash Royale chest-open energy
- Card type and rarity determined by: work type tag + session duration
- Player watches the card materialise — the reveal is the reward, not just the card itself
- Post-draw: card is added to the weekly deck

**3. Deploy / Hand Management** *(Strategic Depth)*
The skill expression layer. Your hand is shaped by effort; how you play it is shaped by thinking.

- Slay the Spire-style: player sees their hand each turn and chooses which cards to play
- Cards have costs, effects, and synergy information in card description text
- Synergy details are written directly in the card's description — no separate keyword hint system. If a card synergises with another, the description says so naturally (e.g., "Deals 8 damage. If you played an [Eat Fruits] card this week, +4 damage.")
- Player builds strategic understanding organically — hints teach, play confirms
- Hand composition varies week-to-week based on real work done

**4. Battle** *(Short-Hit Satisfaction + Strategic Depth)*
The payoff arena. Where effort becomes outcome.

- **Daily mini-battle (~10 mins):** Fires each evening using that day's earned cards. Quick encounter. Win = full rewards. Lose = reduced rewards + optional Revenge Task assigned.
- **Weekly boss battle (~20 mins):** End-of-week climax using the full accumulated deck. Multi-staged — Stage 1 beatable with 1 session's cards. Deeper stages require a disciplined week.
- Both battle types use the same Slay the Spire-style card play system

**5. Declare** *(Progressive Mastery)*
Monday's ritual. The player names their Epic — the theme or goal for the coming week.

- Simple declaration screen on Monday reset
- MVP: motivational framing only — no mechanical effect on card generation
- Post-MVP: Epic theme influences boss type and potential synergy bonuses

**6. Unlock** *(Progressive Mastery)*
The long-term hook that keeps players returning week after week.

- Meta-XP earned every week regardless of boss outcome
- XP accumulates across weeks — levels unlock new card variants, cosmetics, or deeper boss stages
- Even a zero-session week still preserves all prior meta-progression

---

### Mechanic Interactions

| Interaction | Effect |
|---|---|
| Log (Yes) → Draw | Completing a session immediately triggers the card draw reveal |
| Log (No) → Revenge Task | Failing to complete a session awards no card + optionally assigns a Revenge Task |
| Work type tag → Card type | Deep Focus → [Focus] cards; Physical → [Body] cards; Learning → [Mind] cards; Recovery → [Rest] cards |
| Session duration → Card rarity | Longer sessions yield higher rarity cards within the same type |
| Real-world synergy tags → Battle buffs | Cards with complementary real-world tags (e.g., [Body] + [Nutrition]) buff each other in battle |
| Weekly deck composition → Boss stage depth | More cards + better synergies = higher stages reachable |
| Daily battle loss → Revenge Task | Losing assigns an optional small real-world task; completing it restores partial rewards |

### Mechanic Progression

- **Week 1–2:** Players learn Log → Draw → simple battle with basic cards
- **Week 3–4:** Synergy hints begin to make sense as deck variety grows
- **Week 5+:** Players start deliberately shaping their real-world week to build stronger synergy combinations
- **Long-term:** Meta-XP unlocks deepen the card pool, surfacing new synergy possibilities

---

## Controls and Input

### Control Scheme (PC — development; Mobile — target)

All interactions designed mouse-click first, mapping cleanly to tap on mobile.

| Action | PC | Mobile (target) |
|---|---|---|
| Start session timer | Click "Start" button | Tap "Start" |
| Speak/type session intent | Click mic / text field | Tap mic / text field |
| End session + Yes/No | Click timer stop → click Yes or No | Tap stop → tap Yes or No |
| Card draw reveal | Click to open / watch animation | Tap to open / watch animation |
| View hand in battle | Cards displayed at bottom of screen | Cards displayed at bottom of screen |
| Play a card | Click card → click target | Tap card → tap target |
| Navigate menus | Mouse click | Tap |

### Input Feel

- **Log:** Frictionless — must feel faster than opening Instagram. Two taps maximum to start a session.
- **Card draw:** Weighted and ceremonial — the animation earns its 1 minute. This is the hit.
- **Battle:** Snappy and responsive — card plays should feel satisfying, not sluggish. Slay the Spire's card slam feedback is the reference.
- **Everything else:** Invisible — menus and navigation should never be the story.

### Accessibility Controls

- Large tap targets for mobile (minimum 44×44pt)
- Voice input optional — text fallback always available for session description
- Yes/No buttons oversized and colour-coded (green/red) for clarity
- No time pressure on menu navigation — only battles have pace

---

## Card Game Specific Design

### Card Types and Effects

CardWork uses 4 card types, each mapped to a real-world work category. The mapping to design archetypes is a **developer framework only** — no class labels, archetypes, or category groupings are shown to players.

| Card Type | Work Tag | Design Archetype (internal) | Role in Battle |
|---|---|---|---|
| **[Focus]** | Deep Focus sessions | Ranger — precision, control | Utility, debuffs, targeted damage |
| **[Body]** | Physical sessions | Fighter — raw power | Direct damage, aggressive effects |
| **[Mind]** | Learning sessions | Mage — clever effects | Card draw, enemy manipulation |
| **[Rest]** | Recovery sessions | Healer — sustain | Shield, HP restore, defensive effects |

**Card Attributes (per card):**
- **Damage** — direct HP dealt to enemy
- **Shield** — damage absorbed before HP loss
- **Effect** — special ability (draw card, buff next card, weaken enemy, etc.)
- **Selective cost** — some cards carry an effect-based cost rather than a mana cost (e.g., an intensive workout card might impose "no [Body] cards next turn" as a natural consequence). Not every card has a cost — applied only where it makes narrative sense.
- **Synergy keyword** — each card has its own specific synergy with specific other cards (e.g., the gym card synergises with the eat-fruits card). Synergy is per-card, not per-type. Details TBD in card design phase.

**Synergy Design Principles:**
- Synergies are specific to individual cards — not blanket type-pair rules
- Visible as keyword hints on each card (Slay the Spire style)
- Designed to reward balanced real-world weeks without punishing specialisation
- Full synergy map to be defined during card design documentation

---

### Deck Building

CardWork's deck is built by the player's real week — not by manual construction.

- **Weekly deck maximum:** 18 cards (3 starter cards on Monday + up to 15 earned across 5 days at 3 sessions/cards per day)
- **5-day workweek:** Monday–Friday, 3 sessions/cards per day maximum
- **Starter cards:** 3 fixed base cards issued every Monday — same each week for MVP
- **Earning cards:** 1 card per completed session (Yes answer + session logged)
- **Duplicates:** Allowed for MVP — logging 3 [Body] sessions in one day yields 3 [Body] cards
- **Full deck used:** Weekly boss is fought with the entire accumulated deck — no curation
- **Daily battle:** Uses only that day's earned cards

---

### Resource System

**No universal mana/energy cost system.**

The turn itself is the primary resource — one card played per turn. Some cards carry selective effect-based costs (narrative consequences, not a resource bar). This keeps the system learnable while allowing strategic weight on specific powerful cards.

- **Turn resource:** 1 play per turn
- **Hand size:** Draw 3 cards per turn, play 1, discard remaining 2
- **Discard pile:** Cards cycle through deck → hand → discard; deck reshuffles when exhausted
- **Selective costs:** Specific cards impose turn-based consequences (e.g., "skip next [Body] card play") — designed case-by-case, not systematically

---

### Turn Structure

**Both daily mini-battle and weekly boss use identical turn structure:**

```
Turn Start: Draw 3 cards from deck
    ↓
Player Phase: Choose and play 1 card (effect resolves immediately)
    ↓
Discard Phase: Remaining 2 cards go to discard pile
    ↓
Enemy Phase: Enemy acts (intent hidden by default)
    ↓
Next Turn: Repeat until win or lose condition met
```

- **Player always goes first**
- **Enemy intent:** Visible every turn (Slay the Spire style) — enemy displays their next action (attack value, shield, special effect) before the player plays their card. MVP scope.
- **Win condition:** Reduce enemy HP to zero
- **Lose condition:** Player HP reduced to zero
- **Match length targets:** Daily mini-battle ~10 mins; Weekly boss ~20 mins

**Boss Stage Structure:**
- Boss has multiple stages (minimum 3 for MVP)
- Each stage is a separate enemy encounter — boss HP resets between stages
- Stage 1 designed to be beatable with 1 session's worth of cards
- Deeper stages require a fuller, more synergistic deck
- Meta-XP awarded regardless of how many stages cleared

---

### Card Collection and Progression

**MVP: No permanent card collection system.**

Cards are earned within the week and used in that week's battles only. The weekly deck resets on Monday. Meta-progression is handled through XP and level unlocks, not a card collection layer.

- **Weekly reset:** All earned cards cleared on Monday
- **Starter cards:** 3 fixed base cards every Monday (same each week — MVP)
- **No card crafting, trading, or manual collection for MVP**

*Post-MVP: Epic-influenced starter cards, card upgrading via duplicates, rarity tiers, and a permanent collection layer are planned.*

---

### Game Modes

**MVP ships with exactly two battle modes:**

| Mode | Cadence | Deck Used | Duration | Access |
|---|---|---|---|---|
| **Daily Mini-Battle** | Each evening | That day's earned cards only | ~10 mins | Unlocks after first card draw of the day |
| **Weekly Boss Battle** | End of 5-day window | Full accumulated weekly deck | ~20 mins | Locked until end of Friday — cannot trigger early |

No practice mode, no free battle, no early boss trigger. The weekly boss is locked to the end of the work window — the constraint is intentional. You cannot shortcut the week.

---

## Progression and Balance

### Player Progression

CardWork uses two interlocking progression layers — **in-session skill progression** (learning the game) and **meta-progression across weeks** (growing with real habits).

#### Progression Types

| Type | How It Appears | Scope |
|---|---|---|
| **Skill** | Players organically discover synergies, learn hand management, and develop battle strategy | Always active |
| **Power** | Meta-XP levels up across weeks — unlocks new card variants and deeper boss stages | Post-MVP |
| **Content** | New boss stages become accessible as meta-level increases | Post-MVP |
| **Narrative** | Weekly results screen reflects the player's real work week as an emergent story | Always active |

#### Progression Pacing

- **Week 1:** Player learns the core loop — log → draw → battle. Boss Stage 1 is beatable with minimal cards.
- **Week 2–4:** Synergy hints begin to pay off. Players start understanding how their real-world habits shape their deck.
- **Week 5+:** Strategic intentionality develops — players begin shaping their real week to build better decks.
- **Long-term (Post-MVP):** Meta-XP accumulation drives level unlocks and escalating boss difficulty.

*Meta-XP system and level unlocks are explicitly post-MVP. The core loop must be validated first.*

---

### Difficulty Curve

**Pattern: Player-controlled + Scaling boss**

CardWork's difficulty is uniquely tied to real-world effort. The player's deck strength is determined by how much they actually worked — meaning difficulty is partially self-directed. The boss scales to meta-progression post-MVP, ensuring the game remains challenging as habits improve.

#### Challenge Scaling

| Stage | Difficulty Driver |
|---|---|
| **MVP — Weekly boss** | Fixed difficulty. Stage 1 beatable with 1 session; Stage 3 requires a full strong week. |
| **Post-MVP — Boss scaling** | Boss difficulty scales to player's meta-level — grows harder as long-term habits improve. |

**Difficulty spikes:** Weekly boss is the primary spike. Each stage is a discrete difficulty jump — Stage 1 is accessible, Stage 2 requires more cards, Stage 3 requires synergies.

#### Difficulty Options

- No difficulty selection screen for MVP
- "Easy mode" is naturally available — log 1 session, fight Stage 1, earn meta-XP
- "Hard mode" is naturally available — build a full 18-card synergy deck, push for Stage 3+
- Accessibility is built into the staged boss design, not a settings toggle

---

### Economy and Resources

*No in-game economy for MVP.*

CardWork ships without a currency, shop, or resource spend mechanic. Progression is purely effort-based. This keeps the MVP focused on validating the core loop without economy design complexity.

*Post-MVP: A Slay the Spire-style shop system is planned — earn in-game currency from battles, spend between encounters on card upgrades, consumables, or cosmetics. Marked as high priority post-MVP.*

---

## Level Design Framework

### Structure Type

**Arena/Match** — self-contained encounter spaces. CardWork has no spatial world, no hub, no exploration. The "level" is the battle arena. All battles — daily mini-battles and weekly boss stages — take place in the same single arena for MVP.

Content structure is **time-gated by the real week**, not spatial progression. Players don't unlock new areas — they unlock deeper boss stages by building a stronger deck through real-world effort.

---

### Encounter Types

| Encounter | Cadence | Description |
|---|---|---|
| **Daily Mini-Battle** | Each evening (Mon–Fri) | Quick encounter using that day's earned cards. Single enemy, fixed arena. ~10 mins. |
| **Weekly Boss — Stage 1** | End of 5-day window | First boss stage. Beatable with 1 session's cards. Same arena, harder enemy. |
| **Weekly Boss — Stage 2** | Continuous from Stage 1 | Harder iteration. Requires more cards and basic synergy awareness. |
| **Weekly Boss — Stage 3+** | Continuous from Stage 2 | Requires a full disciplined week and synergy play. |

**MVP visual design:** One arena. Boss stages are distinguished by enemy difficulty and HP — no visual changes between stages for MVP.

---

### Tutorial Integration

**No tutorial for MVP.**

The game teaches through play. The staged boss design acts as a natural difficulty ramp — Stage 1 is intentionally survivable with minimal cards, giving new players a win that demonstrates the loop. Card synergy hints are visible on cards (Slay the Spire style) and discoverable through play.

*Post-MVP: A dedicated tutorial system is planned and marked as high priority.*

---

### Level Progression

**Progression model: Time-gated + effort-gated**

Players don't select or unlock levels. Encounter access is controlled by:
- **Time:** Daily mini-battle unlocks after first card draw of the day. Weekly boss unlocks at end of the 5-day window only.
- **Effort:** Boss stage depth reached is determined by deck size and synergy — a direct function of real-world sessions logged.

**No world map or selection screen for MVP** — the home screen surfaces the current available action (log session, fight daily battle, or fight weekly boss) based on state.

**Replayability:** Weekly reset means every week is a fresh run. The player never replays the same encounter — the deck is always different because the week is always different.

*Post-MVP: Choice of battles (including mini-bosses) and increased daily battle frequency are planned to expand the encounter layer.*

---

### Level Design Principles

The core guiding principle implicit in the design: **the real week is the level.** Every design decision about encounter structure serves the goal of making the player's actual work week feel reflected and meaningful in the battle space.

*Additional level design principles will be established during production.*

---

## Art and Audio Direction

### Art Style

**Duolingo-inspired clean UI** — friendly, motivational, and immediately readable. White/light backgrounds, bold accent colours, rounded corners, generous whitespace. The visual language says *"you can do this"* rather than *"this is a grim dungeon."* The game should feel like a reward to look at, not a chore.

This is a deliberate departure from the dark dungeon aesthetic of Slay the Spire. CardWork's visual identity is aligned with its audience — productivity-minded people who respond to clean, modern mobile UI — not hardcore card game players.

#### Visual References

| Reference | What We Take |
|---|---|
| **Duolingo** | Clean white UI, bold accent colours, rounded elements, satisfying micro-animations, motivational visual language |
| **Slay the Spire** | Card information layout, battle screen composition (cards bottom, enemy top), stat density on cards |
| **Clash Royale** | Battle feedback energy — hit animations, stage clear moments, punchy visual feedback |

#### Card Design Language

**Typographic** — all game information lives on the card face. No character illustrations. Clean, readable stat layout prioritising clarity over decoration.

Each card displays:
- Card name (work-session derived)
- Card type tag ([Focus] / [Body] / [Mind] / [Rest])
- Damage / Shield / Effect values
- Selective cost notation (if applicable)
- Card description text — synergy information included here if the card has a synergy (no separate keyword hint system)

Card aesthetic: bold typography, colour-coded by type, Duolingo-style rounded card border. The card should feel like a beautiful to-do item that also hits for 12 damage.

#### Color Palette

- **Background:** Clean white / off-white
- **Accent:** Bold single colour per card type (TBD — e.g., deep blue for [Focus], warm red for [Body], rich purple for [Mind], soft green for [Rest])
- **UI chrome:** Light grey, rounded, minimal
- **Feedback:** Bright, punchy hit colours — satisfying without being aggressive
- **Overall tone:** Warm, energetic, motivational — never dark or punishing

#### Camera and Perspective

**2D flat, Slay the Spire layout:**
- Enemy displayed at top-centre of screen
- Player hand displayed at bottom of screen (3 cards drawn per turn)
- HP bars clean and readable (Duolingo progress bar aesthetic)
- Card play area: centre screen
- Minimal UI chrome — only what the player needs to see

**Mobile-first layout:** All critical UI elements within thumb reach zones. Card area occupies the lower 40% of screen.

---

### Audio and Music

**Deferred to post-MVP.**

Audio production begins after core loop validation. The team has in-house music and sound capability — production starts once the gameplay loop is confirmed to work.

**Direction for when production begins:**
- **UI sounds:** Punchy, satisfying micro-sounds for card draw, card play, battle hit, stage clear — the audio equivalent of Duolingo's correct-answer chime
- **Music mood:** Productive, focused, motivational — not aggressive. Something that could play while you work without being distracting
- **Battle escalation:** Music should feel more intense during the weekly boss vs. daily mini-battle
- **No voice/dialogue:** Not planned

---

### Aesthetic Goals

| Pillar | How Art Supports It |
|---|---|
| **Effort Integrity** | Clean, honest UI — no visual fluff that obscures what you've earned |
| **Short-Hit Satisfaction** | Micro-animations on card draw, hit feedback, stage clear — every interaction feels good |
| **Progressive Mastery** | Card description depth scales with player understanding — complexity reveals itself naturally |
| **Strategic Depth** | Typographic cards ensure all information is readable at a glance — no hidden stats |

---

## Technical Specifications

### Performance Requirements

#### Frame Rate Target
- **PC (development):** 60fps target
- **Mobile (target):** 60fps where possible; 30fps minimum acceptable. Battery and thermal management prioritised over visual fidelity.

#### Resolution Support
- **PC:** Standard desktop resolutions (1080p minimum)
- **Mobile:** Adaptive layout — designed for common iOS and Android screen sizes. Portrait orientation primary.

#### Load Times
- Cold-start app open: **under 3 seconds** — the app must open faster than Instagram. Every second of load time is a moment the player might open something else instead.
- Session log screen: **instant** — zero friction between "I want to log" and "I'm logging"

---

### Platform-Specific Details

#### PC (Development — MVP)
- **Distribution:** Direct download (no Steam/Epic for MVP)
- **Input:** Mouse-click only — no keyboard shortcuts required for MVP
- **Cloud saves:** Not required for MVP — local save only
- **Specs:** No minimum spec requirements for MVP — development machine target

#### Mobile (Target Platform)
- **OS:** iOS and Android — specific minimum versions TBD during architecture phase
- **Orientation:** Portrait primary — all UI designed portrait-first
- **Offline play:** Required — no server dependency for MVP. Core loop (log, draw, battle) must function fully offline
- **IAP:** Not implemented for MVP — monetisation post-validation
- **Push notifications:** Required for MVP — daily battle reminder, weekly boss reminder, session streak nudges

---

### Session Integrity Specifications

**Minimum session duration: 30 minutes**

A session under 30 minutes does not qualify for a card draw. This is the primary integrity mechanism — raising the cost of cheating to 30 minutes minimum per card.

**Session flow:**

```
Pre-session: Speak/type intent (~10s) → AI classifies work type → timer starts
    ↓
[30 minute minimum active]
    ↓
Post-session: Short text/voice reflection on how the session went (~10s–1min)
    → AI evaluates reflection plausibility
    → Plausible: card awarded, draw sequence triggers
    → Implausible/empty: no card + optional Revenge Task assigned
```

- **MVP input:** Text or voice reflection
- **AI role:** Lightweight classification (work type tag) + basic plausibility check on reflection
- **Offline fallback:** Manual work type tag selection from 4-option list; reflection stored locally for sync when online

**Post-MVP:** Reflection quality influences card rarity — richer, more specific reflections yield higher rarity cards.

---

### AI Classification Requirements

- **Call type:** Single lightweight classification call per session end
- **Input:** Session intent description (pre) + reflection text (post)
- **Output:** Work type tag (Deep Focus / Physical / Learning / Recovery) + plausibility signal
- **Latency target:** Under 2 seconds response
- **Cost target:** Minimal — single classification call, no generative output
- **Offline fallback:** Manual tag selection from 4-option list if API unavailable
- **API:** TBD during architecture phase (options: OpenAI, Gemini, on-device classifier)

---

### Asset Requirements

#### Art Assets (MVP)
- **Placeholder strategy:** Emoji and simple shapes acceptable for MVP — shipping the loop is the priority, not the art
- **Card assets:** Text-based (typographic) — minimal art required per card for MVP
- **Arena:** Single static background — one asset
- **Enemy:** Minimal placeholder representation
- **UI elements:** Clean, rounded, Duolingo-inspired — simple shapes and typography
- **Animations:** Minimal for MVP — card draw reveal animation is highest priority (it's the dopamine hit)

#### Audio Assets (MVP)
- **None for MVP** — audio production deferred entirely

#### External Assets
- Asset store / free resources acceptable for placeholder content during MVP development
- AI tools acceptable for placeholder art generation during development

---

### Technical Constraints

- **Offline-first:** Core loop must function without internet. AI call is enhancement, not dependency.
- **No multiplayer or server-side features for MVP**
- **No cloud saves for MVP** — local storage only
- **Mobile-first design decisions** on all UI from day one — even during PC development phase
- **Session timer reliability:** Background timer accuracy on mobile is a known technical challenge — must be addressed during architecture phase
- **Data privacy:** Session descriptions and reflections are personal data — storage and handling must be considered during architecture phase

*Engine selection, specific frameworks, system architecture, and database design are addressed in the Architecture workflow following GDD completion.*

---

## Development Epics

### Epic Overview

| # | Epic Name | Scope | Dependencies | Est. Stories |
|---|---|---|---|---|
| 1 | Foundation & Core Loop | Session logging, timer, AI classification, reflection input, card draw reveal | None | 6–8 |
| 2 | Card System | Card types, attributes, description/synergy text, 18-card deck, starter cards | Epic 1 | 5–7 |
| 3 | Battle System | Turn structure, hand management, daily mini-battle, enemy AI, win/lose | Epic 2 | 6–8 |
| 4 | Weekly Structure | Weekly reset, Epic declaration, boss stages, results screen, Revenge Task | Epic 3 | 6–8 |
| 5 | UI & Game Feel | Duolingo aesthetic, card draw animation, battle feedback, push notifications | Epic 3 | 5–7 |
| 6 | Integrity & Polish | 30-min gate, AI plausibility check, offline-first, local persistence | Epic 4 + 5 | 4–6 |

### Recommended Sequence

1. **Epic 1 — Foundation & Core Loop** — nothing else exists without this. Session → card is the heartbeat of the game.
2. **Epic 2 — Card System** — cards need to exist before battles can be fought.
3. **Epic 3 — Battle System** — first playable vertical slice. Core loop proven here.
4. **Epic 4 — Weekly Structure** — full weekly cadence, boss battle, results screen. Game is feature-complete after this.
5. **Epic 5 — UI & Game Feel** — polish the experience. Card draw animation is highest priority.
6. **Epic 6 — Integrity & Polish** — harden the system, enforce session gate, close offline gaps.

### Vertical Slice

**First playable milestone (end of Epic 3):** A player can speak their session intent, run a 30-minute timer, give a reflection, receive a card, and fight a daily mini-battle with it. The core loop — log → draw → battle — is playable end-to-end with placeholder assets.

---

## Success Metrics

### Technical Metrics

#### Key Technical KPIs

| Metric | Target | Measurement Method |
|---|---|---|
| Cold-start load time | < 3 seconds | Timed on target devices |
| Session log screen load | Instant (< 0.5s) | Timed on target devices |
| Frame rate (PC) | 60fps consistent | In-engine performance monitor |
| Frame rate (Mobile target) | 60fps / 30fps minimum | Device testing |
| Crash rate (beta) | < 1% of sessions | Crash reporting tool |
| Session timer accuracy | ± 5 seconds in background | Background timer stress test |
| AI classification latency | < 2 seconds | API response time logging |
| Offline fallback activation | 100% success when AI unavailable | Manual testing — airplane mode |
| Local data loss on crash | 0 critical data loss events | Crash + recovery testing |

---

### Gameplay Metrics

#### Key Gameplay KPIs

| Metric | Target | Measurement Method | Pillar |
|---|---|---|---|
| Sessions logged in week 1 | ≥ 3 sessions per player | Session log count | Effort Integrity |
| Session completion rate | ≥ 70% of started sessions reach 30 min | Timer completion tracking | Effort Integrity |
| Daily battle engagement | ≥ 80% of card-earned days result in a battle | Battle trigger rate | Short-Hit Satisfaction |
| Weekly boss attempt rate | ≥ 70% of players with ≥ 1 session attempt the boss | Boss entry rate | Short-Hit Satisfaction |
| Week 2 retention | ≥ 40% of beta players return for a second Epic | Weekly active tracking | Progressive Mastery |
| Card draw feel rating | Positive qualitative signal from beta | Beta feedback / interview | Short-Hit Satisfaction |

#### Churn Signals to Watch

| Warning Signal | What It Indicates |
|---|---|
| Session completion rate < 50% | 30-minute gate feels too punishing — consider UX around the timer |
| Daily battle skip rate > 40% | Battle is not compelling enough — loop is broken after card draw |
| Boss attempt rate < 50% | Weekly structure not landing — players don't feel invested in the climax |
| < 2 sessions in week 1 | Onboarding failure — player never established the habit |

---

### Qualitative Success Criteria

1. **The addiction transfer signal** — Beta players spontaneously report they opened CardWork *instead of* Instagram or another passive app. This is the primary qualitative validation.
2. **Deck as self-reflection** — Players describe their weekly deck as a reflection of how their week went, without being prompted. The identity mechanic is working.
3. **Card draw as reward** — Players describe the card draw reveal as satisfying and worth waiting for. The 1-minute animation earns its time.
4. **Revenge Task re-engagement** — Players who receive a Revenge Task report it felt motivating rather than punishing.
5. **No zero-week shame** — Players who miss sessions do not feel judged by the game. Monday reset feels like a fresh start, not a failure state.

---

### Metric Review Cadence

| Phase | Cadence | Focus |
|---|---|---|
| **Closed beta (week 1–2)** | Daily | Crash rate, session completion, card draw feel |
| **Closed beta (week 3–4)** | Weekly | Retention, boss attempt rate, qualitative feedback |
| **Post-beta** | Weekly | All KPIs + churn signals |
| **Post-launch** | Monthly | Retention trends, session patterns, economy readiness (post-MVP) |

---

## Out of Scope

The following features are explicitly excluded from CardWork MVP. All items are documented in `post-mvp-features.md`.

### MVP Feature Exclusions

| Feature | Rationale |
|---|---|
| Audio (music + SFX) | Deferred post-loop validation — in-house capability exists |
| Tutorial system | Game teaches through play; natural difficulty ramp handles onboarding — **High Priority post-MVP** |
| Card rarity tiers | Simplicity first — validate loop before adding collection depth |
| Card upgrading | Post-MVP — duplicate handling sufficient for MVP |
| Epic-influenced starter cards | Post-MVP — Monday declaration is motivational only in MVP |
| Meta-XP level progression | Post-MVP — **High Priority**; boss scaling to meta-level follows |
| Boss scaling to meta-level | Depends on Meta-XP system |
| In-game economy / shop | Post-MVP — **High Priority**; Slay the Spire style shop planned |
| Ascendance / prestige system | Post-MVP — Cookie Clicker-inspired long-term hook |
| Epic-themed bosses | Post-MVP — world skin and lore layer |
| Battle variety (mini-bosses, choice) | Post-MVP — expanded encounter layer |
| More than 1 daily battle slot | Post-MVP — scales with session frequency |
| Pattern detection / integrity system | Post-MVP — 30-min gate handles MVP integrity |
| Multiplayer / social layer | Post-MVP — guild Epics, shared boss raids |
| Reflection quality → card rarity | Post-MVP — richer classification layer |
| Enhanced enemy intent ([Mind] cards) | Post-MVP — base intent display is MVP |
| World skin / lore | Post-MVP — abstract/minimal for MVP |

### Platform Exclusions

| Platform | Status |
|---|---|
| App Store (iOS) | Post-beta — mobile release follows closed beta validation |
| Google Play (Android) | Post-beta |
| Steam / Epic Games Store | Not planned |
| Console (Switch/PS/Xbox) | Not planned |
| VR | Not planned |
| Web browser | Not planned |

### Deferred to Post-Launch

- Cloud saves
- Analytics / telemetry
- Push notification personalisation
- In-app purchases / monetisation
- Localisation (additional languages)

---

## Assumptions and Dependencies

### Key Assumptions

| Assumption | Category | Risk if Wrong |
|---|---|---|
| Core loop creates genuine motivation to work | Design | Critical — MVP exists to validate this |
| 30-minute session minimum is acceptable to target users | Design | High — if too punishing, completion rate drops |
| AI classification API is cost-effective at scale | Technical | Medium — single lightweight call per session |
| Offline-first architecture is achievable for MVP | Technical | High — core loop cannot require internet |
| Target audience will be honest about session completion | Design | Medium — self-correcting mechanically; 30-min gate is primary deterrent |
| Small team can build MVP without art/audio contractors | Team | Medium — placeholder assets reduce dependency |
| Engine selection (TBD in architecture phase) supports mobile-first | Technical | Medium — decided post-GDD |

### External Dependencies

| Dependency | Type | Notes |
|---|---|---|
| AI classification API | Service | Provider TBD in architecture phase (OpenAI, Gemini, on-device options) |
| Mobile push notification service | Service | Required for MVP daily/weekly reminders |
| Asset store / AI art tools | Content | Placeholder art sourcing during development |
| iOS / Android development accounts | Platform | Required before mobile distribution |
| Game engine / framework | Technical | Selected during architecture phase |

### Risk Factors

1. **The core loop doesn't feel motivating** — highest risk, highest impact. MVP closed beta exists precisely to validate this. Mitigation: tight card draw feedback, satisfying animations, immediate mini-battle after logging.
2. **Session gate feels punishing** — 30 minutes may feel too long for some users. Mitigation: UX around the timer (progress indicator, session description display during timer) makes the wait feel productive.
3. **AI API reliability / cost** — if the API is slow, expensive, or unavailable frequently, the offline fallback must be seamless. Mitigation: offline-first architecture, manual tag fallback.
4. **Mobile timer accuracy** — background timer reliability on iOS/Android is a known technical challenge. Mitigation: addressed in architecture phase as a first-class concern.

---

## Document Information

**Document:** CardWork — Game Design Document
**Version:** 1.0
**Created:** 2026-03-17
**Author:** Jack.ark
**Status:** Complete

### Change Log

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-03-17 | Initial GDD complete — all 14 steps |
