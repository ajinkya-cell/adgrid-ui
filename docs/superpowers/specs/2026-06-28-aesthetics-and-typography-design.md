# Typography & Aesthetics Upgrade Design

This document details the plan to upgrade the typography, visual aesthetics, and card designs of the `@adgrid-ui/ui` library. It introduces a curated selection of Google Fonts, reduces overall text density for a cleaner look, and adds premium back-shadows to card-based components.

## 1. Selected Google Fonts Mapping

To establish a premium, dark-first, luxury-technical visual identity, we map specific components to custom Google Fonts:

| Font Family | Visual Character | Usage Target | Tailwind Class |
| :--- | :--- | :--- | :--- |
| **Syncopate** | Ultra-wide, geometric, premium uppercase | Luxury buttons, navigation links, section titles, headers | `font-syncopate` |
| **Jura** | Geometric, futuristic, clean tech | Dial labels, form input labels, system parameters, control descriptions | `font-jura` |
| **Share Tech Mono** | Blocky digital, highly legible telemetry | Timer displays, coordinate logs, passcodes, pin inputs | `font-share-mono` |
| **Plus Jakarta Sans** | Clean, highly readable, elegant sans-serif | Form values, paragraphs, long descriptions, card details | `font-plus-jakarta` |
| **Syne** | High-design, organic quirky curves | Large scale interactive display typography | `font-syne` |
| **Cinzel** | Traditional Roman, luxurious serif | Classical gold button variants, serif display text | `font-cinzel` |

---

## 2. Centralized Style Integration

### 2.1 Google Fonts Fetching
We load the fonts in `packages/ui/styles/globals.css` and `apps/docs/src/app/globals.css` using a unified `@import`:

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Jura:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Share+Tech+Mono&family=Syncopate:wght@400;700&family=Syne:wght@400;700;800&display=swap');
```

### 2.2 Tailwind CSS v4 Theme Registration
We register the custom font families within the `@theme` block in both CSS files:

```css
@theme {
  --font-syncopate: "Syncopate", sans-serif;
  --font-jura: "Jura", sans-serif;
  --font-share-mono: "Share Tech Mono", monospace;
  --font-plus-jakarta: "Plus Jakarta Sans", sans-serif;
  --font-syne: "Syne", sans-serif;
  --font-cinzel: "Cinzel", serif;
}
```

---

## 3. Specific Component Enhancements

We will systematically review and modify the components in `packages/ui/src/animated` to apply typography styling, reduce word count, and add shadows:

### 3.1 Luxury Buttons
*   **Target Files:**
    *   `VoidButton.tsx`
    *   `BrushedTitaniumButton.tsx`
    *   `LiquidGoldButton.tsx`
    *   `GuillocheButton.tsx`
*   **Changes:**
    *   Set font to `font-syncopate text-[9px] uppercase tracking-[0.25em] font-bold`.
    *   For `VoidButton`'s classic-gold variant, use `font-cinzel text-xs uppercase tracking-widest font-black`.
    *   Simplify default labels (e.g. change "BRUSHED TITANIUM" to "TITANIUM").

### 3.2 Forms & Inputs
*   **Target Files:**
    *   `ChromeInput.tsx`
    *   `ChromeSelect.tsx`
    *   `MetallicForm.tsx`
*   **Changes:**
    *   Inputs/Selects value text: `font-plus-jakarta text-sm`.
    *   Floating labels, status badges, utility counts, validation logs: `font-jura text-[10px] uppercase tracking-wider font-semibold`.
    *   Simplify validation texts and help descriptions (keep messages under 5 words).
    *   Add deep back shadows to form containers: `shadow-[0_20px_50px_rgba(0,0,0,0.85)]` and subtle outer glowing borders.

### 3.3 Telemetry & Widgets
*   **Target Files:**
    *   `AnisotropicKnob.tsx`
    *   `MechanicalTimer.tsx`
    *   `LaserVaultPassword.tsx`
    *   `LiquidMercuryPad.tsx`
    *   `SlingshotChassis.tsx`
*   **Changes:**
    *   Keypad keys: `font-syncopate text-xs font-bold`.
    *   Value dials, numeric displays, telemetry feed logs, timers: `font-share-mono` (`Share Tech Mono`).
    *   Metric labels and mode switchers: `font-jura text-[9px] tracking-wider uppercase font-semibold`.
    *   Minimize verbose headers. Replace "INPUT SECURE PASSCODE" with "VAULT_SECURE". Remove wordy descriptions.
    *   Apply layered container back shadows (`shadow-2xl` coupled with inset dark bevel effects) to enhance the physical instrument look.

### 3.4 Media & Display
*   **Target Files:**
    *   `ImageReveal.tsx`
    *   `ImageStack.tsx`
    *   `ImageParallax.tsx`
    *   `LivingText.tsx`
*   **Changes:**
    *   `LivingText`: Switch to `font-syne font-black` for beautiful curves during mouse distortion.
    *   Image caption cards: Overlay titles use `font-syncopate text-[10px] uppercase tracking-[0.25em] font-bold` with sub-captions in `font-plus-jakarta text-xs text-neutral-400`.
    *   For `ImageStack` cards, apply layered offset back shadows (`shadow-[0_4px_20px_rgba(0,0,0,0.6),_0_12px_40px_rgba(0,0,0,0.8)]`) to emphasize depth.

### 3.5 Navigation & Timelines
*   **Target Files:**
    *   `MorphingNav.tsx`
    *   `StoryTimeline.tsx`
*   **Changes:**
    *   `MorphingNav`: Navigation links: `font-syncopate text-[8px] uppercase tracking-[0.25em] font-bold`.
    *   `StoryTimeline`: Years/Stats: `font-share-mono`. Description blocks: `font-plus-jakarta`. Node frames styled as mini-cards with custom soft back shadows.

---

## 4. Verification Plan

### 4.1 Development Server Compilation
Run local environment tests to check for build errors:
```bash
pnpm dev
```

### 4.2 Visual Verification
We will verify that:
1. Custom fonts load correctly from Google Fonts (visible in browser network logs and inspection).
2. Tailwind classes compile correctly under Tailwind CSS v4.
3. Component labels are cleaner, contain less wordy text, and display premium box shadows.
