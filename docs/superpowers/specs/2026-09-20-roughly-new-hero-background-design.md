# Roughly New Hero Background Image Specification

## 1. Overview
Update the full-screen desktop hero background on the `/roughly` documentation page to use the newly provided stationery and drafting illustration:
`apps/docs/public/previews/new-roughly.png` (served via `/previews/new-roughly.png`).

---

## 2. Visual & Architectural Details

### 2.1 Asset Characteristics
- **File**: `apps/docs/public/previews/new-roughly.png` (1.45 MB, 16:9 composition).
- **Art Style**: High-fidelity 3D isometric composition featuring parchment books, red and blue drafting pens, wooden pencils, binder clips, drafting sketches, and architectural primitives surrounding an open pitch-black void.
- **Center Void**: The center of the image is naturally pitch black, perfectly framing the dynamic `<Roughly type="circle">Roughly</Roughly>` title, description copy, and the tactile action row.

### 2.2 Integration Details
In `apps/docs/src/app/roughly/page.tsx`:
- Replace `src="/previews/roughly.png"` with `src="/previews/new-roughly.png"`.
- Update `alt` attribute to reflect the new stationery composition: `alt="Roughly Hand-drawn Vector Annotations - Drafting & Stationery Artwork"`.
- Retain the soft bottom dissolve (`<div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none" />`) so the scene smoothly transitions into `#09090b` when the user scrolls into the Interactive Studio Playground.

---

## 3. Verification Plan
1. **HTTP Verification**: Confirm `/previews/new-roughly.png` serves HTTP 200 with matching byte size.
2. **Visual Verification**: Confirm the new 3D stationery artwork frames the hero scene and aligns crisply with the centered content.
3. **Build Verification**: Run `pnpm turbo build --filter docs` to guarantee 0 static compilation or Next.js build errors.
