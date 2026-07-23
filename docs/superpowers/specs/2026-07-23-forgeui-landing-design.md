# Design Spec: ForgeUI Landing — Sleek Dark Landing Hero Section

**Date**: 2026-07-23  
**Status**: Proposed  

---

## 1. Goal Description
Build a production-quality, premium dark-themed landing section component named **ForgeUILanding** using React, TypeScript, Tailwind CSS v4, and Lucide React. It features a top-left light beam/spotlight effect, a clean minimalist navigation bar, high-contrast typography, interactive buttons (Browse Components and Documentation), and a technical tech stack footer.

The API is intentionally semi-customizable, targeting developer copy-paste use cases where users can easily clone the code and modify it inline.

---

## 2. Requirements & Constraints
- **Framework**: React 19 / Next.js compatible.
- **Styling**: Tailwind CSS v4.
- **Icons**: Lucide React (`BookOpen`, `ChevronRight`, `Github`).
- **Aesthetics**: Sleek dark mode with radial spotlight effects and premium interactive hovers.

---

## 3. API & Props Definition

```typescript
export interface ForgeUILandingProps {
  /**
   * Callback fired when clicking the 'Browse Components' button
   */
  onBrowseComponents?: () => void;
  
  /**
   * Callback fired when clicking the 'Documentation' button
   */
  onDocumentation?: () => void;
  
  /**
   * Optional custom URL for the GitHub social icon link
   * @default "#github"
   */
  githubUrl?: string;
  
  /**
   * Optional custom URL for the X (Twitter) social icon link
   * @default "#x"
   */
  twitterUrl?: string;
  
  /**
   * Optional additional CSS classes to customize layout wrapper
   */
  className?: string;
}
```

---

## 4. Verification Plan
- Register in the components registry (`apps/docs/src/registry/index.ts`).
- Create a test demo page in the documentation site (`apps/docs/src/app/landing-demo/page.tsx`).
- Verify visual aesthetics match the design: radial glow, typography gradients, flex layout alignment, and responsive viewports.
