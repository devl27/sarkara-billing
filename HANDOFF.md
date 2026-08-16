# Claude Code Handoff — Sarkara's Billing App

## Context
Static single-file billing app for Sarkara's food stall at KSP Onachanda 2026 (event is TODAY, Aug 16). Built and tested already — DO NOT modify the app code unless something breaks. Files in this folder:
- index.html — complete app (vanilla JS, qrcodejs via cdnjs, localStorage persistence)
- README.md
- vercel.json

## Your tasks (in order)
1. `git init`, commit all files on `main` with message: "Sarkara's stall billing app — Onachanda 2026"
2. Create a new PUBLIC GitHub repo `sarkara-billing` under the `devl27` account using `gh repo create` (gh CLI is authenticated on this machine; if not, run `gh auth login` and wait for me)
3. Push main to origin
4. Enable GitHub Pages from main branch root:
   `gh api repos/devl27/sarkara-billing/pages -X POST -f "source[branch]=main" -f "source[path]=/"`
5. Print the live Pages URL (https://devl27.github.io/sarkara-billing/) and verify it returns HTTP 200 (may take 1–2 min to build — retry with curl)
6. OPTIONAL Vercel: if `vercel` CLI is installed and logged in, also run `vercel --prod --yes` from this folder and print that URL. If not installed, skip — Pages is sufficient.

## Acceptance criteria
- Repo exists at github.com/devl27/sarkara-billing
- Live URL loads the app (green/gold billing grid visible)
- Report both URLs back to me

## Do NOT
- Do not add a build step, framework, or package.json — it's intentionally a static file
- Do not touch the localStorage keys (sarkara-config, sarkara-sales)
