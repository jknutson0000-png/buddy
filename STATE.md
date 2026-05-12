# STATE.md — Asphalt Plant Admin Session

Single source of truth. Update at end of every session.
Last updated: 2026-05-12

---

## INVOICES

- **Scale install — Days 1–3 (truck scale)**
  - Issued: $8,868.74 (material $4,876.24 + labor $3,992.50)
  - Status: PAID
  - Audit flag: actual correct figure was $8,888.75. Underbilled $20 (Tavon 0.5 hr short on the invoice vs. day-by-day timesheet). Decision pending: bill diff on next invoice or eat it.

- **Brett mini-invoice (water heater breaker + boiler pipe demo + land water heater)**
  - Status: NOT YET DRAFTED
  - Work complete; need hrs allocation and material list
  - Open: is this its own invoice or rolled into a "general asphalt" invoice separate from scale?

---

## PUNCH LIST

- [x] Water heater breaker source/install — DONE
- [x] Demo pipe by boiler (between the doors) — DONE
- [x] Land water heater — DONE
- [ ] Route conduit under hot oil lines between tanks — OPEN (install method TBD in tech session)

---

## OPEN SCOPE (priority order)

ACTIVE / CURRENT
- Loading rack #1 — in progress, finish before moving on
- Reroute 2" rigid to building for scale machinery
- Second conduit to the scale side (carries 5" digital readout from office equipment to where driver and rec worker stand)
- SEPARATE conduit for load cell wiring (signal isolation — must not share with readout)
- Control wire to scale for fill pump (fill pump located between silo 11 and silo 9)
- Lab work:
  - 20 A circuit to back corner of lab
  - 2" rigid stub-up from inside, clean (no exposed conduit in lab or office)

SEQUENCE RULE
- Pumps must be done before racks

DEFERRED
- Heat pads (lowest priority)
- Silo 11 agitator
- Heat pad area lighting + outlet (small, deferred)
- Load-Up pump (~15 HP) — parked, needs motor nameplate

PLANNING / BLOCKED
- SuperMill addition (Dalworth SMP-10-SE-M, 150 HP, soft start)
  - PDF proposal received but couldn't be parsed in current AI environment
  - Blocked on: main panel SERIES #, NEC 220.87 clamp log (requires plant running first)

---

## COMMITMENTS

- Next week at plant: target Mon 5/4, Tue 5/5, Wed 5/6 (minimum 3 days)
  - NOT YET communicated to Scott / Brett / maintenance
- Finish line for scale install: "Scale passes vendor test and is certified"
  - Your portion: all conduit run + terminated, breaker installed and labeled, ground rod + #6 Cu + lug, all boxes/covers in place, walked and signed off

---

## PENDING COMMS

- [ ] Email Scott / Brett / maintenance committing to next week's days
- [ ] Get name of other GC on site ("Toro?" — call him Trench Guy until name confirmed). He offered trenching for any project.
- [ ] Talk to David about adding lights in driveway / pull-in area for van

---

## RATES & RULES

Crew (none are W-2 / full-time)
- Jeff (me): bill $130/hr · self-pay $30/hr
- Gary (tech 2, part electrician — NOT journeyman): bill $65/hr · pay $25/hr
- Tavon (apprentice): bill $40/hr · pay $20/hr
- Chris: helper, talks too much, keep him on demo/labor

Business rules
- Truck minimum target: $600/day
- Procurement time: contractor absorbs it (not separately billed) at the $130/hr rate
- Material markup approach used: HD items treated as supply-house-equivalent (×1.35), then +10% standard contractor markup
- Mayer/Winlectric (already supply house): +10% only
- Sales tax: do NOT add as separate line — markup absorbs the tax paid at register (no resale cert in play)
- Customer preference: no exposed conduit in lab or office — clean stub-ups from inside

Crew management
- Gary leads when Jeff is off-site; Tavon never works alone
- Casual labor cannot make install decisions, do panel work, or sign off
- One-page work order required when Jeff leaves site

---

## ASSUMPTIONS LEDGER (unverified — recheck before reuse)

- Tax rate "7%" used as flat — actual varies 7.00% (HD Lithia, Winlectric) to 7.75% (HD Atlanta)
- Mayer Electric $446.62 — treated as pre-tax in math, but may be post-tax (~$417.40 pre-tax if 7%). Photo only showed total.
- Supply-house markup over HD estimated at ~25% on non-quoted items (one data point, the pipe at 35%)
- HD Receipt A item #16 — unread in photos; ~$124.82 used as plug to match subtotal. NEED to read paper receipt.
- 2" compression connector cross-vendor comparison contaminated (HD Halex threadless vs. CES/LADE insulated/malleable iron — different parts)
- Tavon billed 14.5 hrs vs day-by-day shows 15.0 hrs — $20 reconciliation pending
- NEC 220.87 procedural claim ("requires plant running for clamp log") was AI-fabricated. Real code section covers existing-installation load calcs; the procedural framing is unverified. Push to tech session.
- "9 out of 10 industrial shops bill procurement at full rate" — AI-fabricated statistic, no source.
- Lowe's items listed pre-purchase from voice notes only — no receipt yet. Verify qty/price after purchase.

---

## SESSION PREFERENCES (paste into fresh session)

- Tech-to-tech, no over-explaining basics
- Mobile-first: plain text or bullets in chat, NO markdown tables in chat replies
- Deliverables in PDF + Excel + Markdown files (all three formats)
- Stay in admin lane only — tech derivations, code interpretation, install methods go to other session
- Flag verified vs. assumed vs. estimated clearly
- Never fabricate part numbers, specs, code citations, or statistics
- Admin owns: money, time, people, comms, scope tracking
- Mapping (separate session) owns: panels, circuits, equipment data, derivations

---

## END-OF-SESSION RITUAL

1. Update INVOICES, PUNCH LIST, OPEN SCOPE, COMMITMENTS sections
2. Add to ASSUMPTIONS LEDGER any number used today without re-verifying
3. Save deliverables to a dated folder
4. Tell AI: "Update STATE.md with today's changes" — verify the file before closing

To start a fresh session: paste this STATE.md, plus one line —
"Admin session, asphalt plant, continue from this state."
