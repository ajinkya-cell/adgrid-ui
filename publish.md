# Steps to Publish void-ui to NPM

## 1. Login to NPM

```bash
npm login
```

Follow the prompts in your browser/terminal to authenticate.

## 2. Re-build the Workspace

```bash
pnpm build
```

This ensures everything compiles cleanly and all void-ui package files are up-to-date in `dist/`.

## 3. Publish the Package

**Option A — Monorepo release script (from root):**

```bash
pnpm release
```

**Option B — Manual publish (navigate to package folder):**

```bash
cd packages/cli
pnpm publish --access public
```

For a full summary of the CLI implementation details, view `walkthrough.md`.
