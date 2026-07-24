# Implementation Plan: Rays Landing Page Component (`rays-landing`)

Add the `RaysLanding` component to `@adgrid-ui/ui` and register it in `registry.json` and presentation routes.

## User Review Required

> [!IMPORTANT]
> The component will replicate `kanishk.sh` landing page aesthetics with name updated to **Ajinkya** and full overhead WebGL light-ray background.

## Proposed Changes

### 1. `packages/ui/src/animated/RaysLanding.tsx`
- Create `RaysLanding` React component.
- Build lightweight inline WebGL Canvas renderer for top-center light rays.
- Build responsive liquid-glass floating header and mobile dock.
- Build hero typography, action buttons, and social links.

### 2. `packages/ui/src/index.ts`
- Export `RaysLanding` and `RaysLandingProps`.

### 3. `apps/docs/src/registry/index.ts`
- Add `rays-landing` entry to registry array with `presentationStrategy: "fullscreen"`, category `animated`, and prop definitions.

### 4. Build Registry Artifacts
- Execute `pnpm build:registry` in `apps/docs` to generate `apps/docs/public/r/registry.json` and `apps/docs/public/r/rays-landing.json`.

---

## Verification Plan

### Automated Tests & Type Checking
- Run `pnpm --filter @adgrid-ui/ui typecheck` or `pnpm build` to ensure clean TypeScript compilation.
- Run `pnpm build:registry` from `apps/docs` to verify `registry.json` generation.

### Manual Verification
- Check generated `public/r/rays-landing.json` content.
