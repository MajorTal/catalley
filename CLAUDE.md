# Cat Alley

A pixel-art browser game served as static files (no build step locally).

## Deployment

Push to `main` → automatically deployed via AWS Amplify:

- **cats.yuval.nl** — the game (served from repo root)
- **dog.yuval.nl** — Dog Dash game (served from `dogdash/`)
- **yuval.nl** — landing page (served from `landing/`)

That's it — just `git push`. No AWS account or console access needed.

The Amplify build step generates `js/version.js` with an auto-incrementing version number (git commit count). Locally this file contains `'dev'`.

## Architecture

- Static site: raw HTML/JS/CSS served directly (no bundler)
- Hosting: AWS Amplify → CloudFront CDN
- Cache-Control headers set to `no-cache` in `amplify.yml` so deploys take effect immediately

## Cat Alley (cats.yuval.nl)

- Pixel-art cats walk across a street canvas; click them to steal accessories
- 40 accessories across 5 slots (hat, glasses, scarf, collar, accessory) with weighted rarities
- Compose your own cat and save it to "The Alley" gallery (localStorage)
- Includes a chiptune music editor

## Dog Dash (dog.yuval.nl)

- Infinite side-scrolling runner (Geometry Dash style)
- Deterministic procedural level generation via seeded PRNG (mulberry32, seed 12345)
- 27 GD-style obstacle patterns organized by difficulty tier (easy → expert)
- Difficulty ramps over ~500 blocks: tighter spacing, harder patterns
- Obstacles: spikes, blocks (stackable, max 2 high), gaps with warning stripes, jump pads
- Jump buffer (8 frames) and hold-to-auto-jump for responsive controls
- Score = distance in blocks; best score persisted in localStorage
- All rendering: canvas 800×500, no external assets
