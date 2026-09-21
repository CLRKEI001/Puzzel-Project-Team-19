# Sponsor feedback (scan of 18 Aug 2026) — what changed

The site is now three sites sharing one set of components (`src/components/SiteChrome.js`):

| Site | Pages (App.js keys) | Nav |
|---|---|---|
| The Puzzle Project | `home`, `about`, `donate` | Home · About · The Puzzle Box · Puzzle Play · Donate · Login |
| The Puzzle Box | `pb-home`, `pb-how`, `pb-training`, `pb-purchase` | How it works · Training · Purchase · Login |
| Puzzle Play | `pp-home`, `pp-how`, `pp-purchase`, `pp-login` | How it works · Purchase · Login |

## Sketch page → implementation

| Sketch | Where |
|---|---|
| TPB p1 — logo, nav order, stats 295+/4/3/4 | `SiteChrome.js` (`BRANDS`, `Navbar`), `PuzzleBoxHome.js` (reuses `Hero` from `Homepage.js`) |
| TPB p2 — tiers: "The Puzzle Box" wording, click to sign-up / login | `PuzzleBoxHome.js` — each tier card has Sign up / Log in buttons |
| TPB p3 — training for Tier 1 / Tier 2 (entails, why, where, who, qualification) | `Trainingpage.js` → `TierTrainingSection` (**draft copy — needs sponsor sign-off**) |
| TPB p4/p5 — Tier 1 & 2 sign-up / login; login gives Training + Buy buttons | `Login.js` (`tier`, `initialMode` props); `MemberArea.js` landing; sidebar links in TeacherHome / PsychologistHome |
| TPB p6 — training needs login + Product number | `MemberArea.js` (Training view) + `supabase/migrations/003_screener_product_numbers.sql` |
| PPlay p1, PP p2, PP p3 | `PuzzlePlayPages.js` |
| Data (admin only) | No change — AdminHome already provides admin-only data/reporting. Puzzle Play data not built (sketch says it will be simpler). |
| Donate — Puzzle Box + Puzzle Play blocks, R25 000 branding note | `DonatePage.js` |
| Footer — remove "Start Training" | `SiteChrome.js` → `CallToAction` |

## To go live
1. Run `supabase/migrations/003_screener_product_numbers.sql`.
2. Add one row per screener supplied to `screener_products` (long random numbers, e.g. `PB-7K3M-92QX`).
3. Drop real logos into `public/` and set `logoSrc` in `BRANDS` (`SiteChrome.js`) — until then a wordmark is drawn.

## Open questions / placeholders
- Donate page: is it "TPP page 5", or should donations stay on the home page? (Home page now has a short link to Donate.)
- Puzzle Play donation amounts were blank in the sketch — currently the same as the screener's (R50/150/500/1 000).
- Tick next to "Farm" on PP p2 — treated as an image slot; all four have "Image TBC".
- One Product number can currently unlock several users (colleagues at one school). Tighten in the SQL function if needed.
- "Donate now" buttons and purchases have no payment integration (purchases open an email to gary@picturetree.co.za).
- Puzzle Play home / how-it-works text, the Puzzle Box purchase page and training copy are drafts.
- Tier 2 sign-up page (sketch p5 is a squiggle) reuses the same form, restricted to the psychologist role.
- New sidebar links are English-only; dashboards are otherwise EN/AF/XH.
- Contact Us (footer band) used to open the login screen; it now opens an email.
- "PuzzleBox" → "The Puzzle Box" applied to public pages and login headings only, not dashboards/reports.

## Tests
`src/siteFlow.test.js` clicks through every new page and the educator training flow (`npm test`).
The old CRA `App.test.js` ("learn react") was already failing and is untouched.
