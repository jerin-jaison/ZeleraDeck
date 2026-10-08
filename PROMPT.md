# Award-Style Interactive Portfolio — Build Prompt

Copy everything below into an AI coding assistant (Claude, etc.) and fill in the
`[BRACKETED]` placeholders with your own details. It produces a single-file,
animation-heavy dark portfolio in the style of premium agency sites.

---

## ROLE

Act as an expert creative developer and motion designer. Build a **premium,
award-style personal portfolio website** as a **single self-contained
`index.html`** (all CSS in one `<style>`, all JS in `<script>` tags, no build
step). It must run by opening the file / serving the folder. Prioritise
interaction quality, motion fidelity, typography, and responsiveness.

## TECH STACK (load from CDN, initialise cleanly)

- **GSAP 3.12 + ScrollTrigger** — all scroll-driven and timeline animation.
- **Lenis** — smooth momentum scrolling; sync `ScrollTrigger.update` to Lenis on
  its `scroll` event, and drive `lenis.raf` from the GSAP ticker with
  `gsap.ticker.lagSmoothing(0)`.
- **Three.js (module build)** — one subtle WebGL background only (hero light
  field). Everything else is DOM + CSS + GSAP so nothing can silently fail.
- Fonts from Google Fonts (see design system).
- No frameworks, no bundler. Vanilla JS in one IIFE.

## DESIGN SYSTEM

**Palette (CSS variables):**
- `--black:#0A0A0A` background · `--text:#F0EFEA` primary · `--muted:#8A8A8A`
  secondary · `--dim:#2E2E2E` inactive list items
- `--accent:#F04A2A` single warm accent (ribbons, dots, hovers)
- A cool **mint→cyan vertical gradient** used only for the italic half of the name
- `--paper:#EFEFEF` — the light contact section
- Hairline borders: `rgba(240,239,234,.14)`

**Typography — two faces, deliberately contrasted:**
- Display roman: a **clean neutral grotesk** (e.g. *Inter Tight*), used for the
  first name and headings.
- Display italic: a **high-contrast editorial Didone italic** (e.g. *Playfair
  Display*, italic, weight ~600) used for the second name and for inline
  emphasis words. This contrast IS the brand.
- Small caps labels use a monospace or tracked uppercase grotesk.

**Layout:** centred max-width container (~1560px) with a fluid gutter
`clamp(1.25rem, 3.5vw, 3.5rem)`. Generous vertical rhythm between bands.

## GLOBAL PERSISTENT UI

- **Frame counter** fixed at the left-middle: `(00)` → `(99)` incrementing with
  total scroll progress. Use `mix-blend-mode:difference` so it reads on any bg.
- **Segmented scroll rail** fixed at the right-middle: one hairline tick per
  section, the current one highlighted, plus a small live label naming the
  current section ("Intro", "Work", "Gallery"…). Hide the rail below tablet.
- Both fade out over the footer so they don't collide with it.
- Respect `prefers-reduced-motion`: disable transforms/loops, reveal all text.

---

## SECTIONS & EFFECTS (in order)

### 1. HERO — the signature moment
Full-viewport. Content:
- Top-left: a two-line note pairing roman + inline italic, e.g.
  `[SHORT TAGLINE], [italic: what you do], through [tools/method].`
- Centre stage: the name as **`[FIRST NAME]` in the grotesk + `[LAST NAME].` in
  the mint-gradient Didone italic**, one line, edge-to-edge, huge.
- Bottom hairline bar: `→ V1.0` left · social links centred · page links right.
- Background: a **WebGL "light field"** — a soft, drifting, blurred volumetric
  glow (warm core, cooler edges) rendered in a fragment shader; falls to black
  toward one corner; reacts gently to the mouse. Provide a CSS radial-gradient
  fallback underneath so it's never blank if WebGL fails.

**Hero scroll choreography (pin the section, scrub to scroll):**
1. On load the name sits at the **bottom**, just above the bar, centre empty.
2. As you scroll, the name **rises to the vertical centre**.
3. Once centred, a **slight separation**: first name eases left, last name eases
   right, opening a clean gap in the middle.
4. Then a small **box materialises in the gap and zooms to full screen** (a
   grayscale, high-contrast image that fills the viewport), with a centred
   italic caption and `+` crop-marks in the four corners.
5. Continuing, the box **rotates and drifts away** as the page moves on.
> IMPORTANT: make the zoom target a **full-viewport element scaled DOWN to a tiny
> box at rest and UP to ~1 when it fills the screen**, backed by a ≥2000px
> source image. (Do NOT scale a tiny 50px box up ~30× — its texture pixelates.)

### 2. NUMBERS / LEDGER (optional)
A thin row of key stats measured against a single striking `0` or hero figure,
tabular numerals, count-up on scroll into view.
Placeholders: `[STAT] [LABEL]` × 4–6.

### 3. ABOUT
Two columns: a large statement mixing roman + italic emphasis on the left,
a portrait on the right in a **squircle (continuous-corner) mask** with a
coloured wash. Reveal the statement with a **blur-word effect** (see below).
Placeholders: `[ABOUT STATEMENT]`, `[EDUCATION / SHORT BIO ROWS]`.

### 4. WORK / PROJECTS
- Left: a **stacked list of project names**. Only the focused one is `--text`
  white; the rest sit at `--dim` (nearly invisible). Focus follows scroll and
  hover.
- Right: a **sticky preview panel** showing the focused project's image, with a
  `[NN] [YEAR]` / `PREVIEW` label. The preview **skews on `rotateY` proportional
  to scroll velocity** (leans while scrolling, settles when you stop).
- Behind everything: a **giant accent-colour ribbon** (an organic SVG S-curve)
  that **travels vertically through the section as you scroll**, passing behind
  the text.
- Clicking a project (or a gallery tile) opens a **full-screen detail overlay**
  that wipes up from the bottom: index/category/date eyebrow, big title (last
  word in the italic face), hero image, a spec table (role / built-with /
  timeline / status), body copy, a "view live" button, and a "next projects"
  row. Close via ✕ or Esc; lock body scroll while open; **guarantee the close
  with a `setTimeout` fallback** in case rAF is paused (tab hidden).
Placeholders per project: `[NAME] [CATEGORY] [YEAR] [DESCRIPTION] [TOOLS]
[LIVE URL] [LONG CASE-STUDY TEXT]`.

### 5. GALLERY — the rolling ring
A tall pinned section. Project images ride a **ring/conveyor around a centred
statement**: images enter from the **left**, arc **over the top**, and exit
**right**, with more images sweeping under the bottom — so the text is
surrounded top, sides and bottom.
- Each card **rolls about its own axis** as it travels: it arrives showing its
  **mirrored back**, turns edge-on (a thin sliver), **unrolls to face you** at
  the centre, then rolls away — using CSS `perspective` + `rotateY`.
- **Bottom cards render larger, top cards smaller** (fake depth via scale, so
  nothing ever leaves the frame). The whole thing is **scroll-scrubbed** —
  scrolling up runs it backwards.
- The centred statement (with italic emphasis words) is **width-constrained and
  wraps to ~3 lines inside the ring**, revealed with the blur-word effect over a
  tight window when the section pins.
- Build this with **DOM `<img>` tiles moved by GSAP transforms** (reliable), NOT
  WebGL. Reduce tile count on small screens.
Placeholder: `[GALLERY STATEMENT]`, project images.

### 6. SKILLS
Two columns. Left: a small label, a **bold condensed uppercase statement**, a
"contact me" link, and a **large accent-colour arrow that travels right as you
scroll** (scroll-scrubbed). Right: an **accordion** — each row a category with a
`+` that rotates to `−` and expands to reveal the skill items; opening one closes
the others.
Placeholders: `[SKILL CATEGORY]` → `[ITEMS…]` × 5–7.

### 7. AWARDS / MISC (optional)
A multi-column table. The **focused row inverts to a solid light block with dark
text**; the others sit muted. The white block tracks down the table on scroll
and on hover.
Placeholders: `[COLUMN A] [COLUMN B] [STATUS] [DATE]` per row.

### 8. CONTACT — the light flip
On scroll into view, a **circle expands from the bottom of the viewport and
swallows the screen**, flipping the page from black to light `#EFEFEF`
(`clip-path: circle(... at 50% 100%)`, scrubbed). Then: a massive dark
`Contact` heading, a small **justified** paragraph with italic emphasis, social
links, an email link with an underline hover, and a duotone image with `+` crop
marks. Toggle the counter/rail to dark-on-light while this section is active.
Placeholders: `[CONTACT BLURB] [EMAIL] [SOCIAL LINKS]`.

### 9. FOOTER
Back to black. Three tidy columns (email/©, socials, page links), then the full
name at **enormous scale flush against the bottom edge** (roman + italic, accent
"." dot), with a **faint halftone dot pattern** behind it. **On hover, the dots
near the cursor glow like lit pixels** (a brighter dot layer masked to a circle
that follows the pointer; throttle with rAF; skip on touch).

---

## REUSABLE EFFECTS (define once, apply throughout)

- **Blur-word reveal:** split target text into word `<span>`s; start each at low
  opacity + `blur(8px)`; on scroll (scrubbed, staggered) animate to full opacity
  + `blur(0)`. For very tall/pinned sections, give the reveal a **tight window**
  (~65vh) that starts when the section pins, or it spreads too thin to notice.
- **Scroll-scrubbed travel:** ribbon, skills arrow, contact circle, gallery roll
  and hero timeline all bind to scroll **position** (`scrub`), not time — so they
  play forward on scroll-down and reverse on scroll-up.
- **Magnetic links:** interactive links ease toward the cursor with
  `gsap.quickTo`; disable on touch.
- **Image fallback:** every remote image has an `onerror` that swaps to a
  generated placeholder, so a rate-limited/broken image never shows blank.

## RESPONSIVE (mandatory)

Breakpoints at ~1280 / 1024 / 900 / 600 / 400. Collapse two-column layouts to
one; stack the name on mobile; shrink and thin out the gallery ring; hide the
side rail on tablet and below; keep all headings fluid with `clamp()`; ensure
nothing overflows at 320px. Reveal captions without hover on `hover:none`.

## QUALITY BAR

- 60fps feel: animate transforms/opacity, use `will-change` sparingly, throttle
  pointer handlers with rAF, keep the WebGL cheap and pause it off-screen.
- Zero layout shift; visible keyboard focus; `aria` on the nav, dialog and
  accordion; honour `prefers-reduced-motion`.
- No console errors. Deploys as a static site (GitHub Pages / Vercel / Netlify).

## OUTPUT

Deliver the complete, production-ready single `index.html`. Use tasteful
placeholder text and free stock/gradient images where I haven't given content,
and clearly mark every spot I should replace with my own copy, images and links.

---

## FILL-IN CHECKLIST (your details go here)

```
[FIRST NAME] / [LAST NAME]
[ROLE / TITLE]
[SHORT TAGLINE + what you do + how]
[ABOUT STATEMENT + short bio / education]
[3–8 PROJECTS: name, category, year, description, tools, live URL, case study]
[GALLERY STATEMENT]
[5–7 SKILL CATEGORIES + items]
[KEY STATS / NUMBERS]
[AWARDS / MISC rows]  (optional)
[EMAIL] · [SOCIAL LINKS] · [LOCATION]
[HERO ZOOM IMAGE + PROJECT IMAGES]  (use your own; ≥2000px for the hero)
```
