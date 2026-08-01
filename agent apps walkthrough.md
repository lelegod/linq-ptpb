# Just-in-Time UI on Linq — Hackathon Guide

**For humans (30 seconds):** Your agent lives in iMessage, but sometimes a conversation
needs real UI — a quiz, a picker, a confirmation screen, a game. The pattern: your agent
**sends a card** into the chat (via Linq's `link` experience), the card opens **any https
page you host**, that page **beacons user actions back to your server**, and when the user
finishes or closes it, your server **texts a summary back into the same conversation**.
The conversation is aware of what happened in the UI. That's the whole loop — ship it in
an hour. Everything below is for your coding agent.

---

## For agents: the complete recipe

**Prereqs:** a Linq API token (`linq tokens show`), your Linq number (`linq whoami`),
and any public **https** host for your page (Fly, Vercel, Render — localhost/ngrok-free
domains may be rejected; private/internal hosts are blocked server-side).

### 1. Send a card into the conversation

Cards are **handle-targeted, not chat-targeted**. `POST /v3/messages` — NOT
`/v3/chats/{id}/messages` (that returns error 1005: "send an action to a handle").

```bash
curl -X POST https://api.linqapp.com/api/partner/v3/messages \
  -H "Authorization: Bearer $LINQ_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "to": ["+1XXXXXXXXXX"],
    "message": { "action": {
      "experience": "link", "action": "open",
      "params": {
        "url": "https://your-app.fly.dev/exp?s=SESSION_ID",
        "title": "Card title", "subtitle": "Card subtitle", "button": "Open"
      }}}}'
```

- `202` = sent. The response includes the `chat_id` — **save it**, you need it to text back.
- Put a random `?s=<session-id>` in the URL so callbacks map to this send.
- Title/subtitle/button optional (server defaults fill in). The card URL is HMAC-signed
  server-side; recipients can't tamper with the payload.

**Gotchas that will burn you:**
- **The first message in a brand-new chat cannot contain an action** (error 1005).
  If you've never messaged this person: `POST /v3/chats` with a plain-text opener first
  (`{"from": "+1YOU", "to": ["+1THEM"], "message": {"parts": [{"type":"text","value":"Hi"}]}}`),
  then send the card. If a chat already exists, skip this — `/v3/messages` reuses it.
- **Shared-line rule (hackathon sandbox):** the recipient must text your Linq number
  once before you can send them anything. Have them text "hi" first.

### 2. Host a page that reports actions

Any page works. Report every meaningful action with `sendBeacon` (fires reliably even
during page close), and catch abandonment with `pagehide`:

```html
<script>
const S = new URLSearchParams(location.search).get('s');
function ping(ev){ navigator.sendBeacon('/exp/event', JSON.stringify({s:S, ev:ev})); }
ping('opened');
// call ping('chose:option-b'), ping('finish:2/3'), etc. on each user action
window.addEventListener('pagehide', ()=> ping('closed'));
</script>
```

### 3. Receive events, text the conversation when it ends

```python
@app.route("/exp/event", methods=["POST"])
def exp_event():
    d = request.get_json(force=True)
    sessions.setdefault(d["s"], []).append(d["ev"])
    if d["ev"].startswith(("finish", "closed")) and d["s"] not in notified:
        notified.add(d["s"])          # notify ONCE per session
        summary = summarize(sessions[d["s"]])   # what did they do?
        requests.post(f"https://api.linqapp.com/api/partner/v3/chats/{CHAT_ID}/messages",
            headers={"Authorization": f"Bearer {TOKEN}"},
            json={"message": {"parts": [{"type": "text", "value": summary}]}})
    return {"ok": True}
```

Replies into an existing chat use `POST /v3/chats/{chat_id}/messages` with
`{"message": {"parts": [{"type":"text","value": "..."}]}}` (plain text is chat-targeted;
only *actions* are handle-targeted).

### Bonus polish (all verified against production)

- **Typing indicator while your agent thinks:** `POST /v3/chats/{id}/typing` (start),
  `DELETE` same path (stop). Fire it *before* your LLM call, in parallel.
- **Read receipts:** `POST /v3/chats/{id}/read`.
- **Inbound messages** (user texts your number): `linq webhooks create --url
  https://your-app/webhook --events message.received`. Payload shape: message fields
  are flat on `data` with the chat nested — chat id lives at `data.chat.id`, message id
  at `data.id`, sender direction at `data.direction` (`inbound`/`outbound`). Re-fetch
  the message via `GET /v3/chats/{id}/messages` before acting on webhook content.
- **Effects:** add `"effect": "confetti"` to a message for iMessage screen effects.

### Debug checklist

| Symptom | Cause |
|---|---|
| 1005 "at least one message part is required" | wrong body shape — text goes in `message.parts`, actions in `message.action` |
| 1005 "send an action to a handle" | you POSTed an action to `/v3/chats/{id}/messages` — use `/v3/messages` |
| 1005 on first message | new chats can't open with an action — send a text opener first |
| Card sends but recipient gets nothing | shared-line inbound-first — they must text your number once |
| Webhook silent | check payload parsing (`data.chat.id`, not `data.chat_id`) and that your endpoint 200s fast |

Reference: [linq-team/synapse PR #2218](https://github.com/linq-team/synapse/pull/2218)
(SDUI walkthrough + `send-link-card.sh`), CLI docs via `linq --help`, REST docs at
https://apidocs.linqapp.com.
