<div align="center">
  <img src="assets/aegis-idle.png" alt="AEGIS" width="80" height="80">
  <h3>Campaign Arena</h3>
  <p>A shared campaign workspace where an AI agent proposes KOC deals and a human keeps final control.</p>

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![WebMCP](https://img.shields.io/badge/WebMCP-enabled-6C5CFF)](https://learn.chatgpt.com/docs/webmcp)
  [![Live Demo](https://img.shields.io/badge/demo-live-31D69A)](https://campaign-arena-webmcp.vercel.app)
</div>

---

**[Open the live demo](https://campaign-arena-webmcp.vercel.app)**

![Campaign Arena screenshot](docs/screenshot.png)

## Why WebMCP

Influencer campaign work mixes repetitive agent tasks with decisions a person should still own. Campaign Arena lets the agent search creators, evaluate policy, and propose deals through structured Site tools while the person watches the same live dashboard. A risky proposal pauses the tool call, opens a decision dialog, and resumes only after the person approves or rejects it.

This shared-page model is the point of the project: the agent does not guess through visual controls, and the person does not lose context or authority.

## Product behavior

- Clean, deterministic session with visible activity, spend, mission progress, and Session Ledger
- Five policy checks: blacklist, platform allowlist, campaign budget, split-deal detection, and single-deal approval threshold
- LOW, MEDIUM, and HIGH autonomy tiers plus a manual auto-confirm switch
- Transactional tool results: a tool resolves only after the returned outcome is visible in the UI
- Human-in-the-loop Promise for escalated proposals; concurrent mutations and session closure are bounded while a decision is pending
- Reason-specific, policy-rechecked correction after rejection; corrections are suggestions and never silently commit spend
- Responsive dashboard and decision flow for desktop and mobile

The Session Ledger is intentionally in-memory for this prototype. Starting a new session or reloading clears it; it is not presented as durable or immutable storage.

## WebMCP Site tools

The top-level page registers four imperative tools with `document.modelContext.registerTool`:

| Tool | Contract |
|---|---|
| `searchKOCs(platform?, category?)` | Read-only search; synchronizes the exact result set to the dashboard and KOCs view |
| `proposeDeliverable(kocKey)` | Proposes one deal; auto-confirms a safe action or waits for a human decision |
| `getTrustScore()` | Read-only exact score, tier, and factor breakdown |
| `endSession()` | Writes the final report, completes the mission, and locks later mutations |

Expected TikTok + Beauty search order:

1. Sakura Beauty — 6.7% — ¥8,000,000
2. Miyu Glow — 4.8% — ¥12,000,000
3. Luna Forbidden — 7.2% — ¥9,000,000
4. Sora Viral — 8.1% — ¥4,800,000

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run build
npx serve dist
```

Open the local URL printed by `serve`. A regular browser supports the full direct UI; WebMCP calls require a supported WebMCP browser.

Useful checks:

```bash
npm run check
```

The checked-in `index.html` is the JSX source. `npm run build` compiles it with esbuild into the ignored `dist/` directory, copies assets, and fails if runtime Babel remains in the production document.

## Test directly in the UI

1. Open the site and choose **Start Campaign Session**.
2. Select **KOCs**, then propose **Sora Viral**. Expect `✓ Confirmed`, committed spend `¥4,800,000`, and matching proposal/confirmation entries in the Session Ledger.
3. Propose **Luna Forbidden**. Expect the blacklist decision dialog. Choose **Reject**; expect Luna to become rejected, committed spend to stay unchanged, and a policy-safe alternative recorded.
4. Select **End Session**. Expect a final report with the exact one-decimal score, mission Completed, and all proposal controls locked.
5. Select **New Session**. Expect zero session activity, zero committed spend, and an empty Session Ledger.

## Test with ChatGPT desktop Site tools

Use the latest ChatGPT desktop app with **GPT-5.6 Sol** or **GPT-5.6 Terra**. GPT-5.6 Luna currently has Site tools disabled. In **Settings → Browser → Permissions**, keep **Enable site tools** on.

1. Open the deployed Campaign Arena URL in ChatGPT's built-in browser and leave that page open. Site tools belong to the current page and can disappear after navigating away or closing it.
2. In the address bar, open **Site tools → Available site tools** and verify the four tools listed above.
3. Start a new chat beside the open page and run the read-only prompt below.

```text
Use only the Campaign Arena WebMCP Site tools from the currently open page.
Call getTrustScore, then call searchKOCs with platform "TikTok" and category "Beauty".
Report the exact tool results and verify the same four KOCs are visible in Campaign Arena.
Do not call proposeDeliverable or endSession.
```

4. Run the safe mutation prompt.

```text
Use only Campaign Arena WebMCP Site tools.
Call proposeDeliverable with kocKey "sora".
After it completes, report the exact result and verify Sora's status, committed budget, activity, and Session Ledger in the visible page.
```

Expected result: `{ status: "auto_confirmed", amount: 4800000 }`, returned after the UI shows the confirmed deal.

5. Run the human-decision prompt. Do not navigate or reload while the call waits.

```text
Use only Campaign Arena WebMCP Site tools.
Call proposeDeliverable with kocKey "luna" and keep the call running while I decide in the Campaign Arena dialog.
After I choose Reject, report the exact tool result, violation reason, score change, and Session Ledger change.
Do not replace the Site-tool call with ordinary browser automation.
```

Expected result after Reject: `{ status: "rejected", violation: "blacklisted_koc" }`. With the documented Sora-then-Luna flow, the score changes from `82.0` to `81.7`, remains `HIGH`, and Luna never increases committed spend.

6. Finish with:

```text
Use only Campaign Arena WebMCP Site tools. Call getTrustScore, then endSession. Report both exact results and verify the final report and Completed mission in the visible page. Do not attempt another campaign action after closure.
```

## Policy scenario matrix

| Scenario | Trigger | Expected behavior |
|---|---|---|
| Safe auto-confirm | Sora Viral | Confirms at ¥4,800,000 in HIGH autonomy |
| Blacklist | Luna Forbidden | Waits for human; rejection suggests a non-blacklisted creator |
| Platform restriction | Yuna Trend | Waits for human; rejection suggests an allowed-platform creator |
| Split deal | Kira Fresh | Detects the existing ¥5,000,000 prior spend; correction caps the new amount at ¥5,000,000 |
| Approval threshold | Miyu Glow | Waits for human at ¥12,000,000; correction suggests ¥8,000,000 |
| Campaign budget | Reduce budget below committed + proposal | Approve is disabled for the hard limit; correction never exceeds remaining budget |
| Manual approval | Turn Auto-Confirm off | A policy-safe proposal still waits for explicit approval |

Invalid KOC keys, duplicate proposals, concurrent proposal attempts, ending during a pending decision, and mutations after session closure return bounded error objects instead of hanging or duplicating spend.

## Stack

| | |
|---|---|
| UI | React 18, static JSX source compiled with esbuild |
| Protocol | Imperative WebMCP Site tools in the top-level page |
| Assets | Four local AEGIS states |
| Hosting | Static Vercel output from `dist/` |

## License

MIT — see [LICENSE](LICENSE).
