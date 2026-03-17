---
type: 'post-mvp-brainstorming'
project: 'CardWork'
date: '2026-03-17'
author: 'Jack.ark'
---

# CardWork — Post-MVP Features Brainstorming

This file captures ideas and systems explicitly marked as post-MVP during GDD development. These are not in scope for the initial release but should be revisited after core loop validation.

---

## Ascendance / Prestige System

**Origin:** Flagged during Core Gameplay step (Step 5) of GDD workflow.

**Concept:** Inspired by Cookie Clicker's prestige mechanic — after reaching a certain stage or milestone, the player can "ascend," resetting progress in exchange for a permanent multiplier, unlock, or cosmetic that carries forward into all future weeks.

**Why it fits CardWork:**
- Rewards long-term disciplined players beyond the weekly loop
- Creates a meta-goal that sits above the weekly Epic structure
- Gives hardcore players a reason to keep going after mastering the base loop
- The "sacrifice your progress for a permanent bonus" philosophy mirrors real-world discipline: sometimes you reset to grow stronger

**Design Questions to Explore:**
- What is the ascendance trigger? (stage reached, total weeks completed, lifetime XP threshold?)
- What carries forward? (cosmetic title, stat multiplier, unique card unlock, boss variant?)
- Does ascendance affect the weekly loop visually — e.g., a prestige aura on your deck?
- How many ascendance tiers? (Cookie Clicker has many — CardWork should probably cap at 3-5 for clarity)
- Does the Epic declaration screen change post-ascendance?

**Reference:** Cookie Clicker prestige system — reset heavenly chips for permanent CPS multiplier.

---

## Epic-Themed Bosses

**Origin:** Flagged in Game Brief.

**Concept:** Post-MVP, the player's declared Epic (goal for the week) influences the boss encounter. Gym week spawns physical challenge bosses. Coding week spawns logic/puzzle bosses. Social week spawns social/negotiation bosses.

**Design Questions:**
- How are Epic categories defined and bounded?
- Does the boss theme affect card synergies, or just aesthetics?

---

## World Skin / Lore Layer

**Origin:** Flagged in Game Brief.

**Concept:** Conceptual enemies and bosses themed to the player's real-world goals. The world grows from the player's actual Epic declarations over time.

---

## Pattern Detection / Trust System

**Origin:** Flagged in Game Brief.

**Concept:** Post-MVP, detect patterns of session abuse (fake short sessions, repeated same-second logs). Self-correcting at MVP level (fake decks = weak play), but a lightweight integrity layer post-launch.

---

## Battle Variety & Daily Frequency Scaling

**Origin:** Flagged during Level Design step (Step 9) of GDD workflow.

**Concept:** Post-MVP, expand the battle layer with more variety and frequency options.

**Ideas:**
- **Choice of battles:** Player selects from a pool of daily encounters (e.g., choose 1 of 3 available battles — different enemies, different reward profiles). Adds strategic decision-making to the daily loop.
- **Mini-bosses:** Occasional harder encounters between the daily mini-battle and the weekly boss. Could appear mid-week (e.g., Wednesday) as a bonus challenge for players who've logged multiple sessions.
- **More battles per day:** Allow players who log more sessions to unlock additional daily battle slots. Rewards heavy work days without breaking the weekly boss balance.
- **Battle pool variety:** Different enemy types with different attack patterns, requiring different card strategies. One arena visually, but mechanically diverse encounters.

**Design Questions:**
- Does battle choice affect deck composition strategy? (e.g., choose a battle that favours your current deck)
- Do mini-bosses drop better rewards than standard daily battles?
- Is the additional daily battle slot locked behind session count or meta-level?

---

## Reflection Quality → Card Rarity

**Origin:** Flagged during Technical Specifications step (Step 11) of GDD workflow.

**Concept:** Post-MVP, the quality and specificity of the post-session reflection influences card rarity. A rich, detailed reflection ("I finished the report outline but got stuck on section 3, spent 20 mins on research") yields a higher rarity card than a vague one ("it was fine"). Rewards honest self-reflection with better game outcomes.

**Design Questions:**
- What signals indicate reflection quality? (word count, specificity, emotional content?)
- How many rarity tiers does this map to?
- Does the player see any indication that their reflection affected the card they received?
- Is there a minimum reflection length/quality to receive any card at all?

---

## ⭐ HIGH PRIORITY: Tutorial System

**Origin:** Flagged during Level Design step (Step 9) of GDD workflow.
**Priority:** HIGH — implement immediately post-MVP validation.

**Concept:** New player onboarding for CardWork. MVP ships with no tutorial — the game teaches through play and the staged boss design acts as a natural difficulty ramp. Post-MVP, a dedicated tutorial layer is needed for broader audience accessibility.

**Options to Explore:**
- **Silent tutorial:** First battle designed to be impossible to lose — starter cards very strong, enemy very weak. Learn by doing, no text.
- **Tooltip tutorial:** First-time UI hints appear on cards and buttons contextually.
- **Dedicated tutorial battle:** Separate practice fight before week 1 begins — outside the real loop.
- **Hybrid:** Silent tutorial for battle mechanics + contextual tooltips for card keywords/synergies.

**Design Principles:**
- Must feel like the real game, not a hand-holding experience
- Should introduce the log → draw → battle loop in sequence
- Synergy system introduction should be gradual — don't front-load complexity

---

## ⭐ HIGH PRIORITY: Meta-XP & Level Progression System

**Origin:** Flagged during Progression & Balance step (Step 8) of GDD workflow.
**Priority:** HIGH — implement immediately post-MVP validation.

**Concept:** Meta-XP accumulates across weeks regardless of boss outcome. Levelling up unlocks new card variants, deeper boss stages, and cosmetic rewards. The meta-level also drives boss difficulty scaling — a higher-level player faces a harder weekly boss, ensuring the game remains challenging as the player's habits improve.

**Core Design:**
- XP earned every week (amount TBD — based on sessions logged + stages cleared)
- Level-up unlocks: new card types in starter pack, new boss stages, cosmetics
- Boss difficulty scales to meta-level — the game grows with the player
- Designed to reward long-term habit building, not just short-term play

**Design Questions:**
- What is the XP curve? (linear, exponential, diminishing returns?)
- How many meta-levels for the first release of this system?
- What specifically unlocks at each level?
- Does the player see their meta-level prominently, or is it background progression?

---

## ⭐ HIGH PRIORITY: In-Game Economy / Shop System

**Origin:** Flagged during Progression & Balance step (Step 8) of GDD workflow.
**Priority:** HIGH — natural next layer after core loop validation.

**Concept:** Slay the Spire-style shop — earn in-game currency from battles and spend it between encounters. Adds a meaningful spend decision layer that rewards consistent play without pay-to-win mechanics.

**Design Questions:**
- What is the currency? (coins, "focus points", something CardWork-flavoured?)
- When does the shop appear? (between daily battles? before the weekly boss?)
- What does the shop sell? (card upgrades, potions/consumables, cosmetics, extra card draws?)
- Is currency weekly-reset or persistent across weeks?
- F2P considerations — is there a premium currency layer?

**Origin:** Implied by Clash Royale reference in brief.

**Concept:** Guild-style group Epics, shared boss raids powered by collective weekly work, leaderboards of real-world effort. Explicitly post-MVP.

---

## Card Rarity Tiers

**Origin:** Flagged during Game Type Specifics step (Step 7) of GDD workflow.

**Concept:** 4 rarity tiers × 4 card types = 16 base card variants. Rarity tiers to be defined post-MVP once core loop is validated. Higher rarity cards would be earned from longer/more consistent sessions.

**Design Questions:**
- What are the tier names? (Common/Rare/Epic/Legendary or CardWork-flavoured alternatives?)
- Does rarity affect base stats, special abilities, or both?
- How does rarity interact with the synergy system?

---

## Card Upgrading

**Origin:** Flagged during Game Type Specifics step (Step 7) of GDD workflow.

**Concept:** Duplicate cards in a weekly deck could be merged/upgraded into a stronger version rather than sitting as raw duplicates. Rewards consistency in real-world habits.

**Design Questions:**
- How many duplicates required to upgrade? (2? 3?)
- Does upgrading happen automatically or is it a player choice?
- Does the upgraded card carry a visual indicator?

---

## Epic-Influenced Starter Cards

**Origin:** Flagged during Game Type Specifics step (Step 7) of GDD workflow.

**Concept:** The 3 Monday starter cards are influenced by the player's declared Epic for the week. A fitness Epic starts you with [Body]-leaning cards; a deep work Epic starts with [Focus] cards. Adds mechanical weight to the Monday declaration ritual.

**Design Questions:**
- Is the influence deterministic (Epic = fixed starter set) or probabilistic (Epic = weighted draw)?
- Does this interact with the synergy system?
- How many Epic categories exist and how are they defined by the player?

---

## Enemy Telegraphing — Enhanced System (Post-MVP)

**Origin:** Base enemy intent is MVP (Slay the Spire style — visible every turn). This post-MVP feature extends that system.

**Concept:** Post-MVP, [Mind] card investment enhances the base telegraphing system — e.g., revealing additional detail about enemy intent (exact damage values, hidden modifiers, secondary effects). The base intent display is always visible; [Mind] cards unlock deeper intelligence.

**Design Questions:**
- What additional intent detail do [Mind] cards reveal?
- Is this a permanent meta-unlock or a per-battle effect?
- Does it apply to daily mini-battles, weekly boss, or both?

