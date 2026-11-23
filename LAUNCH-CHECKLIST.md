# Client Launch Checklist

Use this before a lead system handles real customers. The demo already includes the items marked **Built**.

## Protection

- [x] **Built:** server validation on every lead
- [x] **Built:** Cloudflare Turnstile verified on the server
- [x] **Built:** limits per visitor, phone number and day
- [x] **Built:** exact-repeat blocking that never discards a different request
- [x] **Built:** secrets kept in server variables
- [x] **Built:** separate secrets for the chat and voice agents
- [x] **Built:** browser security headers
- [ ] Create new keys and webhook URLs for this client. Never reuse the demo's.
- [ ] Require a secret key on each Make webhook.
- [ ] Set usage alerts in Make, Botpress, ElevenLabs and the SMS provider.
- [ ] Test fake tokens, spam, bad data and prompt injection on the client's live system.

## Legal and consent

- [ ] Publish a privacy policy that matches the data collected.
- [ ] Complete SMS registration, such as A2P 10DLC in the US.
- [ ] Only text people who opted in.
- [ ] Connect STOP replies so opted-out people stay opted out, even if they submit again.
- [ ] Disclose that callers and chat visitors are talking to an AI.
- [ ] Check call-recording consent rules for the client's state.

## Accounts and handoff

- [ ] Put every tool in an account the client owns.
- [ ] Turn on two-factor sign-in.
- [ ] Give each team member only the access they need.
- [ ] Document who to contact, and how to pause the automations, if something goes wrong.

## Daily team habit

- [ ] Review new leads each morning.
- [ ] Search the phone number before calling, to spot repeat requests.
- [ ] Move bad or duplicate requests to **Lost** instead of deleting them.
- [ ] Merge duplicate contacts when one customer appears twice.

## Go live

- [ ] Remove `noindex`, demo labels, sample reviews and placeholder claims.
- [ ] Replace the domain in `ORIGIN`, `HOSTNAME`, canonical links, the sitemap and `llms.txt`.
- [ ] Add the real domain to Turnstile.
- [ ] Submit one real test through the form, chat, phone and missed-call flow.
