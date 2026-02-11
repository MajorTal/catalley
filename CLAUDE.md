# Cat Alley

A pixel-art browser game served as static files (no build step locally).

## Deployment

Push to `main` → automatically deployed to **cats.yuval.nl** via AWS Amplify.

That's it — just `git push`. No AWS account or console access needed.

The Amplify build step generates `js/version.js` with an auto-incrementing version number (git commit count). Locally this file contains `'dev'`.

## Architecture

- Static site: raw HTML/JS/CSS served directly (no bundler)
- Hosting: AWS Amplify → CloudFront CDN
- Cache-Control headers set to `no-cache` in `amplify.yml` so deploys take effect immediately
