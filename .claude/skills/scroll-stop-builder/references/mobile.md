# Mobile Responsiveness

## Key Breakpoints

| Breakpoint | Device | Scroll Animation Height | Star Count |
|---|---|---|---|
| > 1024px | Desktop | 350vh (from presets) | 180 |
| 768px-1024px | Tablet | 300vh (from presets) | 120 |
| < 768px | Phone | 250vh (from presets) | 60 |

Note: Exact values come from `animation-presets.csv` based on the selected vibe.

## Annotation Cards — Compact Mobile Design

On mobile, annotation cards use a compact single-line design. Hide paragraph text, stat numbers,
and labels. Show only card number + title in a flex row. Position at bottom of viewport.

```css
@media (max-width: 768px) {
    .annotation-card {
        bottom: 1.5vh;
        left: 3vw;
        right: 3vw;
        max-width: none;
        padding: 14px 18px;
        border-radius: 14px;
    }

    .annotation-card .card-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .annotation-card .card-number {
        margin-bottom: 0;
        font-size: 12px;
        flex-shrink: 0;
    }

    .annotation-card .card-title {
        font-size: 15px;
        margin-bottom: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .annotation-card .card-description,
    .annotation-card .card-stat {
        display: none;
    }
}
```

## Canvas Drawing — Mobile

Use zoomed contain-fit on mobile so the product stays centered and visible:

```javascript
function drawFrame(img) {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        drawFrameContainZoomed(img, 1.2);
    } else {
        drawFrameCover(img);
    }
}
```

See `canvas-rendering.md` for full implementations of both drawing modes.

## Scroll Animation Height

Adjust the scroll-animation container height based on viewport:

```css
.scroll-animation {
    height: 350vh; /* Desktop default */
}

@media (max-width: 1024px) {
    .scroll-animation {
        height: 300vh;
    }
}

@media (max-width: 768px) {
    .scroll-animation {
        height: 250vh;
    }
}
```

## Navbar — Mobile

Hide navigation links on mobile, show only logo + pill:

```css
@media (max-width: 768px) {
    .nav-links {
        display: none;
    }

    #navbar.scrolled .nav-inner {
        max-width: 200px;
        padding: 10px 20px;
    }
}
```

## Specs — Mobile Grid

Switch from 4-column to 2x2 grid on mobile:

```css
@media (max-width: 768px) {
    .specs-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
    }

    .spec-number,
    .spec-suffix {
        font-size: 36px;
    }
}
```

## Feature Cards — Mobile Stack

Stack feature cards to single column on mobile:

```css
@media (max-width: 768px) {
    .features-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
}
```

## Hero — Mobile

Adjust hero text sizing and padding:

```css
@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }

    .hero-buttons {
        flex-direction: column;
        gap: 12px;
    }
}
```

## Floating Orbs — Mobile

Reduce orb count or disable on mobile for performance:

```css
@media (max-width: 768px) {
    .bg-orb:nth-child(n+3) {
        display: none; /* Keep only first 2 orbs on mobile */
    }
}
```

## Snap-Stop — Mobile Adjustment

Use a shorter hold duration on mobile (users scroll faster on touch):

```javascript
const HOLD_DURATION = window.innerWidth < 768 ? 400 : 600;
```

## Touch Considerations

- Ensure all interactive elements have minimum 44x44px touch targets
- Add 8px minimum spacing between touch targets
- Snap-stop works with touch scrolling (momentum scroll may need dampening)
- Test on real devices — iOS and Android handle scroll momentum differently

## Performance Checklist (Mobile)

- [ ] Star count reduced to 60 on phones
- [ ] Frame images are JPEG, each < 120KB
- [ ] Floating orbs reduced to 2 on mobile
- [ ] Annotation cards use compact single-line layout
- [ ] No horizontal scroll at 375px width
- [ ] Canvas uses contain-fit (not cover) to keep product visible
- [ ] Touch targets are 44x44px minimum
