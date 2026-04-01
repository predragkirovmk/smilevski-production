# Sections Guide — Full Implementation Reference

This guide covers the complete section-by-section structure of a scroll-stop website.
For detailed implementations of specific components, see the individual reference files.

## Section Order (Top to Bottom)

```
1. Starscape          → Fixed canvas, z-index: 1
2. Loader             → Fixed overlay, z-index: 9999 (removed after load)
3. Scroll Progress Bar → Fixed top, z-index: 1000
4. Navbar             → Fixed top, z-index: 100
5. Skip Link          → Fixed top-left, z-index: 10000 (visible on focus only)
6. Hero               → Relative, z-index: 10
7. Scroll Animation   → Relative, z-index: 20 (sticky canvas inside)
8. Specs              → Relative, z-index: 10
9. Features           → Relative, z-index: 10
10. CTA               → Relative, z-index: 10
11. Footer            → Relative, z-index: 10
```

## 1. Starscape

See `starscape.md` for full implementation.

**Quick summary**: Fixed canvas behind everything. ~180 stars with drift + twinkle animation.
`aria-hidden="true"`, `pointer-events: none`, opacity ~0.6.

## 2. Loader

See `loader.md` for full implementation.

**Quick summary**: Full-screen overlay with brand logo + progress bar. Tracks frame preloading.
Fades out when complete. Body scroll locked during loading.

## 3. Scroll Progress Bar

A thin accent-colored bar at the top of the viewport showing scroll progress.

```html
<div class="scroll-progress" aria-hidden="true">
    <div class="scroll-progress-fill" id="progress-fill"></div>
</div>
```

```css
.scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: transparent;
    z-index: 1000;
}

.scroll-progress-fill {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--accent-color), var(--accent-color-light, var(--accent-color)));
    will-change: transform;
    transform-origin: left;
}
```

```javascript
// Use scaleX for GPU acceleration instead of width
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollTop / docHeight;
    document.getElementById('progress-fill').style.transform = `scaleX(${progress})`;
}, { passive: true });
```

## 4. Navbar

See `navbar-pill.md` for full implementation.

**Quick summary**: Full-width → centered pill on scroll. Glass-morphism background. Hide links
on mobile. Keyboard-accessible focus rings.

## 5. Skip Link (Accessibility)

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

```css
.skip-link {
    position: fixed;
    top: -100px;
    left: 16px;
    background: var(--accent-color);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    font-weight: 600;
    text-decoration: none;
    transition: top 0.2s;
}

.skip-link:focus {
    top: 16px;
}
```

Place `id="main-content"` on the element after the scroll animation section (e.g., the specs
section) so keyboard users can skip the scroll-driven animation entirely.

## 6. Hero

```html
<section class="hero">
    <!-- Background orbs (decorative) -->
    <div class="bg-orb orb-1" aria-hidden="true"></div>
    <div class="bg-orb orb-2" aria-hidden="true"></div>
    <div class="bg-orb orb-3" aria-hidden="true"></div>

    <!-- Grid overlay (decorative) -->
    <div class="grid-overlay" aria-hidden="true"></div>

    <!-- Content -->
    <div class="hero-content">
        <h1 class="hero-title">Product Name</h1>
        <p class="hero-subtitle">A brief, compelling description of the product.</p>
        <div class="hero-buttons">
            <a href="#cta" class="btn-primary">Get Started</a>
            <a href="#features" class="btn-secondary">Learn More</a>
        </div>
    </div>

    <!-- Scroll hint -->
    <div class="scroll-hint" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
    </div>
</section>
```

### Hero CSS

```css
.hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    text-align: center;
    padding: 0 20px;
}

.hero-content {
    position: relative;
    z-index: 10;
    max-width: 700px;
}

.hero-title {
    font-family: var(--font-heading);
    font-size: 4rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 20px;
}

.hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.7;
    line-height: 1.6;
    margin-bottom: 32px;
}

.hero-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
}

/* Background orbs */
.bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    animation: orbDrift 8s ease-in-out infinite alternate;
}

.orb-1 {
    width: 400px; height: 400px;
    background: var(--accent-color);
    top: 10%; left: 10%;
}

.orb-2 {
    width: 300px; height: 300px;
    background: var(--accent-color);
    bottom: 20%; right: 15%;
    animation-delay: -3s;
}

.orb-3 {
    width: 250px; height: 250px;
    background: var(--accent-color);
    top: 50%; left: 60%;
    animation-delay: -5s;
}

@keyframes orbDrift {
    0% { transform: translate(0, 0); }
    100% { transform: translate(30px, -20px); }
}

/* Grid overlay */
.grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
}

/* Scroll hint */
.scroll-hint {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0.4;
    animation: bounce 1.5s ease-in-out infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(8px); }
}
```

### Hide scroll hint after first scroll

```javascript
let scrollHintHidden = false;
window.addEventListener('scroll', () => {
    if (!scrollHintHidden && window.scrollY > 50) {
        scrollHintHidden = true;
        const hint = document.querySelector('.scroll-hint');
        if (hint) {
            hint.style.opacity = '0';
            hint.style.transition = 'opacity 0.3s';
            setTimeout(() => hint.remove(), 300);
        }
    }
}, { passive: true });
```

## 7. Scroll Animation

See `canvas-rendering.md` and `snap-stop-scroll.md` for full implementation.

**Quick summary**: Sticky canvas inside a tall container (350vh). Frame index mapped to scroll
position. Annotation cards appear/hide at specific progress points with snap-stop freeze.

## 8. Specs

See `count-up.md` for full implementation.

**Quick summary**: 4 stat cards in a row. Numbers count up with easeOutExpo on scroll into view.
Accent glow during counting. 2x2 grid on mobile.

## 9. Features

```html
<section class="features" id="features">
    <h2 class="section-heading">Features</h2>
    <div class="features-grid">
        <div class="feature-card">
            <div class="feature-icon">
                <!-- SVG icon here — NOT an emoji -->
            </div>
            <h3 class="feature-title">Feature Name</h3>
            <p class="feature-description">Brief description of the feature.</p>
        </div>
        <!-- More cards... -->
    </div>
</section>
```

```css
.features {
    padding: 80px 20px;
    max-width: 1100px;
    margin: 0 auto;
}

.section-heading {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 48px;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

.feature-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 32px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.feature-card:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 4px;
}

.feature-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    color: var(--accent-color);
}

.feature-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 8px;
}

.feature-description {
    font-size: 0.95rem;
    opacity: 0.7;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .features-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
}
```

### Stagger fade-in on scroll

```javascript
const featureCards = document.querySelectorAll('.feature-card');
const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            featureObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

featureCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.4s ease ${i * 200}ms, transform 0.4s ease ${i * 200}ms`;
    featureObserver.observe(card);
});
```

## 10. CTA

```html
<section class="cta-section" id="cta">
    <div class="cta-content">
        <h2 class="cta-heading">Ready to Experience It?</h2>
        <p class="cta-subtitle">Join thousands who already have.</p>
        <a href="#" class="btn-primary btn-large">Get Started</a>
    </div>
</section>
```

```css
.cta-section {
    padding: 100px 20px;
    text-align: center;
}

.cta-heading {
    font-size: 2.5rem;
    margin-bottom: 16px;
}

.cta-subtitle {
    font-size: 1.1rem;
    opacity: 0.6;
    margin-bottom: 32px;
}

.btn-large {
    padding: 16px 40px;
    font-size: 1.1rem;
}
```

## 11. Footer

```html
<footer class="footer">
    <div class="footer-content">
        <span class="footer-brand">Brand Name</span>
        <span class="footer-copy">&copy; 2026 Brand Name. All rights reserved.</span>
    </div>
</footer>
```

```css
.footer {
    padding: 40px 20px;
    text-align: center;
    opacity: 0.4;
    font-size: 14px;
}

.footer-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
}

.footer-brand {
    font-weight: 700;
}
```
