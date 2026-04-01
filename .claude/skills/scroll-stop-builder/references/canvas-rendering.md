# Canvas Rendering — Frame Sequence

## Why Canvas + Frames (Not `<video>`)

Browser video decoders aren't optimized for seeking on every scroll event. Canvas + pre-extracted
frames is buttery smooth and gives frame-perfect control. This is the same technique Apple uses
for their product pages.

## Canvas Setup with Retina Support

The canvas must account for `devicePixelRatio` to render crisply on Retina displays:

```javascript
const canvas = document.getElementById('scroll-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
```

## Cover-Fit Drawing (Desktop)

On desktop, use cover-fit so the frame fills the viewport edge-to-edge — no letterboxing:

```javascript
function drawFrameCover(img) {
    const canvasW = canvas.width / (window.devicePixelRatio || 1);
    const canvasH = canvas.height / (window.devicePixelRatio || 1);
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasW / canvasH;

    let drawW, drawH, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
        // Image is wider — fit height, crop sides
        drawH = canvasH;
        drawW = canvasH * imgRatio;
        offsetX = (canvasW - drawW) / 2;
        offsetY = 0;
    } else {
        // Image is taller — fit width, crop top/bottom
        drawW = canvasW;
        drawH = canvasW / imgRatio;
        offsetX = 0;
        offsetY = (canvasH - drawH) / 2;
    }

    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}
```

## Zoomed Contain-Fit (Mobile)

On mobile, use a slightly zoomed contain-fit so the object stays centered and visible without
being too small on narrow screens:

```javascript
function drawFrameContainZoomed(img, zoomFactor = 1.2) {
    const canvasW = canvas.width / (window.devicePixelRatio || 1);
    const canvasH = canvas.height / (window.devicePixelRatio || 1);
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasW / canvasH;

    let drawW, drawH;

    if (imgRatio > canvasRatio) {
        drawW = canvasW * zoomFactor;
        drawH = drawW / imgRatio;
    } else {
        drawH = canvasH * zoomFactor;
        drawW = drawH * imgRatio;
    }

    const offsetX = (canvasW - drawW) / 2;
    const offsetY = (canvasH - drawH) / 2;

    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}
```

## Scroll-to-Frame Mapping

Map the scroll position within the scroll-animation section to a frame index:

```javascript
const scrollContainer = document.querySelector('.scroll-animation');
let currentFrame = -1;

function onScroll() {
    const rect = scrollContainer.getBoundingClientRect();
    const scrollTop = -rect.top;
    const scrollHeight = scrollContainer.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
    const frameIndex = Math.floor(progress * (totalFrames - 1));

    // Frame deduplication — only draw when frame changes
    if (frameIndex !== currentFrame && frames[frameIndex]) {
        currentFrame = frameIndex;
        requestAnimationFrame(() => {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                drawFrameContainZoomed(frames[frameIndex]);
            } else {
                drawFrameCover(frames[frameIndex]);
            }
        });
    }
}

window.addEventListener('scroll', onScroll, { passive: true });
```

## Frame Preloading

Preload all frames before enabling scroll. Track progress for the loader:

```javascript
const frames = [];
const totalFrames = 120; // Adjust based on ffmpeg extraction
let loadedCount = 0;

function preloadFrames() {
    return new Promise((resolve) => {
        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                updateLoader(loadedCount / totalFrames);
                if (loadedCount === totalFrames) resolve();
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === totalFrames) resolve();
            };
            img.src = `frames/frame_${String(i).padStart(4, '0')}.jpg`;
            frames[i - 1] = img;
        }
    });
}
```

## Sticky Canvas HTML

The canvas uses `position: sticky` to stay viewport-fixed while the scroll container moves:

```html
<div class="scroll-animation" style="height: 350vh; position: relative;">
    <canvas id="scroll-canvas" role="img"
        aria-label="Product assembly animation controlled by scrolling"
        style="position: sticky; top: 0; width: 100%; height: 100vh;">
    </canvas>
    <!-- Annotation cards go here as absolutely-positioned children -->
</div>
```

## Common Pitfalls

- **Blurry canvas**: Forgot `devicePixelRatio` scaling
- **Jank on scroll**: Drawing directly in scroll handler instead of `requestAnimationFrame`
- **Frames not loading**: Using `file://` protocol — must serve via local server
- **Performance**: Frame images too large — keep each under 120KB JPEG
