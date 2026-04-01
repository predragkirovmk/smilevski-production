# Snap-Stop Scroll — Annotation Cards

## Concept

Annotation cards appear at specific scroll progress points during the frame sequence. The scroll
FREEZES briefly at each card position — creating a "boom, boom, boom" effect where each card
pops up as you stop. This gives the user time to read each annotation before continuing.

## Card HTML Structure

Cards use `data-show` and `data-hide` attributes to define their visibility range in terms of
scroll progress (0.0 to 1.0):

```html
<div class="scroll-animation" style="height: 350vh; position: relative;">
    <canvas id="scroll-canvas" ...></canvas>

    <div class="annotation-cards" aria-live="polite">
        <div class="annotation-card" data-show="0.15" data-hide="0.30"
             tabindex="0" role="article" aria-label="Feature: Precision Engineering">
            <div class="card-number">01</div>
            <div class="card-content">
                <h3 class="card-title">Precision Engineering</h3>
                <p class="card-description">Machined from a single block of aerospace-grade aluminum.</p>
                <div class="card-stat">
                    <span class="stat-value">0.01mm</span>
                    <span class="stat-label">tolerance</span>
                </div>
            </div>
        </div>

        <div class="annotation-card" data-show="0.35" data-hide="0.50"
             tabindex="0" role="article" aria-label="Feature: Advanced Display">
            <div class="card-number">02</div>
            <div class="card-content">
                <h3 class="card-title">Advanced Display</h3>
                <p class="card-description">ProMotion OLED with 2000 nits peak brightness.</p>
                <div class="card-stat">
                    <span class="stat-value">120Hz</span>
                    <span class="stat-label">refresh rate</span>
                </div>
            </div>
        </div>

        <!-- More cards... -->
    </div>
</div>
```

## Card Styling (Glass-Morphism)

```css
.annotation-card {
    position: absolute;
    bottom: 10vh;
    left: 5vw;
    max-width: 380px;
    padding: 28px;
    background: rgba(255, 255, 255, 0.08); /* adjust based on theme */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.35s ease, transform 0.35s ease;
    pointer-events: none;
    z-index: 30;
}

.annotation-card.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.annotation-card:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 4px;
}

.card-number {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 13px;
    color: var(--accent-color);
    margin-bottom: 8px;
    letter-spacing: 2px;
}

.card-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
}

.card-description {
    font-size: 14px;
    line-height: 1.6;
    opacity: 0.7;
    margin-bottom: 16px;
}

.card-stat {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.stat-value {
    font-family: var(--font-mono, monospace);
    font-size: 28px;
    font-weight: 700;
    color: var(--accent-color);
}

.stat-label {
    font-size: 13px;
    opacity: 0.5;
    text-transform: uppercase;
    letter-spacing: 1px;
}
```

## Snap-Stop JavaScript

The snap system detects when scroll progress enters a snap zone, scrolls to the exact position,
locks the body for a hold duration, then releases:

```javascript
const SNAP_ZONE = 0.02;      // How close to snap point before triggering
const HOLD_DURATION = 600;    // ms to freeze at each snap point
let isSnapping = false;
let lastSnappedPoint = -1;

function getSnapPoints() {
    const cards = document.querySelectorAll('.annotation-card');
    return Array.from(cards).map(card => parseFloat(card.dataset.show));
}

function checkSnap(progress) {
    if (isSnapping) return;

    const snapPoints = getSnapPoints();

    for (const point of snapPoints) {
        if (Math.abs(progress - point) < SNAP_ZONE && lastSnappedPoint !== point) {
            triggerSnap(point);
            break;
        }
    }
}

function triggerSnap(targetProgress) {
    isSnapping = true;
    lastSnappedPoint = targetProgress;

    const scrollContainer = document.querySelector('.scroll-animation');
    const scrollHeight = scrollContainer.offsetHeight - window.innerHeight;
    const containerTop = scrollContainer.offsetTop;
    const targetScrollY = containerTop + (targetProgress * scrollHeight);

    // Scroll to exact position
    window.scrollTo(0, targetScrollY);

    // Lock body
    document.body.style.overflow = 'hidden';

    // Release after hold duration
    setTimeout(() => {
        document.body.style.overflow = '';
        isSnapping = false;
    }, HOLD_DURATION);
}

// Card visibility based on scroll progress
function updateCards(progress) {
    const cards = document.querySelectorAll('.annotation-card');
    cards.forEach(card => {
        const show = parseFloat(card.dataset.show);
        const hide = parseFloat(card.dataset.hide);
        const isVisible = progress >= show && progress <= hide;
        card.classList.toggle('visible', isVisible);
    });
}
```

## Integrating with Scroll Handler

```javascript
function onScroll() {
    const rect = scrollContainer.getBoundingClientRect();
    const scrollTop = -rect.top;
    const scrollHeight = scrollContainer.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));

    // Update frame
    const frameIndex = Math.floor(progress * (totalFrames - 1));
    if (frameIndex !== currentFrame && frames[frameIndex]) {
        currentFrame = frameIndex;
        requestAnimationFrame(() => drawFrame(frames[frameIndex]));
    }

    // Update card visibility
    updateCards(progress);

    // Check snap points
    checkSnap(progress);
}
```

## Keyboard Navigation

Cards must be keyboard-accessible:

```javascript
document.querySelectorAll('.annotation-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const showProgress = parseFloat(card.dataset.show);
            const scrollContainer = document.querySelector('.scroll-animation');
            const scrollHeight = scrollContainer.offsetHeight - window.innerHeight;
            const targetScrollY = scrollContainer.offsetTop + (showProgress * scrollHeight);
            window.scrollTo({ top: targetScrollY, behavior: 'instant' });
        }
    });
});
```

## Flexible Card Count

The number of annotation cards is not fixed. Match the count to the content provided by the user.
Space them evenly across the scroll progress range:

- 3 cards: show at 0.15, 0.40, 0.70
- 4 cards: show at 0.12, 0.32, 0.55, 0.78
- 5 cards: show at 0.10, 0.28, 0.46, 0.64, 0.82
- 6 cards: show at 0.08, 0.24, 0.40, 0.56, 0.72, 0.88

Each card's hide point should be ~0.12-0.15 after its show point.

## Common Pitfalls

- **Snap feels jarring**: Reduce HOLD_DURATION to 400ms or increase SNAP_ZONE
- **Cards overlap**: Ensure hide points don't overlap with next card's show points
- **Not keyboard accessible**: Missing tabindex="0" and keydown handler
- **Screen readers miss cards**: Missing aria-live="polite" on container
