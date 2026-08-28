# Campaign Arena

**AI-powered KOC campaign manager with WebMCP human-in-the-loop control.**

Built for the [WebMCP Hackathon](https://webmcp.devpost.com) — demonstrating how websites can expose structured tools to AI agents while keeping humans in control of critical decisions.

## What it does

Campaign Arena lets an AI agent (via WebMCP) manage influencer (KOC) marketing campaigns autonomously — finding creators, proposing deals, and running every action through a Policy Engine. When a violation is detected, the agent **blocks and waits** for human approval before proceeding.

### 4 violation scenarios demonstrated

| Violation | Trigger | Agent behavior |
|---|---|---|
| **Blacklist** | Propose Luna Forbidden | Hard block, agent self-corrects |
| **Platform not allowed** | Propose Yuna Trend (YouTube) | Block, agent switches to TikTok |
| **Split deal** | Propose Kira Fresh again (cumulative > ¥10M) | Flags budget split attempt |
| **Over approval threshold** | Propose Miyu Glow (¥12M > ¥10M limit) | Escalates to human |

### AEGIS Trust Score

The agent earns or loses trust based on behavior. Higher trust = more autonomy. The score updates live as the agent acts.

## WebMCP Tools exposed

```js
searchKOCs(platform?, category?)       // Search influencer database
proposeDeliverable(kocKey)             // Propose deal — blocks on violation
getTrustScore()                        // Current score + autonomy tier
endSession()                           // Close session, show final report
```

`proposeDeliverable` uses `waitForDecision()` — a real Promise that resolves only when the human clicks Approve or Reject in the UI.

## How to run

No build step. Single HTML file.

```bash
# Option 1: local file
open index.html

# Option 2: local server
npx serve .
```

**To test with an AI agent:**
- **ChatGPT desktop app** — open via the in-app browser (WebMCP enabled by default)
- **Chrome 149+** — enable `chrome://flags/#enable-webmcp-testing`, then open the page

## Stack

- React 18 + Babel standalone (no bundler)
- WebMCP (`document.modelContext.registerTool`)
- Single `index.html` — zero dependencies to install

## License

MIT
