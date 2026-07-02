# STATE.md — Asphalt Plant Admin Session

Single source of truth. Update at end of every session.
Last updated: 2026-06-26

---

## CUSTOMER

- Company: **Asphalt Paving Systems** (recently sold to new owner; everyone staying on, nothing changing operationally)
- Contact: David Abrams — dabrams@asphaltpavingsystems.com — (813) 997-8401
- Job site: 8000 Huey Rd, Douglasville GA area
- New owner wants a rough estimate for total plant completion (delivered — see estimates/)

---

## INVOICES

Billed/paid to date (asphalt plant):
- #61 — Apr 7-10 — Heat pad testing/repair — $1,510 (paid)
- #72 — Apr 22-24 — Initial scale conduit, 200 ft, deposit applied — $7,538.74 (paid)
- #74 — Apr 27-28 — Scale continued, demo, layout — $1,922.50 (paid)
- #78 — May 4-8 — Scale pair run + 80 ft + load pump start — $4,925.79 (paid)
- #88 — May 13-16 — Scale reroute, load pump, gable fan — $3,648.94 (paid)
- Week of 5/18-22 — Lead/TechII/TechIII/Apprentice — $4,185.56 (paid)
- Week of 5/26 — (draft only, finalized invoice not on file)
- **Week of 6/22-26 — SUBMITTED — $2,501.25 labor + material (2x 8x8x4 boxes + 25 ft 12-2 AC cable)**

---

## CREW & RATES

Billing rates (what customer pays):
- Lead Tech (Jeffrey): $110/hr  (was $130, dropped to $115, then $110 as courtesy)
- Tech II: $60-65/hr
- Tech III: $52.50/hr
- Apprentice: $40/hr

Pay rates (what they get paid):
- Jeffrey (self): $30/hr
- Dylan Randall: $24/hr — bills as Tech III ($52.50)
- Tavon Wright: $21.50/hr — bills as Apprentice ($40)
- AJ: $21/hr — bills as Apprentice ($40)
- Josh: $21/hr — billed Tech 3 ($52.50) — ONE-TIME, moved to another job
- Chris McIntyre: bills as Tech II ($60)

Rules:
- Truck minimum target: $600/day
- Procurement time: Jeffrey absorbs it (not billed)
- Monday 6/22 billed at 7 hrs max for everybody
- Hours round down to nearest quarter hour
- No sales tax line on invoices (markup absorbs tax paid at register)
- Gary leads when Jeffrey off-site; apprentices never work alone; casual labor can't make install decisions or do panel work

---

## SCALE INSTALL — CONFIRMED DETAILS

Vendor: **FAIRBANKS SCALES**
- Indicator: FB7100 Series touch screen (inside the lab — moved from office, cost 45 ft rigid removed)
- Remote display: 1605T w/ integrated traffic light (5" digits, 120 VAC, outside at scale)
- System: Intalogix (Smart Sectional Controllers + Pit Power Supply)
- Load cells: Minebea Intec PR 6221 columns
- Contact: **Lon, Fairbanks — (470) 261-7651** — CALL first, text if no answer (cell, spotty in N. GA)

Conduit plan (CONFIRMED w/ Lon):
- Two 2" rigid runs from scale area toward office/lab
- Both land in 8x8x4 boxes inside the lab (Jeffrey installed TWO boxes)
- **Conduit 1 = load cell home run + comm (FAIRBANKS pulls)**
- **Conduit 2 = dedicated 20A 120V power (JEFFREY pulls, pre-pull before Fairbanks arrives)**
- ONE 20A circuit total: feeds indicator outlet inside, then extends out one conduit to scale to power the 1605T display + Intalogix Pit Power Supply
- Fairbanks mounts their power supply/transformer in the inside box — needs access
- Data + power can share the BOX, never the same conduit
- Outside conduit entry: ~1 ft off ground (site slopes/drains toward that area)
- Control wire previously used = 16 AWG

Still open on scale: finish runs to scale (waiting on RACK install by pipefitters), pull 20A power, ground rod + #6 + lug, 20A breaker, hot oil line crossing (method TBD), final terminations, coordinate Fairbanks wire-pull + cert. Lab outlets rolled into scale scope.

Fairbanks NOT the holdup — they're waiting on the plant to call them back. Jeffrey waiting on rack.

---

## PANEL / MAPPING DATA — LIVES ON THE MAPPING BRANCH

Full panel schedules, equipment list, plant layouts, and unknowns list are on
repo branch **claude/asphalt-plant-electrical-map-JqaW7** under `asphalt-plant/`
(MDP-1 schedule in panels/MDP-1/, 26-item unknowns list, layouts, equipment).
CHECK THAT BRANCH before asking for panel data — do not re-request from user.

Key cross-references (from MDP-1 schedule):
- Pos 3 — Tank 11 Agitator — 40A (matches field check 7/1)
- Pos 13 — Rack 1 Load Pump — 70A (likely the loading pump feed)
- Pos 22 — Unloading Pump 1 (P1) — 60A frame — was "removed," returning to
  ACTIVE for new unload pump (feeds the Size 2 starter, 25HP max)
- Pos 1 — SP-1 & SP-2 — HJA36150 150A (also noted as transformer primary in
  old handoff — RECONCILE: schedule says SP-1/SP-2)
- MDP-1 3-wire vs 4-wire (neutral bar) still unverified

---

## EQUIPMENT CONFIRMED

- Big Mill: **300 HP / 300 amp** (corrected from earlier 150 HP), soft-started, hangs on 480V main. ~$13k material per proposal (unverified — PDF unreadable in admin session).
- Skid: **30 HP / 30 amp** (part of mill assembly, the smaller one)
- Unload pump: AC pump #2 — Allis-Chalmers 25 HP, 31.5A @ 440V, OR Worldwide 20 HP 25.8A @ 460V (TWO candidate motors, owner hasn't picked which goes in the empty position). Square D Size 2 starter 8536SDG1H20S, 480V coil, Motor Logic overload.
- Loading pump: partially done (J-box set, control wire pulled, 1" started)
- Silo/Tank 11 agitator: FULLY DOCUMENTED (photos 7/1) — Baldor CEM2333T, 15 HP, 230/460V, 37/18.5A, 1765 RPM, 254TC, SF 1.15, TEFC + Falk Ultramite 09UCFN2A20A8E gearbox (4.5:1) + EXISTING TECO N3-415-C VFD (15HP/11kW, 380-480V, 31A, IP20/NEMA1). If TECO drive is functional, no new VFD needed — estimate line 8 has cushion (budgeted $4k for a drive; 15HP replacement is ~$1.1-2.8k if needed).
- Heat pads: CONFIRMED 208V (per Jeffrey — stop re-asking). Watlow EZ-ZONE ST controllers scope stands.
- Unload pump: NOT INSTALLED YET — no route to trace until it's set. Parked until equipment lands.

---

## ROUGH ESTIMATE — DELIVERED (see estimates/asphalt_plant_buildout_estimate.md)

T&M, per-project, no markup shown to customer. Total **~$73,200**:
1. Scale finish-out — $6,565
2. Load pump — $3,095
3. Unload pump — $9,465
4. Rack controls — $6,740
5. Big Mill (300A) — $22,730
6. Skid (30A) — $6,075
7. Heat pad + controls — $6,620
8. Agitator + VFD — $11,900

Built from real invoice burn + 20% labor contingency + 15% material markup
(applied to ALL material) + verified 2026 material pricing.
Punch list line removed — day estimates carry the cushion (often only billing
7 hrs/day against 8-hr estimate days).

---

## WORK LOG — for invoice Thu/Fri (Fri may be holiday)

- MONDAY: connected the scale J-boxes (tight working on an aisle/lift). Both 2" rigid runs now INTO the building and connected — ready for Fairbanks to hook up.
- TODAY: installed 2 ground rods, protected with Sch 40 PVC, landed at the disconnects. Installed pull string in both conduit runs as far as possible (rack not in yet).
- TODAY: ran the dedicated 20A from the pull box/tray above the panel as far as possible — waiting on the rack before it can continue to the scale. Also ran fish tape/pull line through multiple additional pipes to set up for future pulls.
- STILL PENDING: land into the scale J-box on a ground bar (MC down into wall → back of J-box; grounds + EGC from rigid all land on a bonded ground bar per NEC 250.148).

## PENDING MATERIAL TO BILL (not yet invoiced)

- HD Order WK30706426 — job "asphalt" — ordered 6/30/2026 — **$212.27** ($198.38 + $13.89 tax)
  - Pump grounding + penetration sealing: 1/2" PVC conduit + adapters + elbows + offsets + LB, (1) 25ft #6 bare copper $32.00, (3) 5/8" bronze rod clamps $13.05, Dynaflex exterior sealant, Gaps & Cracks foam, spackle/putty knife/wipes
  - NOTE: the (3) copper-clad ground rods ($87.03) on this order were OUT OF STOCK — Jeffrey bought GALVANIZED rods at an electric supply for ~$70 instead. Reconcile: subtract the $87.03 HD rod line if not fulfilled, add the ~$70 electric-supply rod purchase.
  - Apply standard 15% material markup when billed
- Electric supply — galvanized ground rods (+ misc) — ~$70 — replaces the out-of-stock HD copper-clad rods

---

## OPEN DECISIONS / TODO

- RESOLVED: material markup — 15% applied to ALL material across all jobs
- VERIFY: Big Mill $13k material (get live supply-house quote on 350 kcmil + 400A disconnect)
- VERIFY: agitator HP off nameplate before VFD order
- VERIFY: heat pad feed voltage (208 vs 480) — affects controller/contactor selection
- DECIDE: which motor goes in the unload pump position (Allis-Chalmers 25HP vs Worldwide 20HP)
- $20 Tavon underbill from earlier invoice — bill on next or eat (still unresolved)
- Pre-pull 20A power through scale conduit before Fairbanks arrives
- Touch-up paint around inside boxes (hole saw walked) — David notified

---

## OTHER ADMIN / FOLLOW-UPS

- David: lights in driveway / pull-in area for van (deferred)
- Other GC on site ("Trench Guy" — get name): offered free trenching for any project
- Storage inventory system: prompt saved in prompts/INVENTORY_PROMPT.md (run in separate session)
- Equipment mapping: separate session to be spun up (handoff drafted earlier)
- All misc/area lighting: DEFERRED, not in estimate
- Heat pad punch list (water heater breaker, boiler pipe demo, land water heater): DONE — was billed

---

## ASSUMPTIONS LEDGER (unverified — recheck before reuse)

- Big Mill $13k material is Jeffrey's number — PDF proposal unreadable in admin session, never independently verified
- Agitator VFD sized at 20 HP assumption — confirm actual motor FLA off nameplate
- Heat pad feed voltage assumed 208V (2-pole) — never verified at the Hoffman (208 vs 480)
- Unload pump motor not yet selected (two candidates) — affects disconnect/wire sizing
- Estimate day counts are gut calls at 8-hr days; real crew days run ~7-7.5 hr (built-in cushion)

---

## SESSION PREFERENCES

- Tech-to-tech, no over-explaining, mobile-friendly plain text, NO markdown tables in chat
- Stay in admin lane — tech derivations/code/install methods go to other session
- Flag verified vs assumed vs estimated
- Never fabricate part numbers, specs, code citations, prices, or statistics
- Deliverable files: PDF + Excel + Markdown when generating schedules/lists

---

## END-OF-SESSION RITUAL

1. Update INVOICES, ESTIMATE, OPEN DECISIONS, EQUIPMENT sections
2. Add any number used without re-verifying to the assumptions ledger
3. Tell AI "update STATE.md" and verify before closing
4. To resume: paste STATE.md + "Admin session, asphalt plant, continue from this state."
