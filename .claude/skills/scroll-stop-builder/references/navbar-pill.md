# Navbar — Scroll-to-Pill Transform

## Concept

The navbar starts full-width and transparent. On scroll (past a threshold), it shrinks to a
centered pill shape with rounded corners and a glass-morphism background. This creates a clean
transition from immersive hero to navigable content.

## HTML Structure

```html
<nav id="navbar" role="navigation" aria-label="Main navigation">
    <div class="nav-inner">
        <div class="nav-brand">
            <img src="logo.svg" alt="Brand Name logo" class="nav-logo">
            <span class="nav-name">Brand Name</span>
        </div>
        <div class="nav-links" aria-label="Page sections">
            <a href="#features">Features</a>
            <a href="#specs">Specs</a>
            <a href="#cta" class="nav-cta">Get Started</a>
        </div>
    </div>
</nav>
```

## CSS — Full State + Pill State

```css
#navbar {
    position: fixed;
    top: 16px;
    left: 16px;
    right: 16px;
    z-index: 100;
    transition: all 0.3s ease-in-out;
}

.nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    max-width: 100%;
    margin: 0 auto;
    border-radius: 16px;
    background: transparent;
    border: 1px solid transparent;
    transition: all 0.3s ease-in-out;
}

/* Pill state — applied via JS on scroll */
#navbar.scrolled .nav-inner {
    max-width: 820px;
    border-radius: 50px;
    background: rgba(0, 0, 0, 0.6); /* or rgba(255,255,255,0.8) for light themes */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
}

.nav-logo {
    width: 28px;
    height: 28px;
}

.nav-name {
    font-weight: 700;
    font-size: 16px;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
}

.nav-links a {
    font-size: 14px;
    font-weight: 500;
    opacity: 0.8;
    transition: opacity 0.2s;
    text-decoration: none;
    color: inherit;
}

.nav-links a:hover {
    opacity: 1;
}

.nav-links a:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 4px;
    border-radius: 4px;
}

.nav-cta {
    background: var(--accent-color) !important;
    color: white !important;
    padding: 8px 18px !important;
    border-radius: 50px !important;
    opacity: 1 !important;
}
```

## JavaScript — Scroll Detection

```javascript
const navbar = document.getElementById('navbar');
const MORPH_THRESHOLD = 100; // pixels — adjust per vibe from animation-presets.csv

window.addEventListener('scroll', () => {
    if (window.scrollY > MORPH_THRESHOLD) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });
```

## Mobile Adaptation

On mobile, hide navigation links and show only the brand logo + pill shape:

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

## Accessibility

- `role="navigation"` on the `<nav>` element
- `aria-label="Main navigation"` for screen readers
- All links have visible focus rings (`:focus` with outline)
- CTA button has sufficient contrast against its background
- Keyboard Tab order follows visual order (brand → links → CTA)

## Tuning

| Parameter | Default | Notes |
|---|---|---|
| MORPH_THRESHOLD | 100px | Lower = transforms sooner; adjust from animation-presets.csv |
| max-width (pill) | 820px | Narrower = more prominent pill effect |
| border-radius (pill) | 50px | Full pill shape |
| backdrop-filter blur | 20px | Higher = more frosted glass |
| transition duration | 0.3s | Match overall vibe timing |
