<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Every new component goes into the presentation

Whenever the user gives you a component to add (a page, hero, background, widget, anything), it is not done until it shows up in `/present` like every other component. Never ship it as a standalone page or app route only. Do all of these:

1. **Library**: put the component in `packages/ui/src/<animated|primitives|backgrounds|...>/<Name>.tsx`. Start the file with `"use client"`. Don't use Next-only APIs (`next/image`, `next/font`); use plain `<img>` and load fonts through a `<style>@import</style>`. Put tweakable values on props with sensible defaults.
2. **Export**: add the component and its `Props` type to `packages/ui/src/index.ts`.
3. **Registry**: add an entry to `apps/docs/src/registry/index.ts` with `name`, `slug`, `category`, `description`, `dependencies`, `packagePath`, `files`, `presentationStrategy` (`fullscreen` for pages/heroes/backgrounds, `center` for small components) and `propDefs` for the Props Tweaker panel.
4. **Presentation group**: add the slug to the right group in `apps/docs/src/components/presentation/presentation-registry.ts` (Inputs, Buttons, Feedback & Overlays, Navigation, Data Display, Cards, Text & Icons, Media & Motion, Backgrounds, Pages).
5. **Renderer**: import it in `apps/docs/src/components/presentation/PresentationRenderer.tsx` and add a `case "<slug>":` that renders it with `{...liveProps}`.
6. **New badge**: add the slug to the front of `NEW` in `apps/docs/src/components/presentation/SidebarItem.tsx`.
7. **Assets**: images and other static files go in `apps/docs/public/<slug-or-name>/`.
8. **Registry JSON**: from `apps/docs`, run `npx tsx scripts/build-registry.ts` to regenerate `public/r/`.
9. **Verify**: typecheck `packages/ui` and `apps/docs` (`npx tsc --noEmit`), then confirm `http://localhost:3000/present/<slug>` returns 200 and renders. Use the user's running dev server; don't start a second `next dev` in this folder, because Next allows only one per project.

Reference example: `polaroid-develop` (`packages/ui/src/animated/PolaroidDevelop.tsx`) touches every step above.
