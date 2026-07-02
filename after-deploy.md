# After Deploy Checklist

Once you deploy the docs site (Vercel or anywhere), do the following:

---

## 1. Replace the domain in 2 files

Swap `https://void-ui.vercel.app` with your actual deployed URL.

**File 1** — `apps/docs/src/app/r/registry.json/route.ts`
```ts
homepage: "https://your-actual-domain.com",
```

**File 2** — `apps/docs/scripts/build-registry.ts`
```ts
homepage: "https://your-actual-domain.com",
```

---

## 2. Regenerate static registry files

```bash
pnpm build:registry
```

This rebuilds `apps/docs/public/r/*.json` with the correct domain.

---

## 3. Redeploy

Push the changes and redeploy so the updated static files go live.

---

## 4. Test it works

From any project that has shadcn set up, run:

```bash
# Add the registry (one-time per project)
pnpm dlx shadcn@latest registry add @voidui=https://your-actual-domain.com/r/{name}.json

# Install a component
pnpm dlx shadcn@latest add @voidui/void-button

# Install a multi-file component
pnpm dlx shadcn@latest add @voidui/dot-matrix
```

You can also verify the endpoints directly in the browser:
- `https://your-actual-domain.com/r/registry.json` — should return the full catalog
- `https://your-actual-domain.com/r/void-button.json` — should return single file component
- `https://your-actual-domain.com/r/dot-matrix.json` — should return 10 files

---

## Notes

- If Vercel auto-assigns `void-ui.vercel.app` as the domain, no changes needed at all.
- The `/api/registry/[slug]` old route is still live for backward compatibility — do not delete it.
- To add a new component later: add it to `apps/docs/src/registry/index.ts`, add the source file to `packages/ui/src/`, then run `pnpm build:registry` and redeploy.
