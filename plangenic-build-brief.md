# Build brief for Claude Code — "Plangenic"

I have a working prototype in this folder (the `.jsx` file I'm providing). It currently runs as a single front-end file that calls the Anthropic API directly from the browser. I need you to **rebuild it as a real, deployable web app** — same features and layout, but production-ready and secure.

Please read the prototype file first; it is the source of truth for the exact UI, wording, sections, and behaviour. This brief explains the purpose and the things that must change for production.

---

## What the app is

Plangenic is an AI-powered tool that generates two kinds of documents for businesses and consultants:

1. **Strategic plans** — board-ready, structured.
2. **Business plans** — investor/bank-ready, structured.

It uses the Claude API to write the content. A user fills in a short brief about their business, and the app generates a full, multi-section document.

---

## The single most important change for production

In the prototype, the browser calls `https://api.anthropic.com/v1/messages` directly. **This must not happen in production** — it would expose the API key and is blocked in most environments.

Please:

- Create a **small backend** (serverless functions are fine — e.g. Vercel/Netlify functions, or a Node/Express server) that holds the Anthropic API key in an **environment variable** (`ANTHROPIC_API_KEY`), never in the front-end code and never committed to Git.
- The front end should call **my own backend endpoint**, which then calls the Anthropic API and returns the result.
- Keep the same model and request shape the prototype uses, but use a current Anthropic model string and confirm it against the latest Anthropic API docs.
- Add a `.gitignore` that excludes `.env` and `node_modules`.

---

## Features to preserve exactly (from the prototype)

**Role selector (first choice on screen):**
- **Business owner** → the app automatically chooses which analysis frameworks suit the business, based on its stage and goals, and explains *why* each was chosen in plain language.
- **Business consultant** → full manual access to pick any framework from the complete list.

**Inputs:** organization name, industry/sector, current stage (idea/startup/growth/established/turnaround), planning or projection horizon (3–6 months up to 100 years), goals, key objectives, and known constraints/anticipated delays.

**Document type switch:** Strategic plan or Business plan.

**Strategic plan output (in order):** Executive summary; plain-language Summary for all stakeholders; 1) Mission, vision & values; 2) Environmental scan; 3) Strategic analysis (the chosen frameworks, each applied to the business on demand, with reasoning); a Framework comparison chart that scores every method in each category 0–100 and names the single best per category; 4) Strategic priorities; 5) Goals & objectives; 6) Strategies & initiatives; 7) Roadmap (visual timeline of phases); 8) KPIs, milestones & review cycle; 9) Budget, roles & governance.

**Business plan output (in order):** Title page; 1) Executive summary; 2) Business overview; 3) Market analysis; 4) Products & services; 5) Marketing & sales; 6) Operations; 7) Management & staffing; 8) Financial plan (with an "illustrative figures — validate before use" disclaimer); 9) Appendices.

**Framework library:** 39 methods grouped into 5 categories — Strategy & competitive; Leadership & change; Market & product; International & macro; Analysis methods in use. (Exact names are in the prototype.)

**Staged generation:** the document is generated in several sequential steps with a visible progress indicator, so no section gets cut off. Keep this approach.

**Tailored versions:** after generation, the same document can be rewritten for three audiences — Business, Stakeholders, Management.

**Export:** download the finished document as **PDF** and as **editable Word**. These must work in production.

---

## Deployment

- Put the project in my GitHub repo (I have Git, a GitHub account, and Claude Code set up).
- Deploy to **Vercel** (free tier to start). Set `ANTHROPIC_API_KEY` as an environment variable in the Vercel project settings, not in the code.
- Walk me through each step — I'm a beginner. Explain what each command does before I run it.

---

## Please also

- Add basic error handling so if an AI call fails, the user sees a clear message (the prototype already shows step-by-step errors — keep that).
- Remind me to set a **spending limit** in the Anthropic console before going live, so testing can't run up a surprise bill.
- Keep the visual design from the prototype (fonts, colours, layout).

---

## How I'd like to proceed

Start by reading the prototype file and giving me a short plan of the project structure you'll create and the steps we'll go through. Then build it step by step, pausing to explain anything I need to do on my end (API key, GitHub, Vercel).
