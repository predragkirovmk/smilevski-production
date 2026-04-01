# Count-Up Animation — Specs Section

## Concept

Spec numbers animate from 0 to their target value with easeOutExpo easing, staggered 200ms
apart. During the count-up, each number gets an accent-color glow pulse. The animation is
triggered by IntersectionObserver when the specs section scrolls into view.

## HTML Structure

```html
<section class="specs" id="specs">
    <div class="specs-grid">
        <div class="spec-card" data-target="4680" data-suffix=" mAh">
            <span class="spec-number">0</span>
            <span class="spec-suffix"> mAh</span>
            <span class="spec-label">Battery</span>
        </div>
        <div class="spec-card" data-target="187" data-suffix="g">
            <span class="spec-number">0</span>
            <span class="spec-suffix">g</span>
            <span class="spec-label">Weight</span>
        </div>
        <div class="spec-card" data-target="6.7" data-suffix='"' data-decimals="1">
            <span class="spec-number">0</span>
            <span class="spec-suffix">"</span>
            <span class="spec-label">Display</span>
        </div>
        <div class="spec-card" data-target="120" data-suffix=" Hz">
            <span class="spec-number">0</span>
            <span class="spec-suffix"> Hz</span>
            <span class="spec-label">Refresh Rate</span>
        </div>
    </div>
</section>
```

## CSS

```css
.specs {
    padding: 80px 20px;
    text-align: center;
}

.specs-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
    max-width: 900px;
    margin: 0 auto;
}

.spec-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.spec-number {
    font-family: var(--font-heading);
    font-size: 48px;
    font-weight: 800;
    line-height: 1;
    transition: text-shadow 0.3s ease;
}

.spec-number.counting {
    text-shadow: 0 0 20px var(--accent-color), 0 0 40px rgba(var(--accent-rgb), 0.3);
}

.spec-suffix {
    font-family: var(--font-heading);
    font-size: 48px;
    font-weight: 800;
    line-height: 1;
}

.spec-label {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.5;
    margin-top: 8px;
}

/* Mobile: 2x2 grid */
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

## JavaScript — easeOutExpo Count-Up

```javascript
function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function countUp(element, target, duration = 1500, decimals = 0, delay = 0) {
    const numberEl = element.querySelector('.spec-number');

    setTimeout(() => {
        numberEl.classList.add('counting');
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const currentValue = easedProgress * target;

            numberEl.textContent = decimals > 0
                ? currentValue.toFixed(decimals)
                : Math.floor(currentValue).toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Ensure final value is exact
                numberEl.textContent = decimals > 0
                    ? target.toFixed(decimals)
                    : target.toLocaleString();
                // Remove glow after a short delay
                setTimeout(() => numberEl.classList.remove('counting'), 500);
            }
        }

        requestAnimationFrame(update);
    }, delay);
}
```

## IntersectionObserver Trigger

```javascript
function initCountUp() {
    const specCards = document.querySelectorAll('.spec-card');
    let hasCounted = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounted) {
                hasCounted = true;

                specCards.forEach((card, index) => {
                    const target = parseFloat(card.dataset.target);
                    const decimals = parseInt(card.dataset.decimals || '0');
                    countUp(card, target, 1500, decimals, index * 200);
                });

                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });

    observer.observe(document.querySelector('.specs'));
}
```

## prefers-reduced-motion Support

```javascript
function initCountUp() {
    const specCards = document.querySelectorAll('.spec-card');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        // Show final values immediately — no animation
        specCards.forEach(card => {
            const target = parseFloat(card.dataset.target);
            const decimals = parseInt(card.dataset.decimals || '0');
            const numberEl = card.querySelector('.spec-number');
            numberEl.textContent = decimals > 0
                ? target.toFixed(decimals)
                : target.toLocaleString();
        });
        return;
    }

    // Otherwise use IntersectionObserver + animated count-up
    // ... (observer code from above)
}
```

## Tuning

| Parameter | Default | Notes |
|---|---|---|
| duration | 1500ms | Longer = more dramatic buildup |
| stagger | 200ms | Delay between each number starting |
| glow duration | 500ms after completion | How long the accent glow lingers |
| threshold | 0.3 | How much of specs section must be visible |
