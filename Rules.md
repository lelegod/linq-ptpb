# Rules — how the 4 of us work for the next 6 hours

Not principles. Not values. Rules. Print this or pin it in the group chat.

---

## 1. Scope discipline

1. **If it isn't in PRD §4 Must-have, it isn't in v0.** Should-haves get built only after the hour-4 checkpoint passes green. Anything else — write a `TODO_LATER.md` note and move on.
2. **Say no out loud.** If a teammate suggests a feature not in the PRD, someone says "post-hackathon" and we move on. No debate, no compromise.
3. **The founder's rule wins ties: do ONE thing well.** Our one thing is *ongoing travel companion*. Every debate resolves toward the companion story.

## 2. Time discipline

1. **Hard checkpoints at 1:30, 3:20, and 4:00 (elapsed from now).** Everyone stops what they're doing for 5 minutes. Status: green / yellow / red. See Phases.md for the exact go/no-go tests.
2. **No feature added after 4:00.** Everything after 4:00 is polish, demo rehearsal, and seeding demo data. If it doesn't work by 4:00, it isn't in the demo.
3. **15-minute rule for blockers.** If you're stuck for 15 minutes, tap the person next to you. If together you're stuck for another 15, drop it and move to the fallback path.
4. **Linq is the messaging bloodstream.** If you're Person A, treat the Linq webhook URL and API key like production secrets. Set them in Railway env vars once; don't paste them in a chat, don't commit them. If Linq rate-limits or drops a message during rehearsal, note the request id and ping the Linq rep at the venue — they can trace it in seconds.
5. **Actions go to handles, text goes to chats.** When sending via Linq: `POST /v3/messages` for action cards (map card); `POST /v3/chats/{chat_id}/messages` for plain text replies. Getting this wrong gives you Linq error 1005 and burns 15 minutes. Wrap both in `/src/agent/linq.ts` so nobody guesses.
6. **First message to a new chat cannot be an action card.** All our first replies are plain-text greetings anyway, so we're fine — but never send `book_trip`'s card to a user we've never texted before.

## 3. Coding conventions

1. **TypeScript everywhere.** No `.js` files in `/src`. No `any` in function signatures — use `unknown` and narrow. Exception: `any` in a Sendblue webhook payload adapter is fine, cast at the boundary and be done.
2. **One file per concern.** Agent tools in `tools.ts`, Rejseplanen calls in `rejseplanen.ts`, DB queries in `db.ts`. If your file is over 300 lines, split.
3. **No new dependencies without a Slack ping.** Every dep is another `npm i` that could fail on Railway. Justify it in one sentence before installing.
4. **Prettier defaults, no bikeshedding.** `npx prettier --write .` before pushing.
5. **Boundaries are typed, internals can be loose.** Every function that talks to a network, DB, or the LLM has typed inputs and outputs. Internal helpers can be quick and dirty.
6. **Never commit `.env*`.** `.gitignore` includes it hour 0. If a key leaks, rotate immediately — Sendblue and Anthropic both let you revoke.

## 4. Git conventions

1. **Single branch: `main`.** Push often. No PRs. No branches. This is a hackathon.
2. **Commit messages: `[owner] what changed`** — e.g. `[B] add plan_trip tool`. So we can grep by owner during the retro.
3. **Never force-push.** If you break `main`, `git revert` and move on.
4. **Pull before you push.** Merge conflicts cost 10 minutes each — avoid them by keeping files owner-scoped (see §7).

## 5. LLM prompting principles (for Person B)

1. **The system prompt is a contract, not a personality.** It lists what the agent must always do, what it must never do, and what it has access to. Personality lives in one paragraph at the end.
2. **Tools before prose.** The LLM should call a tool whenever there is one that fits — never invent trip data, never make up prices, never guess a delay. If a tool doesn't exist for what the user asked, reply honestly and offer what we *can* do.
3. **Short replies.** Two to five iMessage bubbles worth of text per turn, max. iMessage is not email.
4. **Always propose the next tap.** Every reply ends with either an option to pick or a suggested next action. Never leave a dead end.
5. **Danish place names are hard.** Pass them through the `findStation` tool with typo tolerance — don't ask the LLM to normalize "Nørreport" from memory.

## 6. Testing philosophy

1. **Manual smoke tests every deploy.** Before pushing, run through: "text hi → text 'to Aarhus tomorrow 9am' → pick option → get deep link → cron fires a reminder." If any step fails, don't push.
2. **One seed user in Supabase for demo.** Everyone tests against that user. Real personal phone numbers get added only in hour 6.
3. **No unit tests. No integration tests. No CI.** We manually rehearse the demo three times in hour 5→6, that is the test suite.
4. **The demo path is the golden path.** If a change breaks the demo path but "improves" something else, revert.

## 7. Ownership & file boundaries

To avoid merge conflicts, files have primary owners:

| Owner | Owns |
|---|---|
| Person A (iMessage via Linq) | `/api/inbound.ts`, `/src/agent/sendMessage.ts`, `/src/agent/linq.ts`, Linq dashboard |
| Person B (Agent) | `/src/agent/*` (prompt, tools, loop), `/src/transport/rejseplanen.ts` |
| Person C (Website + Linq) | `/src/app/page.tsx`, `/src/app/(marketing)/*`, `/public/*`, Tailwind config, Linq profile dashboard |
| Person D (Data/Cron) | `/supabase/**`, `/src/db/*`, `/src/cron.ts`, `/src/instrumentation.ts`, `/scripts/*`, seed data |

Cross-file edits are allowed but ping the owner in the group chat first. Owners don't have to say yes — they just have to know.

## 8. Communication

1. **Group chat is the log.** Every checkpoint, every blocker, every deploy: post there.
2. **Announce deploys.** "Pushing to prod, watch the demo user thread." Everyone freezes their test messages for 30 seconds.
3. **When you're stuck, say so.** "Blocked on X, tried Y and Z" — not "hmm this is weird."
4. **Ask for help before you rewrite.** Nothing gets rewritten from scratch in this session.

## 9. Demo etiquette

1. **One person drives the demo.** They rehearse three times. Nobody else touches the demo phone once rehearsals start.
2. **The pitch is 90 seconds max.** 30s problem, 30s show, 30s ask. If you can't say it in 90, you can't say it.
3. **Have a backup video.** A 45-second screen recording of a full happy path. If wifi dies, we play it and pitch over it.
4. **Say the sponsors' names.** Cursor. Linq. Naturally, once each, not with a bow on top.

## 10. What we do NOT touch

- Copy-pasting Rejseplanen data into the LLM context (waste of tokens — use tools).
- Adding a login flow "just in case."
- Refactoring after hour 4.
- Making the website "responsive on tablets" — phones and laptops only.
- Trying to make Rejsekort work (physical NFC card, there is no API, do not try).
- Discussing which framework we should have used.
