<!-- Synced from apps/docs/src/registry/index.ts + packages/ui/src by scripts/sync.ts on 2026-10-16. Edit the source, not this copy. -->

# Component Catalog

Everything the library ships, 88 entries. **Primitives** are the system: use them for every
everyday control. Everything else is a **showpiece**: use at most one or two per page, where the page
calls for a moment (a hero, a background, a signature interaction). See SKILL.md › Showpieces.

Install any entry into a React + Tailwind v4 project with the shadcn CLI:

```bash
npx shadcn@latest add https://void-ui-phi.vercel.app/r/<slug>.json
```

Files land in `components/ui/` and import `cn` from `@/lib/utils`. Or use the package: `@adgrid-ui/ui`.

## Index

| Slug | Name | Category |
|---|---|---|
| `anisotropic-knob` | Anisotropic Knob | primitives |
| `choice` | Choice | primitives |
| `modal` | Modal | primitives |
| `dialog` | Dialog | primitives |
| `tabs` | Tabs | primitives |
| `segmented-control` | Segmented Control | primitives |
| `drawer` | Drawer | primitives |
| `nav` | Nav | primitives |
| `progress` | Progress | primitives |
| `combobox` | Combobox | primitives |
| `table` | Table | primitives |
| `breadcrumbs` | Breadcrumbs | primitives |
| `button` | Button | primitives |
| `text-field` | Text Field | primitives |
| `select` | Select | primitives |
| `color-picker` | Color Picker | primitives |
| `popover` | Popover | primitives |
| `pagination` | Pagination | primitives |
| `menubar` | Menubar | primitives |
| `spinner` | Spinner | primitives |
| `file-upload` | File Upload | primitives |
| `toast` | Toast | primitives |
| `otp-input` | OTP Input | primitives |
| `gauge` | Gauge | primitives |
| `void-button` | Void Button | buttons |
| `brushed-titanium-button` | Brushed Titanium Button | buttons |
| `liquid-gold-button` | Liquid Gold Button | buttons |
| `guilloche-button` | Guilloche Button | buttons |
| `button-alpha` | Button Alpha | buttons |
| `laser-vault-password` | Vault | widgets |
| `infinite-scroll` | Infinite Scroll | animated |
| `roughly` | Roughly | animated |
| `image-reveal` | Image Reveal | animated |
| `image-parallax` | Image Parallax | animated |
| `living-text` | Living Text | animated |
| `spotlight-text` | Spotlight Text | animated |
| `gravity-card-stack` | Gravity Card Stack | animated |
| `coverflow-carousel` | Coverflow Carousel | animated |
| `premium-hero` | Premium Hero | animated |
| `dot-matrix` | Dot Matrix | animated |
| `scroll-progress` | Scroll Progress | animated |
| `ruler-scrollbar` | Ruler Scrollbar | animated |
| `scroll-water` | Scroll Water | animated |
| `moon-pull` | Moon Pull | animated |
| `stacked-cards` | Stacked Cards | animated |
| `tilted-collage` | Tilted Collage | animated |
| `taped-marquee` | Taped Marquee | animated |
| `now-playing-card` | Now Playing Card | animated |
| `wheel-picker` | Wheel Picker | animated |
| `weapon-wheel` | Weapon Wheel | animated |
| `hero` | Hero Landing | animated |
| `expand-on-hover` | Expand On Hover | animated |
| `text-shuffle` | Text Shuffle | animated |
| `cards` | Cards | animated |
| `simple-card` | Simple Card | animated |
| `flickering-grid-playground` | Flickering Grid Playground | animated |
| `dot-pattern-playground` | Dot Pattern Playground | animated |
| `animated-icons-1` | Animated Icons 1 | animated |
| `marquee` | Marquee | animated |
| `marquee-2` | Marquee 2 | animated |
| `accordion` | Accordion | animated |
| `sticker-card` | Sticker Card | animated |
| `datepicker` | Datepicker | animated |
| `navbar-1` | NavBar1 | animated |
| `forgeui-landing` | ForgeUI Landing | animated |
| `rays-landing` | Rays Landing | animated |
| `chalkboard-404` | Chalkboard 404 | animated |
| `polaroid-develop` | Polaroid Develop | animated |
| `breathing-scale-card` | Breathing Scale Card | animated |
| `github-heatmap` | GitHub Heatmap | animated |
| `developer-id-card` | Developer ID Card | animated |
| `sidebar` | Sidebar | animated |
| `command-palette` | Command Palette | animated |
| `switch` | Switch | animated |
| `tooltip` | Tooltip | animated |
| `timeline` | Timeline | animated |
| `globe` | Globe | animated |
| `bento-grid` | Bento Grid | animated |
| `meter` | Meter | animated |
| `stacked-card-fan` | Stacked Card Fan | animated |
| `pixel-melt` | Pixel Melt | backgrounds |
| `breathing-grid` | Breathing Grid | backgrounds |
| `breathing-background` | Breathing Background | backgrounds |
| `floating-embers` | Floating Embers | backgrounds |
| `spotlight-grid` | Spotlight Grid | backgrounds |
| `lumina-wave` | Lumina Wave | backgrounds |
| `matrix-rain` | Matrix Rain | backgrounds |
| `matrix-ripple-background` | Matrix Ripple Background | backgrounds |

---

## Primitives

### Anisotropic Knob — `anisotropic-knob`

Machined metal rotary dial knob component with dynamic rotating anisotropic highlights, snapper increments, and accessibility controls.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/anisotropic-knob.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/AnisotropicKnob.tsx`
- Exports: `AnisotropicKnob`

```ts
export interface AnisotropicKnobProps {
  variant?: "slider" | "infinite";
  min?: number;
  max?: number;
  value?: number;
  onChange?: (value: number) => void;
  defaultValue?: number;
  step?: number;
  size?: number;
  label?: string;
  className?: string;
  sound?: boolean;
}
```

### Choice — `choice`

One control for checkboxes and radios. Unchecked, it's a socket cut into the surface; checked, the box rises out of it, or a pearl rises in the middle. ChoiceGroup holds the value; the card variant lifts the chosen option and lights its edge.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/choice.json`
- Source: `packages/ui/src/primitives/Choice.tsx`
- Exports: `ChoiceGroup`, `Choice`

```ts
export interface ChoiceProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "checked" | "defaultChecked" | "value"> {
  /** Checkbox or radio. Inside a ChoiceGroup the group decides. */
  type?: ChoiceType;
  label?: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Checkbox only: a partly-selected parent. Shows a dash instead of the check. */
  indeterminate?: boolean;
  /** Required inside a ChoiceGroup; it's what the group stores. */
  value?: string;
  size?: ChoiceSize;
  /** "card" mounts the choice on a raised panel that lifts when selected. */
  variant?: ChoiceVariant;
  invalid?: boolean;
}

export type ChoiceType = "checkbox" | "radio";

export type ChoiceSize = "sm" | "md" | "lg";

export type ChoiceVariant = "default" | "card";

export type ChoiceGroupProps = RadioGroupProps | CheckboxGroupProps;
```

### Modal — `modal`

A window of content on the native <dialog>: focus trap, Escape and focus return built in. A raised panel with a prismatic edge, a close socket, and actions in a darker footer tray.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/modal.json`
- Source: `packages/ui/src/primitives/Dialog.tsx`
- Exports: `DialogButton`, `Modal`, `Dialog`

```ts
export interface DialogButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary rises out of the surface; secondary is part of it; danger is secondary with a warning edge. */
  tone?: "primary" | "secondary" | "danger";
  /** Close the surrounding Modal or Dialog after the click. */
  close?: boolean;
  /** Keeps the width, swaps the label for a spinner, and blocks clicks. */
  loading?: boolean;
}

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the modal when clicked, e.g. a DialogButton. */
  trigger?: ReactElement;
  title?: ReactNode;
  description?: ReactNode;
  /** Name for screen readers when there's no title. */
  "aria-label"?: string;
  /** Actions, shown in the footer tray. Give buttons `close` to dismiss on click. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Backdrop click and the close socket. Escape always closes. */
  dismissible?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the dialog when clicked. */
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  /** Shown in a small socket above the title. */
  icon?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** "danger" marks the confirm action as destructive. */
  tone?: "default" | "danger";
  /** Return a promise to keep the dialog open, with a spinner, until it settles. A rejection keeps it open. */
  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
  className?: string;
  /** Extra content between the description and the actions. */
  children?: ReactNode;
}
```

### Dialog — `dialog`

A decision before carrying on: an alert dialog with a cancel and a confirm action. No backdrop dismiss, Escape cancels, and a promise from onConfirm holds it open with a spinner until it settles.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/dialog.json`
- Source: `packages/ui/src/primitives/Dialog.tsx`
- Exports: `DialogButton`, `Modal`, `Dialog`

```ts
export interface DialogButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary rises out of the surface; secondary is part of it; danger is secondary with a warning edge. */
  tone?: "primary" | "secondary" | "danger";
  /** Close the surrounding Modal or Dialog after the click. */
  close?: boolean;
  /** Keeps the width, swaps the label for a spinner, and blocks clicks. */
  loading?: boolean;
}

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the modal when clicked, e.g. a DialogButton. */
  trigger?: ReactElement;
  title?: ReactNode;
  description?: ReactNode;
  /** Name for screen readers when there's no title. */
  "aria-label"?: string;
  /** Actions, shown in the footer tray. Give buttons `close` to dismiss on click. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Backdrop click and the close socket. Escape always closes. */
  dismissible?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the dialog when clicked. */
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  /** Shown in a small socket above the title. */
  icon?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** "danger" marks the confirm action as destructive. */
  tone?: "default" | "danger";
  /** Return a promise to keep the dialog open, with a spinner, until it settles. A rejection keeps it open. */
  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
  className?: string;
  /** Extra content between the description and the actions. */
  children?: ReactNode;
}
```

### Tabs — `tabs`

Switch between panels of one view. The list is a well and the active tab is a raised segment that slides between tabs; the underline variant swaps it for a prismatic line, for page-level tabs. Arrow keys move and select, Home and End jump.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/tabs.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/Tabs.tsx`
- Exports: `SEGMENT_CLASS`, `TRACK_CLASS`, `Tabs`, `TabsList`, `Tab`, `TabsPanel`

```ts
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** "segment" is a raised slab in a well; "underline" is a light line for page-level tabs. */
  variant?: TabsVariant;
  size?: TabsSize;
  /** Tabs share the list's full width equally. */
  fullWidth?: boolean;
}

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
  /** Shown before the label. */
  icon?: ReactNode;
}

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export type TabsVariant = "segment" | "underline";

export type TabsSize = "sm" | "md" | "lg";

export type TabsListProps = HTMLAttributes<HTMLDivElement>;
```

### Segmented Control — `segmented-control`

A small inline choice of two to five options in the Tabs material. Real radio inputs underneath, so arrow keys and forms work natively; the raised segment glides to whichever is checked. Labels, icons, or icons alone.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/segmented-control.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/SegmentedControl.tsx`
- Exports: `SegmentedControl`

```ts
export interface SegmentedOption {
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  /** Required when the option is icon-only. */
  "aria-label"?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Shared input name, for forms. Generated when omitted. */
  name?: string;
  size?: SegmentedControlSize;
  /** Options share the full width equally. */
  fullWidth?: boolean;
  disabled?: boolean;
}

export type SegmentedControlSize = "sm" | "md" | "lg";
```

### Drawer — `drawer`

A panel that slides in from the side on the native <dialog>, with focus trap, Escape and focus return built in. It floats just off the edge so the bevel, prismatic edge and long shadow all read; title, close socket and a footer tray for actions.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/drawer.json`
- Source: `packages/ui/src/primitives/Drawer.tsx`
- Exports: `DRAWER_PANEL_CLASS`, `CloseSocket`, `useDrawerClose`, `Drawer`

```ts
export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the drawer when clicked. */
  trigger?: ReactElement;
  side?: DrawerSide;
  /** Panel width: 320, 380 or 480px. */
  size?: DrawerSize;
  /** Heading. Without one, the children own the whole panel and `aria-label` names it. */
  title?: ReactNode;
  description?: ReactNode;
  "aria-label"?: string;
  /** Actions in the footer tray. */
  footer?: ReactNode;
  /** Backdrop click and the close socket. Escape always closes. */
  dismissible?: boolean;
  className?: string;
  children?: ReactNode;
}

export type DrawerSide = "left" | "right";

export type DrawerSize = "sm" | "md" | "lg";
```

### Nav — `nav`

Vertical navigation for sidebars and drawers. Groups, links or buttons with icons and badges, and collapsible sections on a machined rail. The current page is a raised segment that glides between items, even into a section.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/nav.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/Nav.tsx`
- Exports: `Nav`, `NavGroup`, `NavItem`, `NavSection`

```ts
export interface NavProps extends Omit<HTMLAttributes<HTMLElement>, "defaultValue" | "onChange"> {
  /** The current item's value. With a router, pass the current path. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface NavGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
}

export interface NavSectionProps {
  label: ReactNode;
  icon?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
}
```

### Progress — `progress`

A track cut into the surface with a popout fill rising out of it. Determinate progress slides the fill; leave the value out and a short slab sweeps across the well instead. Label and value above, real progressbar semantics underneath.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/progress.json`
- Source: `packages/ui/src/primitives/Progress.tsx`
- Exports: `Progress`

```ts
export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Current value. Leave undefined (or null) for indeterminate. */
  value?: number | null;
  max?: number;
  /** Shown above the track, and used as the accessible name. */
  label?: ReactNode;
  /** Show the value on the right of the label row. */
  showValue?: boolean;
  /** Formats the shown value and the screen-reader text. Defaults to a percentage. */
  formatValue?: (value: number, max: number) => string;
  /** Track height: 4, 6 or 8px. */
  size?: ProgressSize;
}

export type ProgressSize = "sm" | "md" | "lg";
```

### Combobox — `combobox`

An input that filters a list as you type. The field is a well; the list opens on the browser's top layer so nothing can clip it, flips above the field when there's no room, and a raised highlight glides between rows.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/combobox.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/Combobox.tsx`
- Exports: `Combobox`

```ts
export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  /** Extra words the filter matches but doesn't show. */
  keywords?: string[];
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  /** Shown when nothing matches. */
  emptyText?: ReactNode;
  /** Field height: 32, 40 or 48px. */
  size?: ComboboxSize;
  disabled?: boolean;
  invalid?: boolean;
  /** Shows a clear button while something is chosen. */
  clearable?: boolean;
  /** Submits the chosen value with a form. */
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}

export type ComboboxSize = "sm" | "md" | "lg";
```

### Table — `table`

A real <table> in a raised card: a darker header band, rows split by a machined cut line, numbers right-aligned in tabular figures, and sortable headers that report aria-sort. Optional title, action and footer tray.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/table.json`
- Source: `packages/ui/src/primitives/Table.tsx`
- Exports: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`

```ts
export interface TableProps extends Omit<HTMLAttributes<HTMLTableElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  /** Sits right of the title, e.g. a button or a SegmentedControl. */
  action?: ReactNode;
  /** Content for the footer tray, e.g. a count or pagination. */
  footer?: ReactNode;
  /** Classes for the card around the table. */
  containerClassName?: string;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Marks the row chosen; styled one step brighter and exposed as aria-selected. */
  selected?: boolean;
}

export interface TableHeadProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: Align;
  /** Right-aligns the column for numbers. */
  numeric?: boolean;
  /** Makes the header a sort button. `false` means sortable but not currently sorted. */
  sort?: "ascending" | "descending" | false;
  onSort?: () => void;
}

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: Align;
  /** Right-aligned tabular figures. */
  numeric?: boolean;
  /** The row's main cell: primary text instead of secondary. */
  primary?: boolean;
}
```

### Breadcrumbs — `breadcrumbs`

Where you are, as a trail of quiet links: ancestors in tertiary text, separators set back further, the current page in primary. Long trails fold their middle into a small socket that opens in place.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/breadcrumbs.json`
- Source: `packages/ui/src/primitives/Breadcrumbs.tsx`
- Exports: `Breadcrumbs`

```ts
export interface BreadcrumbItem {
  label: ReactNode;
  /** Ancestors link somewhere; the last item is the current page and never links. */
  href?: string;
  icon?: ReactNode;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** Fold the middle when there are more items than this. Keeps the first and the last two. */
  maxItems?: number;
  separator?: ReactNode;
  /** Renders links, e.g. Next's Link. Receives `href`, `className` and `children`. */
  linkAs?: ElementType;
}
```

### Button — `button`

The everyday button. Primary rises out of the surface as the lightest object on screen; secondary is a raised key; ghost appears on hover; danger carries a warning edge. Loading keeps the width; pass href for a real link.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/button.json`
- Source: `packages/ui/src/primitives/Button.tsx`
- Exports: `Button`

```ts
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonSize = "sm" | "md" | "lg";
```

### Text Field — `text-field`

Input, textarea and field in one: a well with its label above and a hint or error below, all wired for screen readers. Leading and trailing slots, a show-password toggle, an auto-growing multiline mode and a quiet character count.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/text-field.json`
- Source: `packages/ui/src/primitives/TextField.tsx`
- Exports: `TextField`

```ts
export type TextFieldSize = "sm" | "md" | "lg";
```

### Select — `select`

Pick one value. The list unfolds out of the field: it opens with your choice sitting exactly on the field and widens from that line, then folds back into whatever you pick. Type-ahead, groups, press-drag-release, and a value that rolls when changed from the keyboard.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/select.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/Select.tsx`
- Exports: `Select`

```ts
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** Options sharing a group are listed under a quiet heading. */
  group?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Field height: 32, 40 or 48px. Default "md". */
  size?: SelectSize;
  disabled?: boolean;
  invalid?: boolean;
  /** Submits the chosen value with a form. */
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}

export type SelectSize = "sm" | "md" | "lg";
```

### Color Picker — `color-picker`

A well with the colour in a round socket; open it for a shade area cut into the panel, recessed hue and opacity tracks with rings that lift when held, a hex field, the screen eyedropper, and preset chips with a gliding ring.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/color-picker.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/ColorPicker.tsx`
- Exports: `ColorPicker`

```ts
export interface Hsva {
  /** 0–360 */
  h: number;
  /** 0–100 */
  s: number;
  /** 0–100 */
  v: number;
  /** 0–1 */
  a: number;
}

export interface ColorPickerProps {
  /** Hex: "#RRGGBB", or "#RRGGBBAA" when translucent. */
  value?: string;
  defaultValue?: string;
  /** Every change while dragging or typing. */
  onValueChange?: (hex: string) => void;
  /** When a change is finished: pointer up, Enter, a preset or the eyedropper. Good for saving. */
  onValueCommit?: (hex: string) => void;
  /** Offer an opacity slider. Default true. */
  alpha?: boolean;
  /** Colours offered as one-click chips. Leave it out (or pass []) for no presets row at all. */
  presets?: string[];
  /** Just the picker, always visible, without the field and popover. */
  inline?: boolean;
  /** Field height: 32, 40 or 48px. Default "md". */
  size?: ColorPickerSize;
  disabled?: boolean;
  invalid?: boolean;
  /** Submits the hex with a form. */
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

export type ColorPickerSize = "sm" | "md" | "lg";
```

### Popover — `popover`

Popover and Dropdown Menu on one floating panel: top layer so nothing clips it, flips at the edge, closes on Escape or a click outside. The menu adds a gliding raised highlight, arrow keys, type-ahead, submenus, radio and check items, groups and shortcuts.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/popover.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/Popover.tsx`
- Exports: `usePopoverClose`, `Popover`, `DropdownMenu`, `MenuItem`, `MenuCheckboxItem`, `MenuLabel`, `MenuSeparator`, `MenuGroup`, `MenuSub`, `MenuRadioGroup`, `MenuRadioItem`

```ts
export interface PopoverProps {
  /** The element that opens it, usually a Button. It gets the click and aria wiring. */
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Preferred side; flips when there's no room. Default "bottom". */
  side?: PopoverSide;
  /** Default "start". */
  align?: PopoverAlign;
  /** Gap to the trigger in px. Default 8. */
  offset?: number;
  /** At least as wide as the trigger. */
  matchTriggerWidth?: boolean;
  /** Names the panel for screen readers. */
  "aria-label"?: string;
  /** Classes for the panel. */
  className?: string;
}

export interface DropdownMenuProps {
  trigger: ReactElement;
  /** MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuSub, MenuGroup, MenuLabel and MenuSeparator. */
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Default "bottom". */
  side?: PopoverSide;
  /** Default "start". */
  align?: PopoverAlign;
  offset?: number;
  /** Default true: at least as wide as the trigger. */
  matchTriggerWidth?: boolean;
  "aria-label"?: string;
  className?: string;
  /** ArrowLeft/ArrowRight inside the menu (when no submenu takes it). Menubar uses this to move between menus. */
  onEdgeNavigate?: (direction: -1 | 1) => void;
  /** Land on the first item whenever it opens, however it was opened. */
  autoFocusFirst?: boolean;
}

export interface MenuItemProps extends MenuItemBaseProps {
  /** Runs on click or Enter. Call event.preventDefault() to keep the menu open. */
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
  /** Render as a link. */
  href?: string;
}

export interface MenuCheckboxItemProps extends Omit<MenuItemBaseProps, "destructive"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export interface MenuSubProps {
  /** The row that opens it. */
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  textValue?: string;
  /** Items of the submenu. */
  children: ReactNode;
  className?: string;
}

export interface MenuRadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  /** Shows a MenuLabel above the items. */
  label?: ReactNode;
  children: ReactNode;
}

export interface MenuRadioItemProps extends Omit<MenuItemBaseProps, "destructive" | "icon"> {
  value: string;
}

export type PopoverSide = "top" | "bottom" | "left" | "right";

export type PopoverAlign = "start" | "center" | "end";
```

### Pagination — `pagination`

Page through a long list. Quiet ghost numbers with a raised current page that glides between them; the row keeps the same slots so nothing shifts. A compact "Page 5 of 20" variant rolls its number the way you moved.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/pagination.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/Pagination.tsx`
- Exports: `Pagination`

```ts
export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  totalPages: number;
  /** 1-based. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current one. Default 1. */
  siblingCount?: number;
  /** Pages always shown at each end. Default 1. */
  boundaryCount?: number;
  /** Default "numbers". */
  variant?: PaginationVariant;
  /** 32 or 36px squares. Default "md". */
  size?: PaginationSize;
  /** Render real links (for crawlable pages). onPageChange still fires on click. */
  href?: (page: number) => string;
}

export type PaginationVariant = "numbers" | "compact";

export type PaginationSize = "sm" | "md";
```

### Menubar — `menubar`

A slim raised bar of menus — File, Edit, View. The open menu's trigger sinks into the bar and the sunken segment glides as you move between menus; hover or the arrow keys carry you across. Menus bring submenus, radio and check items, and shortcuts.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/menubar.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/Menubar.tsx`
- Exports: `Menubar`, `MenubarMenu`

```ts
export interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
  /** MenubarMenu elements. */
  children: ReactNode;
}

export interface MenubarMenuProps {
  /** The trigger's text. */
  label: ReactNode;
  /** Menu items: MenuItem, MenuSub, MenuCheckboxItem, MenuRadioGroup, MenuGroup, MenuSeparator… */
  children: ReactNode;
  disabled?: boolean;
  /** Classes for the menu panel. */
  className?: string;
}
```

### Spinner — `spinner`

A faint ring cut into the surface with a quarter arc running round it, trailed by a softer half-arc so the turn reads as motion. Takes its colour from the text around it, so it works on popout and raised surfaces alike.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/spinner.json`
- Source: `packages/ui/src/primitives/Spinner.tsx`
- Exports: `Spinner`

```ts
export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** 12, 16 or 20px. */
  size?: SpinnerSize;
  /** Read to screen readers. Pass `null` when the spinner sits inside something that already says it's busy. */
  label?: string | null;
}

export type SpinnerSize = "sm" | "md" | "lg";
```

### File Upload — `file-upload`

A dashed well you drop files into or click to browse, with a real file input underneath so forms and keyboards just work. Files list below in trays with a thumbnail, size and a slim progress bar; rejected files stay with the reason.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/file-upload.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/FileUpload.tsx`
- Exports: `FileUpload`

```ts
export interface FileUploadItem {
  id: string;
  file: File;
  status: FileUploadStatus;
  /** 0–100 while uploading. Leave undefined (or null) for an indeterminate bar. */
  progress?: number | null;
  /** Shown in place of the size when status is "error". */
  error?: string;
}

export interface FileUploadProps {
  value?: FileUploadItem[];
  defaultValue?: FileUploadItem[];
  /** Called with the whole list whenever files are added or removed. */
  onValueChange?: (items: FileUploadItem[]) => void;
  /** Called with just the newly accepted files — the place to start uploads. */
  onFilesAdded?: (items: FileUploadItem[]) => void;
  /** Called when a file is removed from the list — the place to cancel its upload. */
  onRemove?: (item: FileUploadItem) => void;
  /** Same syntax as the input's `accept`: ".pdf,image/*,text/csv". */
  accept?: string;
  multiple?: boolean;
  /** Largest file accepted, in bytes. */
  maxSize?: number;
  /** Most files the list can hold. */
  maxFiles?: number;
  disabled?: boolean;
  invalid?: boolean;
  /** Submits the accepted files with a form. */
  name?: string;
  id?: string;
  /** Main line inside the well. */
  title?: ReactNode;
  /** Second line inside the well. Defaults to a summary of `accept` and `maxSize`. */
  hint?: ReactNode;
  "aria-describedby"?: string;
  className?: string;
}

export type FileUploadStatus = "idle" | "uploading" | "done" | "error";
```

### Toast — `toast`

Mount one <Toaster /> and call toast() from anywhere. Small raised cards with a status dot, optional action, promise support, a stack that fans out on hover, timers that pause while you look, and swipe to dismiss.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/toast.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/Toast.tsx`
- Exports: `toast`, `Toaster`

```ts
export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Pass an existing id to update that toast in place (e.g. loading → success). */
  id?: string | number;
  description?: ReactNode;
  action?: ToastAction;
  /** Milliseconds before it leaves. Infinity keeps it. Loading toasts never time out. */
  duration?: number;
  /** Show the close button and allow swiping. Default true. */
  dismissible?: boolean;
  /** Called when the toast is dismissed by the user or its timer. */
  onDismiss?: () => void;
}

export interface ToastData extends Omit<ToastOptions, "id"> {
  id: string | number;
  type: ToastType;
  title: ReactNode;
  /** Bumps whenever the toast is updated, restarting its timer. */
  version: number;
}

export interface ToasterProps {
  position?: ToasterPosition;
  /** How many toasts show at once; older ones wait behind. Default 3. */
  visibleToasts?: number;
  /** Default time on screen, in ms. Default 5000. */
  duration?: number;
  /** Always show the stack fanned out. */
  expand?: boolean;
  /** Distance from the viewport edge, in px. Default 16. */
  offset?: number;
  className?: string;
}

export type ToastType = "default" | "success" | "error" | "warning" | "loading";

export type ToasterPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
```

### OTP Input — `otp-input`

A one-time code field: a row of wells over a single real input, so SMS autofill, paste and screen readers just work. The active well takes the focus border, characters rise into place, masked PINs show as popout pearls, and error or success tint the edges with a message underneath.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/otp-input.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/OTPInput.tsx`
- Exports: `OTPInput`, `OTP`

```ts
export type OTPInputSize = "sm" | "md" | "lg";

export type OTPInputProps = OTPInputOwnProps & Omit<InputHTMLAttributes<HTMLInputElement>, Shared>;
```

### Gauge — `gauge`

An instrument card: a dial of machined segments around a recessed face. Segments between the origin and the value rise to popout, the leading one runs long as the needle, and the value sits in the face. Low, high and optimum work like the native <meter>, with a status chip in the header and a real meter underneath.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/gauge.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/primitives/Gauge.tsx`
- Exports: `Gauge`

```ts
export interface GaugeProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  /** Default 0. */
  min?: number;
  /** Default 100. */
  max?: number;
  /** Where the fill starts. Defaults to 0 when the range spans it, otherwise `min`. */
  origin?: number;
  /** Upper bound of the low region, as on the native <meter>. */
  low?: number;
  /** Lower bound of the high region, as on the native <meter>. */
  high?: number;
  /** The best value. Decides which region reads as good, fair or poor. */
  optimum?: number;
  /** Card title, and the accessible name. */
  label?: ReactNode;
  /** A line under the title. */
  description?: ReactNode;
  /** Small text under the value in the face (a unit, "of 100", "avg"). */
  caption?: ReactNode;
  /** Formats the value in the face and for screen readers. */
  formatValue?: (value: number) => string;
  /** Words for each status, shown beside the dot. */
  statusLabels?: Partial<Record<GaugeStatus, string>>;
  /** Number of segments. Default 41. */
  segments?: number;
  /** Light the segments from the origin on mount. Default true. */
  animateOnMount?: boolean;
  /** Card width: 240, 296 or 352px. Default "md". */
  size?: GaugeSize;
}

export type GaugeSize = "sm" | "md" | "lg";

export type GaugeStatus = "success" | "warning" | "danger";
```

---

## Buttons

### Void Button — `void-button`

Pure black button that reveals a luxury gold gradient under the cursor via a smooth radial mask.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/void-button.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/VoidButton.tsx`
- Props: `variant` ("default"), `style` ("default"), `length` (192), `children` ("Default")

### Brushed Titanium Button — `brushed-titanium-button`

Machined titanium texture with anisotropic highlight sweeps and reactive spotlight illumination.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/brushed-titanium-button.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/BrushedTitaniumButton.tsx`
- Props: `children` ("TITANIUM"), `length` (192), `disabled` (false)

### Liquid Gold Button — `liquid-gold-button`

Conic gradient rotating behind a frosted glass blur layer, with a 1px border that catches light only at the top.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/liquid-gold-button.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/LiquidGoldButton.tsx`
- Props: `children` ("Liquid Gold")

### Guilloche Button — `guilloche-button`

Watch dial Guilloché patterns generating Moire wave shapes under the cursor spotlight.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/guilloche-button.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/GuillocheButton.tsx`
- Props: `children` ("Guilloché")

### Button Alpha — `button-alpha`

High-friction matte polymer button with fine light-catching bevel borders and heavy Z-axis mechanical compression.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/button-alpha.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/ButtonAlpha.tsx`
- Props: `children` ("ACTIVATE"), `shape` ("pill"), `theme` ("charcoal")

---

## Widgets

### Vault — `laser-vault-password`

Passcode vault keypad with laser-etch cooling characters, dynamic cursor sweeps, tactile clicks, container rattles, and friction-metal creak alarms.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/laser-vault-password.json`
- Depends on: `framer-motion`, `lucide-react`
- Source: `packages/ui/src/animated/LaserVaultPassword.tsx`
- Props: `onUnlock`, `soundEffects` (true), `variant` ("cyber-laser"), `className`

---

## Animated

### Infinite Scroll — `infinite-scroll`

Seamless infinite fullscreen scroll with parallax image effects, powered by Lenis smooth scrolling and GSAP scrub animations.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/infinite-scroll.json`
- Depends on: `gsap`, `lenis`
- Source: `packages/ui/src/animated/InfiniteScroll.tsx`
- Props: `parallaxPercent` (50), `snapDuration` (0.9), `showProgress` (true), `showLabels` (true), `showScrollCue` (true), `overlayOpacity` (0.55)

### Roughly — `roughly`

Organic, hand-drawn vector annotations designed for high-friction digital typography. Wobbly underlines, pen circles, editorial strikethroughs, curly brackets, and tactile highlights.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/roughly.json`
- Depends on: `framer-motion`, `roughjs`, `rough-notation`
- Source: `packages/ui/src/animated/Roughly.tsx`
- Props: `children`, `type` ("underline"), `color` ("#e11d48"), `strokeWidth` (2), `animate` (true), `animationDuration` (800), `brackets` ("left"), `className`

### Image Reveal — `image-reveal`

Multi-layered scroll-driven image stack reveal with analog flash exposure & SVG grain texture overlays.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/image-reveal.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/ImageReveal.tsx`
- Props: `sensitivity` (1400)

### Image Parallax — `image-parallax`

A smooth mouse-move and scroll-driven parallax image perspective effect.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/image-parallax.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/ImageParallax.tsx`
- Props: `depth` (10), `tiltAmount` (5)

### Living Text — `living-text`

Stretches, rotates, and pushes characters dynamically based on real-time cursor proximity.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/living-text.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/LivingText.tsx`
- Props: `text` ("LIVING TEXT"), `radius` (170), `strength` (46), `mode` ("all"), `liquify` (true)

### Spotlight Text — `spotlight-text`

Debossed display text with a cursor-following spotlight clipped to glyph shapes and a minimal glowing bulb on the dot of 'i' and 'j'.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/spotlight-text.json`
- Source: `packages/ui/src/animated/spotlight-text/SpotlightText.tsx`
- Props: `text` ("Antimetal"), `colorMode` ("default"), `spotlightRadius` (140), `fontWeight` (800)

### Gravity Card Stack — `gravity-card-stack`

Falling rigid body physics cards container that reacts to scroll triggers.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/gravity-card-stack.json`
- Depends on: `matter-js`, `gsap`
- Source: `packages/ui/src/animated/GravityCardStack.tsx`
- Props: `className`, `gravity` (1), `restitution` (0.7), `friction` (0.1)

### Coverflow Carousel — `coverflow-carousel`

A hardware-accelerated 3D coverflow carousel with continuous modular perspective transforms and comprehensive gesture tracking.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/coverflow-carousel.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/coverflow/CoverflowCarousel.tsx`
- Props: `className`, `rotate` (30), `depth` (150)

### Premium Hero — `premium-hero`

Interactive Hero Section featuring floating 3D cards, typewriter search, spring CTA, and paper-notebook grid aesthetics.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/premium-hero.json`
- Depends on: `framer-motion`, `lucide-react`
- Source: `packages/ui/src/animated/PremiumHero.tsx`
- Props: `title` ("Crafted with Precision"), `subtitle` ("High-friction UI components designed for high-end web experiences"), `ctaText` ("Explore Studio"), `onSearchSubmit`, `className`

### Dot Matrix — `dot-matrix`

Highly optimized, programmable LED dot matrix display supporting Perlin noise, typewriter bitmaps, Web Audio integration, interactive cursor repelling, and custom plugin architectures.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/dot-matrix.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/DotMatrix.tsx`
- Props: `animation` ("scroll-text"), `text` ("VOID UI"), `columns` (44), `rows` (12), `color` ("#e7e5df"), `speed` (1), `glow` (true)

### Scroll Progress — `scroll-progress`

A vertical dynamic scrollbar overlay with interactive tick mark animations, dragging controls, and velocity-based stretching/glow.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/scroll-progress.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/scrollprogress/ScrollProgress.tsx`
- Props: `ticks` (42), `color` ("#a855f7"), `glow` (true), `height` (44), `width` (320), `variant` ("default")

### Ruler Scrollbar — `ruler-scrollbar`

A minimal ruler-style scrollbar on the right edge. Ticks near the current scroll position softly brighten and widen as you move down the page.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/ruler-scrollbar.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/ruler-scrollbar/RulerScrollbar.tsx`
- Props: `ticks` (56), `activeColor` ("#e7e5df"), `spread` (0.06), `expand` (0.35), `interactive` (true)

### Scroll Water — `scroll-water`

A floating back-to-top button that fills with water as you read. Two waves drift inside the circle while the level rises with scroll progress, and an up-arrow surfaces once the page is fully read.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/scroll-water.json`
- Source: `packages/ui/src/animated/scroll-water/ScrollWater.tsx`
- Props: `position` ("bottom-left"), `size` (44), `offset` (24), `color` ("#e7e5df"), `surfaceColor` ("#151515"), `waveHeight` (3.5), `waveSpeed` (1), `fullAt` (0.995), `smooth` (true)

### Moon Pull — `moon-pull`

A golden disc hanging on a strand of yarn. Pull it down and the cord stretches, resists and glows, then clicks like a lamp pull, springs back and fires onPull.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/moon-pull.json`
- Source: `packages/ui/src/animated/moon-pull/MoonPull.tsx`
- Props: `hint` ("pull me"), `threshold` (0.1), `restLength` (0.13), `left` (5), `width` (6), `glowColor` ("#f2c04a"), `sway` (true)

### Stacked Cards — `stacked-cards`

A loose pile of paper prints that deals out into a masonry collage, one sheet after another, and gathers back from a sticky button. The collage is always laid out; the pile is just transforms on top.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/stacked-cards.json`
- Source: `packages/ui/src/animated/paper/StackedCards.tsx`
- Props: `hint` ("Tap to spread"), `stagger` (25), `duration` (700), `fan` (1.8), `inkColor` ("#e7e5df")

### Tilted Collage — `tilted-collage`

A masonry wall of uncropped images on white paper mounts, each at a slight angle and drop. Wide strips break out of the columns and run across the whole wall.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/tilted-collage.json`
- Source: `packages/ui/src/animated/paper/TiltedCollage.tsx`
- Props: `columns` ("3"), `messiness` (1)

### Taped Marquee — `taped-marquee`

An endless row of photos mounted on paper and held down with torn tape, drifting sideways like pages pinned along a line. Pure CSS: pauses on hover, scrolls by hand under reduced motion.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/taped-marquee.json`
- Source: `packages/ui/src/animated/paper/TapedMarquee.tsx`
- Props: `seconds` (60), `reverse` (false), `tiltOffset` (0), `height` (240), `pauseOnHover` (true), `tapeColor` ("#ebe4d2")

### Now Playing Card — `now-playing-card`

A Spotify-style vinyl player card powered by Last.fm API that dynamically retrieves real-time listening history with vinyl spin animations.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/now-playing-card.json`
- Depends on: `react-icons`
- Source: `packages/ui/src/animated/NowPlayingCard.tsx`
- Props: `song`, `className`

### Wheel Picker — `wheel-picker`

A drum of values in 3D: drag it, flick it, scroll it, tap a row or use the keys, and it settles on a value in a recessed slot with a soft detent tick. Text tone follows the drum directly, so it never blurs or re-renders mid-spin.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/wheel-picker.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/WheelPicker.tsx`
- Props: `variant` ("raised"), `loop` (false), `sound` (true), `disabled` (false), `itemHeight` (40), `visibleItems` (5), `perspective` (1000)

### Weapon Wheel — `weapon-wheel`

Premium GTA V-inspired selection wheel designed for development tools, featuring interactive SVG slices, Tabler icons, mechanical clicks, and live stats dashboards.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/weapon-wheel.json`
- Depends on: `framer-motion`, `@tabler/icons-react`, `devicons-react`
- Source: `packages/ui/src/animated/WeaponWheel.tsx`
- Props: `variant` ("default"), `inline` (true), `triggerKey` ("q")

### Hero Landing — `hero`

Highly configurable, responsive portfolio hero landing page with technical grids and interactive pixel art decorations.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/hero.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/Hero.tsx`
- Props: `name` ("stephanie"), `bgColor` ("#1E3FEB"), `gridOpacity` (0.06), `fontFamily` ("instrument"), `monoFontFamily` ("dotgothic"), `iconVariant` ("flower"), `iconAnimation` ("static"), `iconPosition` ("inline"), `iconSize` (36), `iconRotation` (0), `introduction` ("I build high-end interactive visual systems and graphics for digital exhibitions, museums, and products."), `pixelDensity` ("medium"), `enableParallax` (true), `animationSpeed` ("normal"), `backgroundIconVariant` ("cross"), `backgroundIconCount` (8)

### Expand On Hover — `expand-on-hover`

A stack of compact preview cards that smoothly expand into immersive content panels on hover, featuring physical parting animations and 3D pointer tracking.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/expand-on-hover.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/expand-on-hover/components/expand-on-hover/ExpandOnHover.tsx`
- Props: `animation` ("spring"), `variant` ("modern"), `expandHeight` (440), `collapsedHeight` (64), `borderRadius` (20), `gap` (12)

### Text Shuffle — `text-shuffle`

A text animation component that shuffles characters with multiple variants including cipher, scramble, and typewriter effects.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/text-shuffle.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/text-shuffle/TextShuffle.tsx`
- Props: `variant` ("blurReveal"), `duration` (2200), `transition` (700), `loop` (true), `pauseOnHover` (false), `cursorBlink` (false), `uppercase` (false), `outline` (false), `fontSize` ("clamp(2.5rem,8vw,6rem)")

### Cards — `cards`

A fanned deck of dark editorial cards with B&W images, prismatic top-border highlights, spring-physics animations, and an expand-on-click description reveal.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/cards.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/Cards.tsx`
- Props: `className`, `spacing` (230), `perspective` (true)

### Simple Card — `simple-card`

A single dark editorial card with a padded B&W image, prismatic top-border highlight, Instrument Serif title pinned to the bottom, and an expand-on-click description reveal.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/simple-card.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/SimpleCard.tsx`
- Props: `title` ("Working Knowledge"), `description` ("Practical skills and insights gained through hands-on experience."), `imageUrl`, `accent` ("from-transparent to-transparent"), `topBorderColor` ("#FFFFFF2E"), `className`

### Flickering Grid Playground — `flickering-grid-playground`

An interactive cockpit controller playground for experimenting with grid sizing, gaps, flicker chance, and curated presets.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/flickering-grid-playground.json`
- Source: `packages/ui/src/animated/FlickeringGrid.tsx`
- Props: `squareSize` (4), `gridGap` (6), `flickerChance` (0.3), `color` ("#6b7280"), `maxOpacity` (0.4), `className`

### Dot Pattern Playground — `dot-pattern-playground`

An interactive cockpit controller playground for dynamic dot sizes, gaps, custom swatches, and interactive spotlight masking.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/dot-pattern-playground.json`
- Source: `packages/ui/src/animated/DotPattern.tsx`
- Props: `width` (16), `height` (16), `cx` (1), `cy` (1), `cr` (1), `className`

### Animated Icons 1 — `animated-icons-1`

Nine Tabler icons in small monochrome black cards. Click any card to fire its unique animation — triple spin, nuclear collapse, hex facet snap, supernova burst, lemniscate shudder, glitch disintegrate, lightning strike, helix flip, or vortex implosion. Pure monochrome, no color, no shadows.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/animated-icons-1.json`
- Depends on: `framer-motion`, `@tabler/icons-react`
- Source: `packages/ui/src/animated/Loaders1.tsx`
- Props: `cardSize` (160), `iconSize` (48), `className`

### Marquee — `marquee`

An infinite scrolling marquee section utilizing custom edit-dashed cards and compact icon tiles with speed, direction, and corner blur settings.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/marquee.json`
- Depends on: `framer-motion`, `@tabler/icons-react`
- Source: `packages/ui/src/animated/Marquee.tsx`
- Props: `variant` ("default"), `cardVariant` ("dashed"), `direction` ("right-to-left"), `speed` (25), `blurCorners` (true), `pauseOnHover` (true)

### Marquee 2 — `marquee-2`

An infinite curved path marquee section animating official colored brand icons along a custom bezier SVG path.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/marquee-2.json`
- Depends on: `framer-motion`, `devicons-react`
- Source: `packages/ui/src/animated/Marquee2.tsx`
- Props: `variant` ("wave"), `showTitleOnHover` (true), `speed` (1), `pauseOnHover` (true)

### Accordion — `accordion`

Sections that open in place. Switching is one movement: one section folds as the next opens; the open card lifts a touch, its chevron socket sinks, and the content settles in a beat behind. Separated cards or one joined card; full keyboard support.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/accordion.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/Accordion.tsx`
- Props: `variant` ("separated"), `allowMultiple` (false)

### Sticker Card — `sticker-card`

An interactive card that scatters bouncy physics-based stickers all over the viewport on hover.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/sticker-card.json`
- Depends on: `framer-motion`, `lucide-react`, `@tabler/icons-react`
- Source: `packages/ui/src/animated/StickerCard.tsx`
- Props: `numStickers` (7)

### Datepicker — `datepicker`

A skeuomorphic 3D beveled calendar date picker with synth mechanical click sound feedback.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/datepicker.json`
- Depends on: `framer-motion`, `@tabler/icons-react`
- Source: `packages/ui/src/animated/Datepicker.tsx`
- Props: `glowColor` ("none")

### NavBar1 — `navbar-1`

A floating horizontal navigation panel console with sliding tabs, active status glows, and search well.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/navbar-1.json`
- Depends on: `framer-motion`, `@tabler/icons-react`
- Source: `packages/ui/src/animated/NavBar1.tsx`
- Props: `statusColor` ("emerald"), `className`

### ForgeUI Landing — `forgeui-landing`

Sleek dark landing page hero section with radial spotlights, customizable calls to action, and interactive social/tech stack footer.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/forgeui-landing.json`
- Depends on: `lucide-react`, `framer-motion`
- Source: `packages/ui/src/animated/ForgeUILanding.tsx`
- Props: `forgeUiUrl` ("https://forgeui.in"), `onDocumentation`, `className`

### Rays Landing — `rays-landing`

Interactive portfolio landing page showcasing an overhead WebGL light-ray beam background, floating liquid-glass navigation, and role cycler.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/rays-landing.json`
- Depends on: `lucide-react`
- Source: `packages/ui/src/animated/RaysLanding.tsx`
- Props: `name` ("Ajinkya"), `raysColor` ("#ffffff"), `raysSpeed` (1), `lightSpread` (1), `rayLength` (2), `followMouse` (true)

### Chalkboard 404 — `chalkboard-404`

A 404 on a chalkboard set in a raised frame: the digits have fallen onto the chalk ledge and dashed chalk outlines show where they go. Drag the 4, 0 and 4 back (or press Enter on each) and an eraser wipes the slate white before sending you home.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/chalkboard-404.json`
- Depends on: `framer-motion`, `roughjs`, `opentype.js`
- Source: `packages/ui/src/animated/ChalkboardNotFound.tsx`
- Props: `title` ("this page doesn't exist yet."), `subtitle` ("maybe one day."), `hint` ("put them back"), `font` ("caveat"), `chalkColor` ("#ecebe4"), `boardColor` ("#1b201d")

### Polaroid Develop — `polaroid-develop`

Polaroid prints scattered down a table that develop as you scroll: murky chemistry clears from the centre out, a cool cast warms into full colour, a sheen slides across, and the caption is written in ink stroke by stroke. Prints swing and lag with scroll speed and straighten on hover.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/polaroid-develop.json`
- Depends on: `framer-motion`, `opentype.js`
- Source: `packages/ui/src/animated/PolaroidDevelop.tsx`
- Props: `title` ("Let them develop."), `subtitle` ("Scroll slowly. Every photo takes a moment to come back."), `eyebrow` ("Roll 07 · Summer"), `font` ("caveat"), `inkColor` ("#22304f"), `tableColor` ("#17140f"), `maxTilt` (6), `drift` (1), `redevelop` (false)

### Breathing Scale Card — `breathing-scale-card`

An ambient scale card component featuring overshooting corner border lines, a soft vignette mask, breathing backlight glows, and sweeping geometric pattern animations.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/breathing-scale-card.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/BreathingScaleCard.tsx`
- Props: `preset` ("indigo"), `patternVariant` ("diagonal"), `duration` (7), `patternSize` (10), `vignette` (true)

### GitHub Heatmap — `github-heatmap`

An ultra-polished GitHub contribution heatmap featuring live data fetching for @ajinkya-cell, streak stats, theme presets, interactive tooltips, and month focus filtering.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/github-heatmap.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/GithubHeatmap.tsx`
- Props: `username` ("ajinkya-cell"), `preset` ("emerald"), `showStats` (true), `showLegend` (true), `showMonthLabels` (true), `showDayLabels` (true)

### Developer ID Card — `developer-id-card`

An ultra-polished, feature-packed 3D Developer ID Card featuring GitHub profile image, live local clock, tech stack badges, social links, and 3D metallic presets.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/developer-id-card.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/DeveloperIdCard.tsx`
- Props: `name` ("Ajinkya"), `username` ("ajinkya-cell"), `role` ("Full-Stack Engineer & UI Architect"), `location` ("San Francisco, CA"), `bio` ("Architecting high-performance UI systems, agentic coding workflows, and futuristic web interfaces."), `preset` ("obsidian-gold"), `statusBadge` ("AVAILABLE FOR HIRE"), `showClock` (true), `cornerAccent` (true)

### Sidebar — `sidebar`

An app sidebar built from the primitives: a Drawer on the native <dialog> when it overlays the page, or the same raised panel docked inline. Nav inside, with collapsible sections and a current-page segment that glides between items; plan card and profile in a footer tray.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/sidebar.json`
- Depends on: `framer-motion`, `lucide-react`
- Source: `packages/ui/src/animated/Sidebar.tsx`
- Props: `isOpen` (true), `onClose`, `side` ("left"), `inline` (false), `children`, `className`

### Command Palette — `command-palette`

A ⌘K command palette on a native dialog: search set into a raised panel, results in a recessed tray, and a highlight that rises out of the tray and glides between rows.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/command-palette.json`
- Depends on: `framer-motion`, `lucide-react`
- Source: `packages/ui/src/animated/CommandPalette.tsx`
- Props: `isOpen` (true), `onClose`, `placeholder` ("Search components, actions and links…"), `inline` (false), `onNavigate`, `items`, `className`

### Switch — `switch`

Two switches in one: the original mechanical 3D rocker with its LED, and a machined variant from the design system, where the thumb rises into the light popout surface when on and stretches towards its travel as you press.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/switch.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/Switch.tsx`
- Props: `variant` ("rocker"), `checked` (true), `disabled` (false), `size` ("md"), `label` ("Security Protocol"), `description` ("Enable 2FA Hardware Shield")

### Tooltip — `tooltip`

Magnetic Hologram Tooltip featuring 3D parallax tracking with mouse cursor position, glowing neon border, and frosted glass backdrop blur.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/tooltip.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/Tooltip.tsx`
- Props: `content`, `children`, `side` ("top"), `align` ("center"), `delay` (150), `className`

### Timeline — `timeline`

Circuit Path Timeline featuring traveling laser light pulses along connecting circuit lines and illuminated 3D debossed milestone node checkpoints.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/timeline.json`
- Depends on: `framer-motion`, `lucide-react`
- Source: `packages/ui/src/animated/Timeline.tsx`
- Props: `steps`, `currentStep` (2), `onStepChange`, `className`

### Globe — `globe`

A minimal monochrome 3D WebGL globe powered by cobe. Dark obsidian sphere with high-resolution world map sampling, atmospheric glow, and smooth drag rotation.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/globe.json`
- Depends on: `cobe`
- Source: `packages/ui/src/animated/Globe.tsx`
- Props: `className`

### Bento Grid — `bento-grid`

A dark Bento Grid with Inter typography, unboxed brand icons, and beveled or radiant card variants.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/bento-grid.json`
- Depends on: `framer-motion`, `devicons-react`
- Source: `packages/ui/src/animated/BentoGrid.tsx`
- Props: `variant` ("beveled")

### Meter — `meter`

Minimalist precision sentiment meter & gauge with automatic mount sweep calibration, dynamic sentiment colors, and real-time synchronized numerical counter.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/meter.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/Meter.tsx`
- Props: `value` (45)

### Stacked Card Fan — `stacked-card-fan`

Three SimpleCards held like a hand of cards that stay stacked until you scroll, then glide out smoothly with your scroll on spring physics.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/stacked-card-fan.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/animated/stacked-card-fan.tsx`

---

## Backgrounds

### Pixel Melt — `pixel-melt`

A full-viewport pixel grid that glows and cools under cursor heat, leaving behind a slow melt trail.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/pixel-melt.json`
- Source: `packages/ui/src/backgrounds/PixelMelt.tsx`
- Props: `pixelSize` (12), `meltSpeed` (1), `interactive` (true), `className`

### Breathing Grid — `breathing-grid`

An orthogonal grid with a slow left-to-right traveling wave, with local brightness boost near the cursor.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/breathing-grid.json`
- Source: `packages/ui/src/backgrounds/BreathingGrid.tsx`
- Props: `gridSize` (40), `baseOpacity` (0.1), `cycleDuration` (8000), `className`

### Breathing Background — `breathing-background`

An atmospheric sweeping pattern background with breathing backlight glow, vignette layer, and dynamic pattern options (diagonal, stripes, dots, grid).

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/breathing-background.json`
- Depends on: `framer-motion`
- Source: `packages/ui/src/backgrounds/BreathingBackground.tsx`
- Props: `preset` ("indigo"), `patternVariant` ("diagonal"), `duration` (8), `patternSize` (16), `angle` (315), `vignette` (true)

### Floating Embers — `floating-embers`

Glowing ember particles that float upward with a gentle sway, reacting subtly to cursor and scroll.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/floating-embers.json`
- Source: `packages/ui/src/backgrounds/FloatingEmbers.tsx`
- Props: `maxParticles` (400), `mouseRadius` (200), `mouseForce` (0.02), `className`

### Spotlight Grid — `spotlight-grid`

A dark grid with decorative tech icons and a dual-layer mouse-following spotlight effect using screen and color-dodge blend modes.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/spotlight-grid.json`
- Source: `packages/ui/src/backgrounds/SpotlightGrid.tsx`
- Props: `children`

### Lumina Wave — `lumina-wave`

An atmospheric WebGL background rendering undulating wave patterns resembling an aurora, featuring interactive mouse-bending and color personalization.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/lumina-wave.json`
- Source: `packages/ui/src/backgrounds/LuminaWave.tsx`
- Props: `speed` (1), `intensity` (1), `colorPrimary` ("#2563eb"), `colorSecondary` ("#6610f2"), `quality` ("medium"), `mouseReactivity` (1), `className`

### Matrix Rain — `matrix-rain`

A canvas-driven digital rain simulation displaying streaming glowing characters and icons in a premium monochrome aesthetic.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/matrix-rain.json`
- Source: `packages/ui/src/backgrounds/MatrixRain.tsx`
- Props: `speed` (1), `density` (1), `fontSize` (16), `decayRate` (0.05), `glowStrength` (8), `opacity` (0.35), `color` ("#525252"), `glowColor` ("#ffffff")

### Matrix Ripple Background — `matrix-ripple-background`

A full-screen canvas of faint, slowly mutating characters. Clicking or tapping anywhere sends out a circular wave.

- Install: `npx shadcn@latest add https://void-ui-phi.vercel.app/r/matrix-ripple-background.json`
- Source: `packages/ui/src/animated/matrix-ripple-background.tsx`

