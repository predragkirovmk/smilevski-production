# Loader — Frame Preloading

## Concept

A full-screen loader overlay that shows while frames are being preloaded. Displays the brand
logo, "Loading" text, and an accent-colored progress bar that fills as frames load. Once all
frames are loaded, the loader fades out and scroll is unlocked.

## HTML Structure

```html
<div id="loader" role="status" aria-live="polite" aria-label="Loading content">
    <div class="loader-content">
        <img src="logo.svg" alt="" class="loader-logo" aria-hidden="true">
        <p class="loader-text">Loading</p>
        <div class="loader-bar-track">
            <div class="loader-bar-fill" id="loader-fill"></div>
        </div>
        <p class="loader-percent" id="loader-percent" aria-live="polite">0%</p>
    </div>
</div>
```

Note:
- `role="status"` and `aria-live="polite"` so screen readers announce loading progress
- Logo has `aria-hidden="true"` since it's decorative in this context
- Percentage text updates are announced to screen readers

## CSS

```css
#loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-color, #0a0a0a);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.6s ease;
}

#loader.hidden {
    opacity: 0;
    pointer-events: none;
}

.loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.loader-logo {
    width: 48px;
    height: 48px;
    opacity: 0.8;
}

.loader-text {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 4px;
    opacity: 0.5;
}

.loader-bar-track {
    width: 200px;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.loader-bar-fill {
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, var(--accent-color), var(--accent-color-light, var(--accent-color)));
    border-radius: 3px;
    transition: width 0.1s ease;
}

.loader-percent {
    font-family: var(--font-mono, monospace);
    font-size: 12px;
    opacity: 0.4;
}
```

## JavaScript — Progress Tracking

```javascript
function updateLoader(progress) {
    const fill = document.getElementById('loader-fill');
    const percent = document.getElementById('loader-percent');
    const pct = Math.round(progress * 100);
    fill.style.width = pct + '%';
    percent.textContent = pct + '%';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');

    // Remove from DOM after fade completes
    setTimeout(() => {
        loader.remove();
    }, 600);
}

// Integration with frame preloading
async function init() {
    await preloadFrames(); // This calls updateLoader() as each frame loads
    hideLoader();
    // Draw first frame
    if (frames[0]) {
        drawFrame(frames[0]);
    }
}

init();
```

## Body Scroll Lock During Loading

Prevent scrolling while frames are still loading:

```javascript
// Lock scroll during loading
document.body.style.overflow = 'hidden';

async function init() {
    await preloadFrames();
    hideLoader();
    document.body.style.overflow = ''; // Unlock scroll
    if (frames[0]) drawFrame(frames[0]);
}
```

## Loader Variants by Style

The loader style can adapt to the overall vibe (from animation-presets.csv):

- **Minimal**: Just a thin progress bar, no logo, no percentage
- **Elegant**: Logo + "Loading" + thin gold bar
- **Bold**: Large percentage number in the center, thick bar
- **Cinematic**: Dramatic fade with blur backdrop

## Accessibility

- `role="status"` tells screen readers this is a live status region
- `aria-live="polite"` announces changes without interrupting
- The percentage text is announced as it updates
- When the loader is removed, focus should move to the first interactive element (skip link or navbar)
