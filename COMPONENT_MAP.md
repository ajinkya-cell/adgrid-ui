# Void UI / Adgrid UI — Component Architecture & Linkage Map

> **Primary Source of Truth**: `apps/docs/src/registry/index.ts`  
> **Total Registered Components**: 62  
> **Generated**: 2026-09-14

---

## 1. Monorepo Architecture & The 5-Point Component Linkage

Whenever editing, debugging, or creating any component in this monorepo, 5 key touchpoints are linked together:

| Touchpoint | Purpose | Path Pattern |
| :--- | :--- | :--- |
| **1. UI Source File** | Actual React component logic, styles, animations | `packages/ui/src/<packagePath>` |
| **2. Monorepo Barrel Export** | Re-exported for `@adgrid-ui/ui` monorepo consumers | `packages/ui/src/index.ts` |
| **3. Docs Registry Source** | Metadata, slug, category, propDefs (tweaker controls), dependencies | `apps/docs/src/registry/index.ts` |
| **4. Showcase / Presentation** | Live renderer in Gallery and `/present/[category]/[slug]` studio | `apps/docs/src/components/presentation/PresentationRenderer.tsx` |
| **5. CLI / Shadcn Distribution** | Precompiled static JSON schema consumed by `npx void-ui add <slug>` | `apps/docs/public/r/<slug>.json` |

---

## 2. Complete Component Index (62 Components)

| # | Component Name | Slug | Category | Pure Source Path | Key Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Infinite Scroll** | `infinite-scroll` | `animated` | [`packages/ui/src/animated/InfiniteScroll.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/InfiniteScroll.tsx) | `gsap`, `lenis` |
| 2 | **Image Reveal** | `image-reveal` | `animated` | [`packages/ui/src/animated/ImageReveal.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/ImageReveal.tsx) | `framer-motion` |
| 3 | **Image Parallax** | `image-parallax` | `animated` | [`packages/ui/src/animated/ImageParallax.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/ImageParallax.tsx) | `framer-motion` |
| 4 | **Living Text** | `living-text` | `animated` | [`packages/ui/src/animated/LivingText.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/LivingText.tsx) | `framer-motion` |
| 5 | **Spotlight Text** | `spotlight-text` | `animated` | [`packages/ui/src/animated/spotlight-text/SpotlightText.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/spotlight-text/SpotlightText.tsx) | None |
| 6 | **Gravity Card Stack** | `gravity-card-stack` | `animated` | [`packages/ui/src/animated/GravityCardStack.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/GravityCardStack.tsx) | `matter-js`, `gsap` |
| 7 | **Morphing Nav** | `morphing-nav` | `animated` | [`packages/ui/src/animated/MorphingNav.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/MorphingNav.tsx) | `framer-motion`, `lucide-react` |
| 8 | **Coverflow Carousel** | `coverflow-carousel` | `animated` | [`packages/ui/src/animated/coverflow/CoverflowCarousel.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/coverflow/CoverflowCarousel.tsx) | `framer-motion` |
| 9 | **Void Button** | `void-button` | `buttons` | [`packages/ui/src/animated/VoidButton.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/VoidButton.tsx) | `framer-motion` |
| 10 | **Brushed Titanium Button** | `brushed-titanium-button` | `buttons` | [`packages/ui/src/animated/BrushedTitaniumButton.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/BrushedTitaniumButton.tsx) | `framer-motion` |
| 11 | **Liquid Gold Button** | `liquid-gold-button` | `buttons` | [`packages/ui/src/animated/LiquidGoldButton.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/LiquidGoldButton.tsx) | `framer-motion` |
| 12 | **Guilloche Button** | `guilloche-button` | `buttons` | [`packages/ui/src/animated/GuillocheButton.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/GuillocheButton.tsx) | `framer-motion` |
| 13 | **Button Alpha** | `button-alpha` | `buttons` | [`packages/ui/src/animated/ButtonAlpha.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/ButtonAlpha.tsx) | `framer-motion` |
| 14 | **Pixel Melt** | `pixel-melt` | `backgrounds` | [`packages/ui/src/backgrounds/PixelMelt.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/backgrounds/PixelMelt.tsx) | None |
| 15 | **Breathing Grid** | `breathing-grid` | `backgrounds` | [`packages/ui/src/backgrounds/BreathingGrid.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/backgrounds/BreathingGrid.tsx) | None |
| 16 | **Breathing Background** | `breathing-background` | `backgrounds` | [`packages/ui/src/backgrounds/BreathingBackground.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/backgrounds/BreathingBackground.tsx) | `framer-motion` |
| 17 | **Floating Embers** | `floating-embers` | `backgrounds` | [`packages/ui/src/backgrounds/FloatingEmbers.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/backgrounds/FloatingEmbers.tsx) | None |
| 18 | **Spotlight Grid** | `spotlight-grid` | `backgrounds` | [`packages/ui/src/backgrounds/SpotlightGrid.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/backgrounds/SpotlightGrid.tsx) | None |
| 19 | **Lumina Wave** | `lumina-wave` | `backgrounds` | [`packages/ui/src/backgrounds/LuminaWave.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/backgrounds/LuminaWave.tsx) | None |
| 20 | **Matrix Rain** | `matrix-rain` | `backgrounds` | [`packages/ui/src/backgrounds/MatrixRain.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/backgrounds/MatrixRain.tsx) | None |
| 21 | **Anisotropic Knob** | `anisotropic-knob` | `primitives` | [`packages/ui/src/animated/AnisotropicKnob.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/AnisotropicKnob.tsx) | `framer-motion` |
| 22 | **Vault** | `laser-vault-password` | `widgets` | [`packages/ui/src/animated/LaserVaultPassword.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/LaserVaultPassword.tsx) | `framer-motion`, `lucide-react` |
| 23 | **Premium Hero** | `premium-hero` | `animated` | [`packages/ui/src/animated/PremiumHero.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/PremiumHero.tsx) | `framer-motion`, `lucide-react` |
| 24 | **Dot Matrix** | `dot-matrix` | `animated` | [`packages/ui/src/animated/DotMatrix.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/DotMatrix.tsx) | `framer-motion` |
| 25 | **Scroll Progress** | `scroll-progress` | `animated` | [`packages/ui/src/animated/scrollprogress/ScrollProgress.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/scrollprogress/ScrollProgress.tsx) | `framer-motion` |
| 26 | **Scroll Path Draw** | `scroll-path-draw` | `animated` | [`packages/ui/src/animated/scrollpath/ScrollPathContainer.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/scrollpath/ScrollPathContainer.tsx) | `framer-motion` |
| 27 | **Now Playing Card** | `now-playing-card` | `animated` | [`packages/ui/src/animated/NowPlayingCard.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/NowPlayingCard.tsx) | `react-icons` |
| 28 | **Wheel Picker** | `wheel-picker` | `animated` | [`packages/ui/src/animated/WheelPicker.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/WheelPicker.tsx) | `framer-motion` |
| 29 | **Weapon Wheel** | `weapon-wheel` | `animated` | [`packages/ui/src/animated/WeaponWheel.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/WeaponWheel.tsx) | `framer-motion`, `@tabler/icons-react` |
| 30 | **Hero Landing** | `hero` | `animated` | [`packages/ui/src/animated/Hero.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Hero.tsx) | `framer-motion` |
| 31 | **Expand On Hover** | `expand-on-hover` | `animated` | [`packages/ui/src/animated/expand-on-hover/components/expand-on-hover/ExpandOnHover.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/expand-on-hover/components/expand-on-hover/ExpandOnHover.tsx) | `framer-motion` |
| 32 | **Text Shuffle** | `text-shuffle` | `animated` | [`packages/ui/src/animated/text-shuffle/TextShuffle.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/text-shuffle/TextShuffle.tsx) | `framer-motion` |
| 33 | **Cards** | `cards` | `animated` | [`packages/ui/src/animated/Cards.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Cards.tsx) | `framer-motion` |
| 34 | **Simple Card** | `simple-card` | `animated` | [`packages/ui/src/animated/SimpleCard.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/SimpleCard.tsx) | `framer-motion` |
| 35 | **Flickering Grid Playground** | `flickering-grid-playground` | `animated` | [`packages/ui/src/animated/FlickeringGrid.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/FlickeringGrid.tsx) | None |
| 36 | **Dot Pattern Playground** | `dot-pattern-playground` | `animated` | [`packages/ui/src/animated/DotPattern.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/DotPattern.tsx) | None |
| 37 | **Cards Two (3D Orbit Ring)** | `cards-two` | `animated` | [`packages/ui/src/animated/CardsTwo/CardsTwo.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/CardsTwo/CardsTwo.tsx) | `framer-motion` |
| 38 | **Animated Icons 1** | `animated-icons-1` | `animated` | [`packages/ui/src/animated/Loaders1.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Loaders1.tsx) | `framer-motion`, `@tabler/icons-react` |
| 39 | **Dashed Feature Card** | `dashed-feature-card` | `animated` | [`packages/ui/src/animated/DashedFeatureCard.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/DashedFeatureCard.tsx) | `framer-motion`, `@tabler/icons-react` |
| 40 | **Dashed Marquee** | `dashed-marquee` | `animated` | [`packages/ui/src/animated/DashedMarquee.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/DashedMarquee.tsx) | `framer-motion`, `@tabler/icons-react` |
| 41 | **Marquee 2** | `marquee-2` | `animated` | [`packages/ui/src/animated/Marquee2.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Marquee2.tsx) | `framer-motion`, `devicons-react` |
| 42 | **Accordion** | `accordion` | `animated` | [`packages/ui/src/animated/Accordion.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Accordion.tsx) | `framer-motion` |
| 43 | **Sticker Card** | `sticker-card` | `animated` | [`packages/ui/src/animated/StickerCard.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/StickerCard.tsx) | `framer-motion`, `lucide-react` |
| 44 | **Datepicker** | `datepicker` | `animated` | [`packages/ui/src/animated/Datepicker.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Datepicker.tsx) | `framer-motion`, `@tabler/icons-react` |
| 45 | **NavBar1** | `navbar-1` | `animated` | [`packages/ui/src/animated/NavBar1.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/NavBar1.tsx) | `framer-motion`, `@tabler/icons-react` |
| 46 | **Bevel Alert Dialog** | `bevel-alert-dialog` | `animated` | [`packages/ui/src/animated/BevelAlertDialog.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/BevelAlertDialog.tsx) | `framer-motion` |
| 47 | **ForgeUI Landing** | `forgeui-landing` | `animated` | [`packages/ui/src/animated/ForgeUILanding.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/ForgeUILanding.tsx) | `lucide-react` |
| 49 | **Rays Landing** | `rays-landing` | `animated` | [`packages/ui/src/animated/RaysLanding.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/RaysLanding.tsx) | `lucide-react` |
| 50 | **Breathing Scale Card** | `breathing-scale-card` | `animated` | [`packages/ui/src/animated/BreathingScaleCard.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/BreathingScaleCard.tsx) | `framer-motion` |
| 51 | **GitHub Heatmap** | `github-heatmap` | `animated` | [`packages/ui/src/animated/GithubHeatmap.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/GithubHeatmap.tsx) | `framer-motion` |
| 52 | **Developer ID Card** | `developer-id-card` | `animated` | [`packages/ui/src/animated/DeveloperIdCard.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/DeveloperIdCard.tsx) | `framer-motion` |
| 53 | **Sidebar** | `sidebar` | `animated` | [`packages/ui/src/animated/Sidebar.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Sidebar.tsx) | `framer-motion`, `lucide-react` |
| 54 | **Command Palette** | `command-palette` | `animated` | [`packages/ui/src/animated/CommandPalette.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/CommandPalette.tsx) | `framer-motion`, `lucide-react` |
| 55 | **Switch** | `switch` | `animated` | [`packages/ui/src/animated/Switch.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Switch.tsx) | `framer-motion` |
| 56 | **OTP Component** | `otp-input` | `animated` | [`packages/ui/src/animated/OTPInput.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/OTPInput.tsx) | `framer-motion`, `lucide-react` |
| 57 | **Tooltip** | `tooltip` | `animated` | [`packages/ui/src/animated/Tooltip.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Tooltip.tsx) | `framer-motion` |
| 58 | **Stepper** | `stepper` | `animated` | [`packages/ui/src/animated/Stepper.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Stepper.tsx) | `framer-motion`, `lucide-react` |
| 59 | **Timeline** | `timeline` | `animated` | [`packages/ui/src/animated/Stepper.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Stepper.tsx) | `framer-motion`, `lucide-react` |
| 60 | **Globe** | `globe` | `animated` | [`packages/ui/src/animated/Globe.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Globe.tsx) | `cobe` |
| 61 | **Bento Grid** | `bento-grid` | `animated` | [`packages/ui/src/animated/BentoGrid.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/BentoGrid.tsx) | `framer-motion` |
| 62 | **Meter** | `meter` | `animated` | [`packages/ui/src/animated/Meter.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/animated/Meter.tsx) | `framer-motion` |

---

## 3. Core App & Package Entry Points

| Subsystem | Pure Path | Role |
| :--- | :--- | :--- |
| **UI Barrel** | [`packages/ui/src/index.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/index.ts) | Exports all 62 components for monorepo consumers |
| **UI Package Styles** | [`packages/ui/styles/globals.css`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/styles/globals.css) | Standalone package styles and font imports |
| **Registry Source** | [`apps/docs/src/registry/index.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/registry/index.ts) | Component catalog, schemas, and live prop definitions |
| **Registry Builder** | [`apps/docs/scripts/build-registry.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/scripts/build-registry.ts) | Precompiles static registry JSON files to `apps/docs/public/r/` |
| **Registry API** | [`apps/docs/src/app/api/registry/[slug]/route.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/api/registry/[slug]/route.ts) | On-demand dynamic JSON API for CLI/docs consumption |
| **Presentation Studio** | [`apps/docs/src/components/presentation/PresentationRenderer.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/components/presentation/PresentationRenderer.tsx) | Renders live components inside the interactive presentation studio |
| **Docs Gallery** | [`apps/docs/src/app/gallery/page.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/gallery/page.tsx) | Main grid gallery rendering cards and widgets |
| **Sandpack Live Preview** | [`apps/docs/src/components/site/LivePreview.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/components/site/LivePreview.tsx) | Interactive in-browser Sandpack preview & code editor |
| **Docs Global Styles** | [`apps/docs/src/app/globals.css`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/globals.css) | Global Tailwind 4 theme, font imports, and scrollbar styling |
| **Root Layout** | [`apps/docs/src/app/layout.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/layout.tsx) | Next.js root layout, base HTML chrome, font providers |
