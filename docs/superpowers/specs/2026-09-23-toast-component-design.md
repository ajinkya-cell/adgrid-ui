# Toast Component Design

## Goal

Add a polished, dismissible toast component and a presentation demo with a centered **Press to get toasts** button. The demo creates notifications with the heading **Toast created** and the description **This is the description of the toast.**

## Visual design

Use the project's machined bevel language from `docs/props-table-design.md` and `docs/card-bevel-prompt-and-code.md`: charcoal surface, restrained top-edge highlight, layered inset depth, and `rounded-3xl` corners. Add a small circular red dismiss button with a white cross as the main accent. Keep the toast compact, with clear hierarchy between title and description.

Position the stack close to the lower-right corner of the presentation demo area. The trigger remains centered. Each press adds a new toast to a three-card overlapping deck. The newest toast stays fully readable in front while up to two older cards peek out above and behind it with progressively smaller scale and depth. A fourth toast removes the oldest. Dismissing the front toast reveals the next one. Each toast auto-dismisses five seconds after it is added, or can be dismissed early with its close button.

## Animation and interaction

Use the existing `framer-motion` dependency and `AnimatePresence` for enter and exit. Keep stack position and depth on a stable wrapper, deriving z-order, scale, and offset from each toast's index so stack rearrangement does not compete with the card's entrance or exit transform. Hovering or focusing the stack expands the cards into a readable column. Respect reduced-motion preferences by removing animated transforms while retaining static offsets that make the stack understandable.

The dismiss control is a native button with an accessible name such as “Dismiss notification,” a visible keyboard focus treatment, and a comfortably sized target. Dismissal does not move focus. The notification is exposed as a polite status message and does not take focus.

## Component structure

- Add a reusable toast card under `packages/ui/src/animated/` with title, description, stack depth, and dismiss callback.
- Export the component and its public prop type from `packages/ui/src/index.ts`.
- Add a toast demo in `apps/docs/src/components/presentation/PresentationRenderer.tsx` with the centered trigger and fixed copy.
- Add a `toast` entry to `apps/docs/src/registry/index.ts` so it appears in the presentation section.
- Refresh the generated static registry entry in `apps/docs/public/r/toast.json` using the existing registry workflow.

The presentation demo owns a small three-item list and one five-second timer per toast. Timers are cleared when their toast is dismissed, displaced by the three-item limit, or when the demo unmounts. No swipe gestures, actions, or new dependency is included, and no global notification queue is added.

## Review criteria

- The presentation entry shows the centered trigger before activation and places the stack near the demo area's lower-right corner.
- Each press adds a toast; at most three cards are visible, with the newest at the front and older cards peeking behind it.
- A fourth press removes the oldest toast. Dismissing the front toast reveals the next card.
- Each toast disappears five seconds after it is added, and manual dismissal clears its timer.
- Hovering or keyboard-focusing the stack expands all three cards so each close button can be reached.
- The toast displays the specified heading and description, with a rounded bevel treatment and red circular dismiss control.
- Activating the dismiss control animates the toast out.
- The notification is announced politely without focus movement, and the close button is keyboard accessible.
- Reduced-motion settings remove positional motion.
