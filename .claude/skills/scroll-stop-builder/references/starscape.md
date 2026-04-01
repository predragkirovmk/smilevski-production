# Starscape — Animated Background

## Concept

A fixed canvas behind everything with ~180 stars that slowly drift and twinkle. Each star has
random drift speed, twinkle speed/phase, and opacity. Creates a subtle living background that
adds depth without distracting from the main content.

## HTML

```html
<canvas id="starscape" aria-hidden="true"
    style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; opacity: 0.6;">
</canvas>
```

Key attributes:
- `aria-hidden="true"` — purely decorative, hidden from screen readers
- `pointer-events: none` — clicks pass through to content below
- `z-index: 1` — behind all content
- `opacity: 0.6` — adjustable per vibe (see animation-presets.csv)

## Star Generation

```javascript
const starCanvas = document.getElementById('starscape');
const starCtx = starCanvas.getContext('2d');
const STAR_COUNT = 180; // Adjust per vibe from animation-presets.csv
const stars = [];

function initStars() {
    const dpr = window.devicePixelRatio || 1;
    starCanvas.width = window.innerWidth * dpr;
    starCanvas.height = window.innerHeight * dpr;
    starCtx.scale(dpr, dpr);

    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: Math.random() * 1.5 + 0.3,
            opacity: Math.random() * 0.8 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinklePhase: Math.random() * Math.PI * 2,
            driftX: (Math.random() - 0.5) * 0.15,
            driftY: (Math.random() - 0.5) * 0.1
        });
    }
}
```

## Animation Loop

```javascript
let starAnimationId;

function animateStars(timestamp) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    starCtx.clearRect(0, 0, w, h);

    for (const star of stars) {
        // Drift
        star.x += star.driftX;
        star.y += star.driftY;

        // Wrap around edges
        if (star.x < 0) star.x = w;
        if (star.x > w) star.x = 0;
        if (star.y < 0) star.y = h;
        if (star.y > h) star.y = 0;

        // Twinkle
        const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.opacity * (0.5 + 0.5 * twinkle);

        // Draw
        starCtx.beginPath();
        starCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        starCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        starCtx.fill();
    }

    starAnimationId = requestAnimationFrame(animateStars);
}
```

## prefers-reduced-motion Support

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function startStarscape() {
    initStars();
    if (prefersReducedMotion.matches) {
        // Draw once — no animation
        drawStaticStars();
    } else {
        starAnimationId = requestAnimationFrame(animateStars);
    }
}

function drawStaticStars() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    starCtx.clearRect(0, 0, w, h);
    for (const star of stars) {
        starCtx.beginPath();
        starCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        starCtx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.6})`;
        starCtx.fill();
    }
}

// Listen for runtime preference changes
prefersReducedMotion.addEventListener('change', () => {
    if (prefersReducedMotion.matches) {
        cancelAnimationFrame(starAnimationId);
        drawStaticStars();
    } else {
        starAnimationId = requestAnimationFrame(animateStars);
    }
});
```

## Resize Handling

```javascript
window.addEventListener('resize', () => {
    const dpr = window.devicePixelRatio || 1;
    starCanvas.width = window.innerWidth * dpr;
    starCanvas.height = window.innerHeight * dpr;
    starCtx.setTransform(1, 0, 0, 1, 0, 0);
    starCtx.scale(dpr, dpr);
});
```

## Mobile Optimization

Reduce star count on mobile for performance:

```javascript
function getStarCount() {
    if (window.innerWidth < 768) return 60;
    if (window.innerWidth < 1024) return 120;
    return 180; // Desktop default
}
```

## Tuning Parameters

| Parameter | Default | Range | Effect |
|---|---|---|---|
| STAR_COUNT | 180 | 60-250 | More stars = busier background |
| Canvas opacity | 0.6 | 0.3-0.7 | Higher = more prominent stars |
| radius | 0.3-1.8 | 0.2-2.5 | Larger = more visible individual stars |
| twinkleSpeed | 0.005-0.025 | 0.001-0.05 | Faster = more dynamic twinkling |
| driftX/Y | -0.15 to 0.15 | -0.3 to 0.3 | Faster drift = more noticeable movement |

Refer to `animation-presets.csv` for vibe-specific star count and opacity values.
