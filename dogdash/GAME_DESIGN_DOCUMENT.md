# Dog Dash - Game Design Document
## (Based on Geometry Dash Lite Study)

---

## 1. GAME OVERVIEW

**Original Game:** Geometry Dash Lite - a rhythm-based auto-scrolling platformer where the player controls a geometric shape hurtling through obstacle courses. One-touch gameplay synced to electronic music.

**Our Game:** Dog Dash - same core mechanics but the main character is a dog instead of a geometric cube. The dog runs, jumps, flies, and dashes through obstacle-filled levels.

---

## 2. CORE GAMEPLAY MECHANICS

### 2.1 Auto-Scrolling
- The character moves forward automatically at a constant horizontal speed
- The player has NO control over horizontal movement or stopping
- The only input is a single action button (tap/click/spacebar)
- The camera follows the character horizontally

### 2.2 One-Touch Controls
| Platform | Action |
|----------|--------|
| Desktop  | Spacebar, Up Arrow, or Left Click |
| Mobile   | Tap anywhere on screen |
| Gamepad  | Any face button |

- **Tap** = jump (in cube/robot mode) or mode-specific action
- **Hold** = sustained action (ship flies up, wave angles up, robot jumps higher)
- **Release** = stop action (ship/wave descend)

### 2.3 Death & Restart
- **Any collision with an obstacle = instant death**
- No health bars, no lives system, no damage
- Death triggers an explosion/poof animation
- Level restarts from the very beginning (Normal Mode)
- Progress bar at top shows % completion of the level

---

## 3. CHARACTER FORMS (GAME MODES)

The character transforms when passing through **gamemode portals**. Each form has unique physics:

### 3.1 Cube (Default - "Running Dog")
- The primary/default form
- **Tap** = jump with fixed height
- Follows standard platformer gravity
- Can land on platforms, blocks, and the ground
- The most common form in early levels

### 3.2 Ship ("Flying Dog")
- **Hold** = fly upward
- **Release** = descend/glide down
- Continuous vertical movement (not discrete jumps)
- Must navigate through narrow corridors
- Trail effect follows behind the character

### 3.3 Ball ("Rolling Dog")
- **Tap** = flip gravity (toggle between floor and ceiling)
- Rolls along surfaces
- Each tap switches which surface you're attached to
- Maintains horizontal velocity during gravity flip

### 3.4 UFO ("Hovering Dog")
- **Tap** = small upward boost (like Flappy Bird)
- Can tap multiple times rapidly
- Affected by gravity between taps
- Floats/hovers with each tap

### 3.5 Wave ("Dashing Dog")
- **Hold** = move diagonally upward at 45 degrees
- **Release** = move diagonally downward at 45 degrees
- Constant diagonal movement (never horizontal)
- Very precise - touching ceiling or floor = death
- One of the hardest forms to master

### 3.6 Robot ("Bouncing Dog")
- **Tap** = short hop
- **Hold** = higher jump (variable jump height based on hold duration)
- Similar to cube but with variable jump height
- Short taps = small hops, long holds = big jumps

### 3.7 Spider ("Teleporting Dog")
- **Tap** = instantly teleport to the opposite surface
- No jump arc - instant gravity flip/teleportation
- Switches between floor and ceiling instantly
- The most disorienting form

---

## 4. INTERACTIVE ELEMENTS

### 4.1 Obstacles (Instant Death on Contact)
| Obstacle | Description |
|----------|-------------|
| **Spikes** | Triangle-shaped hazards on ground, ceiling, or walls |
| **Sawblades** | Circular spinning hazards, can be stationary or moving |
| **Spike Walls** | Vertical columns of spikes |
| **Moving Spikes** | Spikes that move along a path |
| **Fake Blocks** | Blocks that look solid but you pass through (trick obstacles) |

### 4.2 Platforms & Blocks
| Element | Description |
|---------|-------------|
| **Solid Blocks** | Standard platforms to land on and jump from |
| **Half Blocks** | Smaller platforms, require more precision |
| **Moving Platforms** | Blocks that move vertically or horizontally |
| **Disappearing Blocks** | Blocks that vanish after a timer |

### 4.3 Jump Pads (Automatic Launch)
Touching a pad automatically launches the player - no tap required:

| Pad Color | Effect |
|-----------|--------|
| **Yellow Pad** | Launches upward (normal jump boost) |
| **Pink Pad** | Launches upward (higher than yellow) |
| **Red Pad** | Launches upward (highest boost) |
| **Blue Pad** | Flips gravity (launches to ceiling) |

### 4.4 Jump Orbs (Tap to Activate)
Player must tap while touching an orb mid-air:

| Orb Color | Effect |
|-----------|--------|
| **Yellow Orb** | Standard jump boost in mid-air |
| **Pink Orb** | Slightly higher jump boost |
| **Red Orb** | Highest jump boost |
| **Blue Orb** | Flips gravity |
| **Green Orb** | Jump + gravity flip |
| **Black Orb** | Propels downward |
| **Spider Orb** | Instant teleport to opposite surface |

### 4.5 Portals
Portals transform gameplay when the player passes through them:

#### Gamemode Portals (Change Character Form)
- Cube Portal, Ship Portal, Ball Portal, UFO Portal
- Wave Portal, Robot Portal, Spider Portal
- Transformation is instant on contact

#### Manipulation Portals
| Portal | Effect |
|--------|--------|
| **Gravity Portal (Yellow)** | Flips gravity upside down |
| **Gravity Portal (Blue)** | Returns gravity to normal |
| **Speed Portal (Yellow)** | Slow speed (0.5x) |
| **Speed Portal (Orange)** | Normal speed (1x) |
| **Speed Portal (Green)** | Fast speed (2x) |
| **Speed Portal (Pink)** | Very fast speed (3x) |
| **Speed Portal (Red)** | Extremely fast speed (4x) |
| **Mini Portal** | Shrinks character - changes physics (faster fall, shorter jumps) |
| **Normal Size Portal** | Returns to normal size |
| **Mirror Portal** | Flips the level horizontally |
| **Dual Portal** | Creates a second character (both controlled simultaneously) |

---

## 5. LEVEL DESIGN

### 5.1 Level Structure
- Each level is a continuous left-to-right obstacle course
- Levels are a fixed length, measured by % progress
- No branching paths - single linear route
- Levels are synced to a music track (obstacles align with beats)
- Difficulty ramps within each level and across levels

### 5.2 Official Levels (Geometry Dash Lite - First 13)

| # | Name | Difficulty | Key Mechanic Introduced |
|---|------|-----------|------------------------|
| 1 | Stereo Madness | Easy | Basic jumping, spikes |
| 2 | Back on Track | Easy | Jump pads, basic ship |
| 3 | Polargeist | Normal | More complex jump patterns |
| 4 | Dry Out | Normal | Gravity portals |
| 5 | Base After Base | Normal | Ship sections |
| 6 | Jumper | Hard | Complex timing |
| 7 | Can't Let Go | Hard | Mixed game modes |
| 8 | Time Machine | Harder | Gravity flips, speed changes |
| 9 | xStep | Insane | Fake blocks, visual tricks |
| 10 | Clutterfunk | Insane | Mini Portal (size change) |
| 11 | Theory of Everything | Insane | UFO mode |
| 12 | Electroman Adventures | Insane | Complex multi-mode |
| 13 | Blast Processing | Harder | Wave mode |

### 5.3 Difficulty Ratings
- Easy
- Normal
- Hard
- Harder
- Insane
- Demon (Easy Demon -> Extreme Demon)

---

## 6. GAME MODES

### 6.1 Normal Mode
- Play from start to finish
- Any death = restart from beginning
- No checkpoints
- Progress % shown at top
- Completion unlocks the next level

### 6.2 Practice Mode
- Checkpoints placed automatically or manually
- Death respawns at last checkpoint
- Used for learning/memorizing level layouts
- Does not count as official completion

---

## 7. VISUAL STYLE

### 7.1 Art Direction
- **Geometric/minimalist** base style with bold colors
- High contrast: dark backgrounds with neon/bright foreground elements
- Color schemes change per level and within levels
- Ground has distinct texture/pattern separating it from background

### 7.2 Visual Layers (Back to Front)
1. **Background** - Gradient colors, slow parallax scrolling
2. **Background Elements** - Decorative shapes, mountains, buildings (medium parallax)
3. **Ground/Platforms** - The main playable surface with texture
4. **Obstacles & Objects** - Spikes, orbs, pads, portals
5. **Player Character** - The dog (always visible, centered or near-center)
6. **Foreground Effects** - Particles, glow, pulse effects
7. **UI Overlay** - Progress bar, attempt counter

### 7.3 Effects & Animations
- **Pulsing** - Background elements pulse to the music beat
- **Particles** - Death explosion, trail behind character, landing dust
- **Screen shake** - On death or major events
- **Color transitions** - Background colors shift using triggers
- **Glow effects** - Neon glow on orbs, portals, and character

### 7.4 Ground Design
- Ground line separates playable area from the bottom
- Ground has a repeating texture/pattern
- Ground color matches the level's color scheme
- Ground can have spikes attached to it

---

## 8. AUDIO & MUSIC

### 8.1 Music Integration
- **Each level has a unique electronic music track**
- Obstacles are placed to align with musical beats
- The game is essentially a rhythm game disguised as a platformer
- Music continues from where you died (or restarts - configurable)

### 8.2 Sound Effects
| Event | Sound |
|-------|-------|
| Jump | Short "boing" or click |
| Death/Crash | Explosion/splat |
| Orb activation | Distinct "ding" or "pop" |
| Pad launch | Whoosh/spring sound |
| Portal enter | Transformation swoosh |
| Level complete | Victory fanfare |

---

## 9. UI & HUD

### 9.1 During Gameplay
- **Progress Bar** - Thin bar at top showing % through level
- **Attempt Counter** - Shows current attempt number
- **No score display** - Focus is purely on completion

### 9.2 Level Select Screen
- Grid/list of available levels
- Each shows: name, difficulty icon, star rating, completion status
- Locked levels shown grayed out
- Normal Mode and Practice Mode buttons per level

### 9.3 Main Menu
- Play button (go to level select)
- Character customization
- Settings (music volume, SFX volume)
- Credits

### 9.4 Death Screen
- Brief death animation (no pause/menu)
- Instant restart (near-zero downtime)
- The fast restart loop is critical to the addictive feel

---

## 10. CHARACTER CUSTOMIZATION

### 10.1 Original Game
- Unlockable icon shapes for each game mode
- Two-color customization (primary + secondary)
- Trail effects
- Death effects

### 10.2 Dog Dash Adaptation
- Different dog breeds as unlockable skins
- Color/pattern customization for the dog
- Accessories (hats, collars, bandanas)
- Trail effects (paw prints, sparkles, bones)
- Death effects (poof of fur, cartoon stars)

---

## 11. PHYSICS PARAMETERS (Estimated)

### 11.1 Cube Physics
- **Gravity**: Strong downward pull (~25-30 units/s^2)
- **Jump velocity**: Fixed upward impulse (~15-20 units/s)
- **Jump height**: ~3 block heights
- **Horizontal speed**: Constant (varies with speed portals)

### 11.2 Speed Tiers
| Speed | Multiplier | Feel |
|-------|-----------|------|
| Slow | 0.5x | Deliberate, more reaction time |
| Normal | 1.0x | Default pace |
| Fast | 2.0x | Quick, need memorization |
| Very Fast | 3.0x | Intense, mostly memorization |
| Extreme | 4.0x | Nearly impossible to react |

### 11.3 Mini Mode Physics
- Character is roughly 50% normal size
- Falls faster (higher effective gravity)
- Shorter jump height
- Can fit through smaller gaps

---

## 12. TECHNICAL CONSIDERATIONS

### 12.1 Collision Detection
- Hitboxes are precise and consistent
- Character hitbox is slightly smaller than visual (forgiving)
- Obstacles use exact geometric collision
- Collision checked every frame

### 12.2 Performance Requirements
- Must run at consistent 60 FPS (frame drops = death)
- Input lag must be minimal (<16ms)
- Audio sync must be tight (music = gameplay cues)

### 12.3 Level Data
- Levels can be stored as arrays of objects with:
  - Position (x, y)
  - Type (spike, block, portal, orb, pad, etc.)
  - Properties (rotation, scale, color, trigger data)
- Horizontal position determines when objects appear as camera scrolls

---

## 13. WHAT MAKES IT ADDICTIVE

1. **Instant restart** - Near-zero delay between death and retry
2. **Progress tracking** - "I got to 67%!" creates motivation to beat personal best
3. **Rhythm sync** - Music makes repetitive play feel satisfying, not tedious
4. **Memorization reward** - Each attempt teaches you more of the level
5. **One-touch simplicity** - Easy to learn, extremely hard to master
6. **Flow state** - When you "get in the zone," it's deeply satisfying
7. **Short levels** - Each level is 1-2 minutes, feels achievable
8. **Visual spectacle** - Looks cool, feels cool when you nail a section

---

## 14. DOG DASH THEMATIC ADAPTATIONS

| Original | Dog Dash Equivalent |
|----------|-------------------|
| Cube | Running dog |
| Ship | Dog with propeller hat / flying dog |
| Ball | Dog rolling / tumbling |
| UFO | Dog in a hovering saucer |
| Wave | Dog doing a super dash / streak |
| Robot | Dog in a mech suit / pogo stick |
| Spider | Dog with grappling hook |
| Spikes | Cactus / fire hydrants / bones pointing up |
| Orbs | Tennis balls (tap to bounce) |
| Pads | Trampolines / spring boards |
| Portals | Dog doors (different colors) |
| Death effect | Cartoon poof with bones/stars |
| Trail | Paw prints |
| Coins | Dog treats / bones |
| Background | Dog park, city, space kennel, etc. |

---

## SOURCES

- [Geometry Dash Lite](https://geometrylitepc.io/)
- [Geometry Dash Wiki (Fandom)](https://geometry-dash.fandom.com/wiki/Geometry_Dash_Wiki)
- [Geometry Dash Lite Levels Guide](https://simplegameguide.com/geometry-dash-lite-levels/)
- [Game Modes Explained](https://geometrydash.co.uk/geometry-dash-game-modes-explained/)
- [Portal Mechanics Guide](https://www.playgeometrydashgame.com/geometry_dash_gamemode_portals/)
- [Gravity & Portal Physics](https://geometrydashlite2.org/blog/mechanics/how-gravity-and-portals-work-in-geometry-dash-the-physics-guide)
- [Visual Style Deep Dive](https://reporting.theparentcue.org/geometry-dash-backgrounds-a-deep-dive-into-the-games-iconic-visual-style/)
- [All Game Modes](https://www.playgeometrydashgame.com/all_geometry_dash_game_modes/)
