# Toast Component Design

## Goal

Add a polished, dismissible toast component and a presentation demo with a centered **Press to get toasts** button. The demo displays one fixed notification with the heading **Toast created** and the description **This is the description of the toast.**

## Visual design

Use the project's machined bevel language from `docs/props-table-design.md` and `docs/card-bevel-prompt-and-code.md`: charcoal surface, restrained top-edge highlight, layered inset depth, and `rounded-3xl` corners. Add a small circular red dismiss button with a white cross as the main accent. Keep the toast compact, with clear hierarchy between title and description.

Position the notification at the lower right of the presentation demo area. The trigger remains centered. On activation, show a single toast; repeated presses replay that same toast rather than stacking duplicates. The toast remains until the user dismisses it.

## Animation and interaction

Use the existing `framer-motion` dependency and `AnimatePresence` for enter and exit. Enter with a short, controlled spring that combines a small upward movement, slight scale, and opacity. Exit with a compact downward fade and scale. Respect reduced-motion preferences by using an opacity-only transition or no movement.

The dismiss control is a native button with an accessible name such as “Dismiss notification,” a visible keyboard focus treatment, and a comfortably sized target. Dismissal does not move focus. The notification is exposed as a polite status message and does not take focus.

## Component structure

- Add a reusable toast component under `packages/ui/src/animated/` with title, description, open state, and dismiss callback.
- Export the component and its public prop type from `packages/ui/src/index.ts`.
- Add a toast demo in `apps/docs/src/components/presentation/PresentationRenderer.tsx` with the centered trigger and fixed copy.
- Add a `toast` entry to `apps/docs/src/registry/index.ts` so it appears in the presentation section.
- Refresh the generated static registry entry in `apps/docs/public/r/toast.json` using the existing registry workflow.

No stacking queue, auto-dismiss timer, swipe gestures, actions, or new dependency is included.

## Review criteria

- The presentation entry shows the centered trigger before activation.
- Pressing the trigger animates in one toast at the demo area's lower right; pressing it again replays the toast without creating a duplicate.
- The toast displays the specified heading and description, with a rounded bevel treatment and red circular dismiss control.
- Activating the dismiss control animates the toast out.
- The notification is announced politely without focus movement, and the close button is keyboard accessible.
- Reduced-motion settings remove positional motion.
