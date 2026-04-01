---
name: scroll-stop-builder
description: >
  Takes a video file and builds a scroll-driven animation website where video playback is controlled
  by scroll position — creating an Apple-style scroll-stopping effect. Uses frame extraction via FFmpeg,
  canvas-based rendering, and modern scroll-driven animation techniques. Integrates with ui-ux-pro-max
  for data-driven design decisions (palettes, typography, styles). Includes: animated starscape background,
  annotation cards with snap-stop scroll, specs section with count-up animations, navbar with scroll-to-pill
  transform, loader, and full mobile responsiveness with accessibility support.
  Trigger when the user says "scroll-stop build", "scroll animation website", "scroll-driven video",
  "build the scroll-stop site", or provides a video file and asks to make it scroll-controlled.
  Also trigger if the user mentions "Apple-style scroll animation" or "video on scroll".
---

# Scroll-Stop Builder

You take a video file and build a production-quality website where video playback is controlled
by scroll position — creating a dramatic, Apple-style scroll-stopping effect.

Before building anything, you MUST gather information from the user through a brief interview.
Do not assume any brand names, colors, or content — everything is customized per project.

---

## Step 0: The Interview (MANDATORY)

Before touching any code or extracting any frames, ask the user these questions in a natural,
conversational way — not as a numbered interrogation:

### Required Questions

1. **Brand name** — "What's the brand or product name for this site?"
2. **Logo** — "Do you have a logo file I can use? (SVG or PNG preferred)"
3. **Overall vibe** — "What's the overall feel you're going for? (e.g., premium tech launch, luxury, playful, minimal, bold)"

### Content Sourcing

Ask the user how they want to provide the website content:

- **Option A: Based on an existing website** — "Is this based on an existing website? If so, share the URL and I'll pull the real content (product name, features, specs, copy) to populate the site."
- **Option B: Paste it in** — "If you don't have a website, you can paste in the content you'd like — product descriptions, feature lists, specs, testimonials, etc."

If the user provides a URL, use `WebFetch` to retrieve the page content and extract relevant
copy, product details, feature descriptions, spec numbers, and any other usable content.

---

## Step 1: Generate Design System via ui-ux-pro-max (REQUIRED)

After the interview, use the user's product type and vibe to generate a design system. **Do not
hardcode colors or fonts** — always derive them from ui-ux-pro-max's data.

```bash
python3 ".claude/skills/ui-ux-pro-max/scripts/search.py" "<product_type> <vibe> <industry>" --design-system -p "<Brand Name>"
```

This returns: color palette, typography, style, pattern, effects, and anti-patterns — all
data-driven from 96 palettes, 67 styles, and 57 font pairings.

**Then supplement with scroll-specific data:**

```bash
python3 ".claude/skills/ui-ux-pro-max/scripts/search.py" "<vibe>" --domain scroll-effects
python3 ".claude/skills/ui-ux-pro-max/scripts/search.py" "<vibe>" --domain scroll-sections
python3 ".claude/skills/ui-ux-pro-max/scripts/search.py" "<vibe>" --domain scroll-presets
```

The user can override any recommendation. Present the design system and ask for confirmation
before proceeding.

### Design System Construction

From the ui-ux-pro-max results, construct:

- **Fonts**: From `typography` domain (heading + body pair with Google Fonts URL)
- **Accent color**: From `color` domain (use CTA hex as accent)
- **Background color**: From `color` domain (use Background hex)
- **Text colors**: From `color` domain (use Text hex + derive muted from secondary)
- **Selection**: Accent color background with contrasting text
- **Scrollbar**: Dark track with gradient thumb using accent color, glow on hover
- **Cards**: Glass-morphism — semi-transparent bg, subtle border, `backdrop-filter: blur(20px)`, `border-radius: 20px`
- **Buttons**: Primary = accent color bg with contrasting text + accent glow; Secondary = transparent with border
- **Effects**: From `scroll-presets` domain — floating bg orbs (accent tones, blurred), subtle grid overlay, animated starscape
- **Animation timing**: From `scroll-presets` domain — scroll height, hold duration, card transition speed, easing
- **Brand name & logo**: Used in navbar, footer, loader, and anywhere branding appears

---

## Step 2: Analyze the Video

### Prerequisites

- **FFmpeg** must be installed (`brew install ffmpeg` if not)
- The user provides a video file (MP4, MOV, WebM, etc.)
- The video should be relatively short (3-10 seconds is ideal)
- **The first frame of the video MUST be on a white background.** If the user's video doesn't start this way, let them know and ask for a re-export or a separate white-background hero image.

### Analyze

```bash
ffprobe -v quiet -print_format json -show_streams -show_format "{VIDEO_PATH}"
```

Extract duration, fps, resolution, total frame count. Target 60-150 frames total.

---

## Step 3: Extract Frames

```bash
mkdir -p "{OUTPUT_DIR}/frames"
ffmpeg -i "{VIDEO_PATH}" -vf "fps={TARGET_FPS},scale=1920:-2" -q:v 2 "{OUTPUT_DIR}/frames/frame_%04d.jpg"
```

Use `-q:v 2` for high quality JPEG. Use JPEG not PNG for smaller files.

---

## Step 4: Build the Website

Create a single HTML file with all styles inline. The site has these sections (top to bottom):

1. **Starscape** — Fixed canvas behind everything with twinkling animated stars
2. **Loader** — Full-screen with brand logo, "Loading" text, accent-colored progress bar
3. **Scroll Progress Bar** — Fixed top, accent gradient, 3px tall
4. **Navbar** — Brand logo + name, transforms from full-width to centered pill on scroll
5. **Hero** — Title, subtitle, CTA buttons, scroll hint, background orbs + grid
6. **Scroll Animation** — Sticky canvas with frame sequence, annotation cards with snap-stop
7. **Specs** — Four stat numbers with count-up animation on scroll
8. **Features** — Glass-morphism cards in a grid
9. **CTA** — Call to action section
10. **Footer** — Brand name and links

For full implementation details of each section, read the reference files in `references/`.

### Key Implementation Patterns

Read these reference files for detailed code and guidance:

| Reference File | What It Covers |
|---|---|
| `references/canvas-rendering.md` | Canvas setup, Retina support, cover-fit vs contain-fit, frame drawing |
| `references/snap-stop-scroll.md` | Annotation card snap-stop behavior, freeze/release, data attributes |
| `references/starscape.md` | Animated starscape canvas, star drift/twinkle, performance |
| `references/navbar-pill.md` | Navbar scroll-to-pill transform, glass-morphism, mobile |
| `references/count-up.md` | Spec number count-up animation, easeOutExpo, IntersectionObserver |
| `references/loader.md` | Loader with progress bar, frame preloading, fade-out |
| `references/mobile.md` | Mobile adaptation rules, compact cards, reduced scroll height |
| `references/sections-guide.md` | Full section-by-section implementation guide |

---

## Step 5: Customize Content

All content comes from the interview (Step 0). Use the real brand name, real product details,
and real copy — never use placeholder "Lorem ipsum" text. If content came from a website URL,
use the actual text from that site. Adapt:

- Hero title and subtitle
- Annotation card labels, descriptions, and stats
- Spec numbers and labels
- Feature cards
- CTA text

The number of annotation cards is flexible — match it to the content the user provides.

---

## Step 6: Serve & Test

Start a local server and test:

```bash
cd "{OUTPUT_DIR}" && python3 -m http.server 8080
```

Open `http://localhost:8080` and verify scroll behavior works correctly.

---

## Accessibility (REQUIRED)

These are not optional — implement all of them:

### prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  /* Show static middle frame instead of scroll animation */
  /* Disable starscape twinkling */
  /* Disable count-up — show final numbers immediately */
  /* Disable floating orb animation */
  /* Remove all transition delays */
}
```

When `prefers-reduced-motion` is active:
- Replace the scroll-driven canvas with a single static image (the middle frame)
- Disable starscape canvas animation (show static stars)
- Show final spec numbers immediately (no count-up)
- Remove all decorative animations

### Canvas Accessibility

- Add `role="img"` to the scroll animation canvas
- Add `aria-label` describing what the animation shows (e.g., "Product assembly animation controlled by scrolling")
- Provide a visually-hidden text description of the full animation sequence

### Keyboard Navigation

- Annotation cards must be reachable via Tab key
- Each card should have `tabindex="0"` and `role="article"`
- Visible focus rings on all interactive elements (accent color outline)
- Enter/Space on a focused card should scroll to its position

### Screen Reader Support

- `aria-live="polite"` on the annotation card container so cards are announced when they appear
- Skip link at the top: "Skip to main content" that jumps past the scroll animation section
- All images have descriptive `alt` text

### Contrast

- Annotation card text must pass 4.5:1 contrast against the glass-morphism backdrop
- If the background is dark, ensure card backgrounds have sufficient opacity
- Test with both light and dark accent colors

---

## Error Recovery

| Issue | Solution |
|---|---|
| Frames don't load | Check file paths, ensure local server is running (can't load from `file://`) |
| Animation is choppy | Reduce frame count, ensure JPEG not PNG, check file sizes (<100KB each) |
| Canvas is blurry | Ensure `devicePixelRatio` scaling is applied |
| Scroll feels too fast/slow | Adjust `.scroll-animation` height (use scroll-presets data for vibe) |
| Mobile cards overlap content | Use compact single-line card design, position at `bottom: 1.5vh` |
| Snap-stop feels jarring | Reduce HOLD_DURATION to 400ms or increase SNAP_ZONE |
| Stars too bright/dim | Adjust starscape canvas opacity (default 0.6) |
| First frame isn't white | Ask user to re-export video with white opening frame |
| Contrast fails | Increase card background opacity or add a solid bg fallback |

---

## Pre-Delivery Checklist

Before delivering, verify every item:

### Scroll Performance
- [ ] Scroll is smooth — no jank, frames render at 60fps
- [ ] All frames preloaded before scroll unlocks (loader shows progress)
- [ ] `requestAnimationFrame` used for all drawing — never draw in scroll handler directly
- [ ] `{ passive: true }` on scroll listener
- [ ] Frame deduplication — only calls `drawFrame` when frame index actually changes

### Visual Quality
- [ ] Canvas uses `devicePixelRatio` scaling (crisp on Retina)
- [ ] Desktop uses cover-fit, mobile uses zoomed contain-fit
- [ ] First frame is white background
- [ ] Colors, fonts, and style match the ui-ux-pro-max design system
- [ ] No emojis used as icons (use SVG: Heroicons/Lucide)

### Mobile
- [ ] Scroll animation height reduced (250vh phone, 300vh tablet, 350vh desktop)
- [ ] Annotation cards compact: single-line, no paragraph text, bottom-positioned
- [ ] Navbar hides links on mobile, shows only logo + pill
- [ ] Feature cards stack to single column
- [ ] Specs use 2x2 grid on mobile
- [ ] No horizontal scroll on mobile

### Accessibility
- [ ] `prefers-reduced-motion` shows static frame, no animations
- [ ] Canvas has `role="img"` + `aria-label`
- [ ] Annotation cards have `tabindex="0"` + `role="article"`
- [ ] `aria-live="polite"` on card container
- [ ] Skip link present to jump past scroll animation
- [ ] Focus rings visible on all interactive elements
- [ ] Annotation card text passes 4.5:1 contrast ratio
- [ ] Screen reader alternative text describes the animation sequence

### Performance Budget
- [ ] Total frame payload < 15MB
- [ ] Each frame < 120KB
- [ ] No heavy JS libraries (vanilla JS only, except Three.js if card scanner included)
- [ ] No `scroll-behavior: smooth` (interferes with frame-accurate mapping)

### Content
- [ ] All content is real (from interview or website) — no Lorem ipsum
- [ ] Brand name and logo used consistently (navbar, footer, loader)
- [ ] Annotation cards match the content the user provided

---

## Best Practices

1. **`requestAnimationFrame` for drawing** — Never draw directly in scroll handler
2. **`{ passive: true }` on scroll listener** — Enables browser scroll optimizations
3. **Canvas with `devicePixelRatio`** — Crisp on Retina displays
4. **Preload all frames before showing** — No pop-in during scroll
5. **Frame deduplication** — Only calls `drawFrame` when frame index changes
6. **No `scroll-behavior: smooth`** — Would interfere with frame-accurate scroll mapping
7. **No heavy JS libraries** — Pure vanilla JS
8. **Sticky canvas** — `position: sticky` keeps canvas viewport-fixed while scroll container moves
9. **White first frame** — The video must start on a clean white background
10. **Data-driven design** — Always use ui-ux-pro-max for palette/font/style decisions
