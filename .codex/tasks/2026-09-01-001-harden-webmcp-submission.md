---
slug: harden-webmcp-submission
status: planning
created: 2026-09-01
updated: 2026-09-01
agent: codex
delegation: none
tags: [webmcp, hackathon, reliability, responsive, release]
---

# Harden Campaign Arena for WebMCP Submission

## Purpose

> "checkout 1 nhánh tương ứng và làm việc (và dùng lại [$codex-plan](/Users/soc_036/work_dir/Hackathon/campaign-arena-webmcp/.agents/skills/codex-plan/SKILL.md) để dựng plan lại, các file changes hiện tại thì commit ở nhánh chúng ta checkout nhé, tôi có thêm .codex .agents AGENTS.md và file .gitignore thfi mấy cái này commit ở bên nhánh checkout ra nhé"

Campaign Arena should become a coherent, judge-ready WebMCP product rather than only a working tool-call proof. A reviewer should be able to start a clean session, see every Site-tool result reflected immediately in the shared UI, exercise policy and human-approval paths without bypasses or hangs, and verify the same deployed flow on desktop and mobile.

## Context & Orientation

### Related Code

- `index.html` — single-file React application, WebMCP registrations, session state, policy engine, async human approval, trust score, and all responsive rendering.
- `README.md` — public setup, feature claims, tool contract, test instructions, and submission-facing explanation.
- `docs/screenshot.png` — current public product screenshot; replace after the clean production flow is stable.
- `assets/` — AEGIS state artwork used by the UI; preserve unless layout verification exposes an asset-specific problem.
- `.gitignore` — ignores local agent layers and environment files; already committed intentionally with the ignored agent files force-added.
- `AGENTS.md`, `.agents/`, `.codex/` — repository-local Codex workflow committed on the task branch before this plan was created.

### Related Docs

- `README.md` — current product and implementation claims that must match runtime behavior.
- `docs/screenshot.png` — existing desktop evidence, currently based on seeded state.
- https://webmcp.devpost.com/ — challenge requirements, submission artifacts, deadline, and judging criteria.
- https://learn.chatgpt.com/docs/webmcp — ChatGPT Site-tools behavior, supported models/browser, page-scoped tools, limitations, and security expectations.
- https://webmachinelearning.github.io/webmcp/ — proposed WebMCP standard and imperative API reference.
- https://campaign-arena-webmcp.vercel.app/ — production URL used for final Site-tools testing.

### Memory Hints

- Work is isolated on branch `codex/campaign-arena-submission-readiness`. Commit `687c4c8` contains the user-added `.codex`, `.agents`, `AGENTS.md`, and `.gitignore` files. No push or deployment has been performed in this task.
- The Devpost deadline shown on 2026-09-01 is September 3, 2026 at 1:00 PM PDT. Prioritize product correctness and the live WebMCP story before lower-risk production cleanup.
- Runtime proof is no longer an open blocker: the deployed page was tested in ChatGPT App, which discovered `searchKOCs`, `proposeDeliverable`, `getTrustScore`, and `endSession`; Sora returned `auto_confirmed`, Luna paused for a human decision and resumed with `rejected / blacklisted_koc`, and `endSession` returned the final score. An earlier direct probe reporting `document.modelContext` as undefined is weaker evidence than these successful Site-tool calls and should remain only a release regression check.
- The successful test began at score 82/HIGH, searched TikTok + Beauty and returned Sakura, Miyu, Luna, and Sora. After Sora auto-confirmation and a human rejection of Luna, the tool reported score 81.7/HIGH. The UI rounded that value to 82.
- Search/UI mismatch is confirmed in source: `searchKOCs` returns filtered data but does not persist the result for rendering; Dashboard always shows the first three roster entries. The shared page therefore showed Sakura, Hana, and Rin instead of all four returned candidates.
- Initial activity, ledger, committed budget, and KOC statuses are seeded. This polluted the live test summary: the UI reported more proposals than the ChatGPT test actually made. A real session must start from a deterministic clean baseline; the existing Simulate Agent action can remain the way to populate a demo.
- Tool completion and UI completion are not atomic. Safe proposals return before delayed ledger/UI updates, and human decisions resolve the pending Promise before React state and ledger changes are committed. Immediate read-only verification can race the UI.
- Policy gaps confirmed in source: campaign budget is displayed but not enforced; trust tier is display-only; non-blacklist rejection paths lower price and confirm without re-running all policies, which can bypass platform and split-deal restrictions. Repeated or concurrent proposals and ending during a pending decision also need deterministic error behavior.
- `endSession` currently displays a toast/report but does not close or lock the session. The mission remains active and further mutations remain possible.
- Mobile overflow was previously reproduced at 390x844: page width was approximately 1134px for a viewport around 385px. Source has fixed multi-column grids and no responsive media query other than reduced-motion handling.
- The UI calls the in-memory, reload-volatile, directly updated array an “Immutable Ledger.” Prefer the truthful label “Session Ledger”; building durable persistence is outside this hackathon-hardening task unless separately requested.
- Production currently ships React, ReactDOM, and Babel Standalone from CDNs and compiles `text/babel` in the browser. Remove the runtime compiler only after the core WebMCP flow is stable; do not jeopardize Site-tool runtime proof for this lower-priority cleanup.
- Do not add `getLedger` or `getSessionState` speculatively. OpenAI documents that an agent may inspect the live page after Site-tool calls. Reconsider one narrow read-only state tool only if the corrected UI still cannot provide deterministic verification.
- Delegation is `none`: the implementation is concentrated in one HTML application and parallel write ownership would create conflict. A fresh read-only final review may still be used if the active harness permits it after implementation.

## Plan of Work

Stabilize the state machine before changing presentation. First create a clean, closed lifecycle for a session and make WebMCP tool completion correspond to committed UI state. Then centralize policy decisions so budget, autonomy, correction, duplicate calls, and human decisions all pass through the same rules without hidden confirmation paths.

Once behavior is deterministic, connect search output and mission progress to the visible page, make public labels and documentation truthful, and repair the responsive layout and modal accessibility. Only after those acceptance checks pass should the production runtime be cleaned up, documentation evidence refreshed, and the Vercel build tested again through ChatGPT App.

## Concrete Steps

- [ ] Step 1 — Establish a deterministic session lifecycle in `index.html`: clean initial state, explicit active/ended behavior, safe reset/demo boundaries, and no new mutations after closure (verify: a fresh load reports zero test-created actions, ending a session reaches a visible completed state, and later proposal attempts return a bounded failure without changing the ledger).
- [ ] Step 2 — Make WebMCP operations transactional in `index.html`: validate inputs, reject busy/duplicate/concurrent calls predictably, and resolve each tool only after its observable state is committed (verify: immediate inspection after search, auto-confirm, approve, reject, and end sees the exact state represented by the returned result; no call hangs when another decision is pending).
- [ ] Step 3 — Unify policy and autonomy enforcement in `index.html`, including campaign budget, approval threshold, platform, blacklist, split-deal, manual-auto-confirm configuration, and LOW/MEDIUM/HIGH authority (verify: the scenario matrix produces the expected allow, escalate, reject, or corrected outcome and no corrected proposal is confirmed without passing policy again).
- [ ] Step 4 — Make self-correction reason-specific in `index.html` and preserve the human decision in the Session Ledger (verify: blacklist chooses a non-blacklisted alternative, platform correction remains on an allowed platform, split-deal correction stays under cumulative limits, threshold correction stays under the approval limit, and budget exhaustion never increases committed spend).
- [ ] Step 5 — Synchronize search results and mission progress with the shared UI in `index.html` (verify: TikTok + Beauty immediately shows Sakura, Miyu, Luna, and Sora, shows an explicit empty state for no matches, and the mission ends at Confirm/Completed after the session closes).
- [ ] Step 6 — Align trust display, ledger naming, feature copy, and public contracts across `index.html` and `README.md` (verify: exact-versus-rounded score is unambiguous, “Session Ledger” matches the implementation, each advertised violation and autonomy behavior is demonstrable, and README tool examples match production results).
- [ ] Step 7 — Repair responsive behavior and modal accessibility in `index.html` without changing the visual identity (verify: 390x844 has no horizontal overflow and keeps every primary action reachable; desktop/laptop layouts retain hierarchy; the approval modal has usable focus, keyboard action, labels, and reduced-motion behavior).
- [ ] Step 8 — Replace browser-side Babel compilation with the smallest reproducible production build while keeping the app statically hostable (verify: the deployed document no longer loads Babel Standalone or uses `text/babel`, a clean checkout can reproduce the output using documented commands, and WebMCP tools still register in the supported browser).
- [ ] Step 9 — Refresh `README.md` and `docs/screenshot.png` with a clean test protocol and submission-quality evidence (verify: a new tester can reproduce direct UI use and the ChatGPT App flow without relying on this conversation, and the screenshot/counters reflect only the documented session).
- [ ] Step 10 — Run the full local and production release gates, then deploy only under the approved task scope (verify: all Validation & Acceptance checks pass locally and on the Vercel URL, with final ChatGPT App evidence recorded before the Devpost submission is declared ready).

## Validation & Acceptance

- [ ] `git diff --check` passes and the final diff contains only task-related files.
- [ ] A clean checkout follows `README.md` to produce and serve the application without undocumented global dependencies.
- [ ] Desktop at 1440x900 and laptop at 1280x800 show Dashboard, Missions, KOCs, Session Ledger, Policy, and decision modal without clipped primary actions.
- [ ] Mobile at 390x844 has `scrollWidth <= clientWidth` and all navigation, cards, policy controls, ledger entries, modal actions, and final report remain usable.
- [ ] ChatGPT App discovers the intended Campaign Arena Site tools on the production page using a supported model and current desktop app.
- [ ] `searchKOCs` for TikTok + Beauty returns exactly Sakura, Miyu, Luna, and Sora and the same set is visible immediately on the shared page.
- [ ] A safe Sora proposal returns `auto_confirmed` for 4,800,000 only after KOC status, committed budget, activity, and Session Ledger show confirmation.
- [ ] A Luna proposal pauses for the human; Reject resumes with `rejected / blacklisted_koc`, records the violation and decision, and never confirms Luna.
- [ ] Platform, split-deal, threshold, budget, manual approval, and each autonomy tier are tested independently; every correction re-enters policy and cannot bypass the original constraint.
- [ ] Invalid KOC keys, repeated KOC proposals, concurrent proposal attempts, and `endSession` during pending approval all terminate predictably without duplicate spend or an orphaned tool call.
- [ ] `getTrustScore` exact value, displayed value, tier, factor changes, and final report agree under the documented rounding rule.
- [ ] `endSession` produces a visible final report, moves the mission to completed, rejects later mutations, and preserves a verifiable session summary.
- [ ] Production has no runtime Babel compiler warning and retains a normal UI fallback in browsers without WebMCP.
- [ ] The Vercel URL returns the current release, loads every local asset, has no unexpected console exception, and passes the same ChatGPT Site-tool smoke flow as local testing.
- [ ] README, public repository, MIT license, live URL, and demo evidence satisfy the Devpost requirements; video/submission publishing remains a user-controlled final action.

## Decision Log

- **Decision** (2026-09-01 10:22Z, codex): Use branch `codex/campaign-arena-submission-readiness` and keep the user-added Codex workflow in a separate baseline commit before planning.
  **Rationale**: This preserves `main`, makes the new workflow auditable, and prevents the implementation diff from being mixed with repository tooling setup.
- **Decision** (2026-09-01 10:22Z, codex): Record `delegation: none`.
  **Rationale**: Nearly all product behavior and rendering currently live in `index.html`; parallel writers would overlap heavily, while a single implementation lane can fix shared causes once.
- **Decision** (2026-09-01 10:22Z, codex): Treat successful ChatGPT Site-tool discovery and calls as the WebMCP runtime proof; keep direct DOM probing as diagnostic evidence only.
  **Rationale**: The challenge requires a working agent experience in the in-app browser, and that complete deployed flow has already executed successfully.
- **Decision** (2026-09-01 10:22Z, codex): Start real sessions clean and retain Simulate Agent as the explicit demo-data path.
  **Rationale**: This gives judges reproducible counters and ledger evidence without deleting the existing self-guided demonstration.
- **Decision** (2026-09-01 10:22Z, codex): Rename the current ledger rather than introduce persistence.
  **Rationale**: “Session Ledger” is truthful for an in-memory hackathon prototype; durable immutable storage would expand scope without improving the core WebMCP collaboration proof enough to justify the deadline risk.
- **Decision** (2026-09-01 10:22Z, codex): Defer build cleanup until after behavioral and responsive gates.
  **Rationale**: Browser-side Babel is a production warning, but policy bypasses, state races, and broken mobile presentation have greater judging impact and must not be displaced by tooling work.

## Surprises & Discoveries

- (2026-09-01 10:22Z) `.gitignore` intentionally ignored `.codex`, `.agents`, and `AGENTS.md`, so the user-requested baseline commit required explicitly force-adding those paths.
- (2026-09-01 10:22Z) The live ChatGPT test was stronger than the earlier console probe: Site-tool discovery, read calls, mutation, human pause/resume, and finalization all worked on Vercel.
- (2026-09-01 10:22Z) The source already contains five prior review fixes, but the general non-blacklist correction path still treats unrelated policy violations as price problems and confirms without a full re-check.
- (2026-09-01 10:22Z) The challenge judging criteria reward both WebMCP leverage and a complete coherent product experience, making shared UI synchronization and responsive usability part of submission readiness rather than optional polish.

## Outcomes & Retrospective

