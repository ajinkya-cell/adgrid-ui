# Revamp plan — <site name>

> Written in phase 1, kept up to date until the end. This file is the record of the revamp.

## Stack
- Framework:
- Styling:
- Component library in use:
- Dev URL:
- Path for components: (React + Tailwind v4 → shadcn registry / other → port, see SKILL.md › Stack paths)

## Baseline
- Lint: `<n>` errors, `<n>` warnings (top rules: …)
- Before-screenshots: `revamp/screenshots/*-before-*.png`

## Pages (in order)
| # | Route | Status | Notes |
|---|---|---|---|
| 1 | `/` | ☐ todo / ◐ in progress / ☑ verified | pilot |

## Element mapping
One row per distinct UI element on the pages in scope.

| Element (where) | Old implementation | Becomes | Kind |
|---|---|---|---|
| Primary CTA (hero, pricing) | `<Button variant="brand">` (MUI) | `Button variant="primary"` | catalog |
| Pricing card (pricing) | custom `.plan-card` | recipes.md §4 Pricing card | recipe |
| Order timeline (account) | custom | — | **gap** |

## Foundation
- [ ] tokens.css (+ tailwind-theme.css) imported at the root
- [ ] body background and text colour
- [ ] one sans + one mono, set once
- [ ] conflicting global CSS removed:

## Gaps
| Component | Built how (composed / new) | Lives where | Promote to library? |
|---|---|---|---|

## Promote
Reusable pieces to add to adgrid-ui later (follow `apps/docs/AGENTS.md` in that repo):
-

## Verification
- Lint after: `<n>` errors, `<n>` warnings (ignores and their reasons: …)
- After-screenshots: `revamp/screenshots/*-after-*.png`
- Behaviour checks: forms / routing / keyboard / tests / build
- Not verified (and why):
