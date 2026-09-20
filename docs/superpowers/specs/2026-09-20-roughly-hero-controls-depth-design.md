# Roughly Hero Action Bar Design: VoidButton & Tactile Depth Console

## 1. Overview
Elevate the install and copy action row in the `/roughly` full-screen desktop hero by:
1. Replacing the generic copy button with the signature **Default VoidButton** from `@adgrid-ui/ui`.
2. Infusing the `pnpm add @adgrid-ui/ui` capsule with physical tactile depth, utilizing a recessed console aesthetic, dual-rim specular highlights, and a micro-socketed terminal icon.

---

## 2. Component Design & Aesthetics

### 2.1 Default VoidButton Integration
- **Component**: `VoidButton` from `@adgrid-ui/ui`.
- **Variant**: `variant="default"`.
- **Dimensions**: `h-11 px-4 text-xs font-mono rounded-xl` to match the baseline height and curvature of the adjacent command capsule.
- **Built-in Capabilities**:
  - Interactive cursor-following spotlight mask (`maskTemplate`) revealing metallic sheen.
  - Tactile Web Audio synthesizer click sound on press (`sine` ramp).
  - High-stiffness spring scale down (`0.93`) on press.
  - Layered bevel shadow: `inset 0 1.5px 0 0 rgba(255, 255, 255, 0.12), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 4px 14px rgba(0, 0, 0, 0.6)`.
- **Content**:
  - Idle: `<Copy className="w-3.5 h-3.5 text-neutral-400" /> <span>Copy</span>`.
  - Copied state: `<Check className="w-3.5 h-3.5 text-emerald-400" /> <span className="text-emerald-300">Copied!</span>`.

### 2.2 Tactile Recessed Console Capsule (`pnpm add @adgrid-ui/ui`)
- **Structure**:
  - Outer well: `h-11 px-4 rounded-xl bg-[#0c0c0f]/90 backdrop-blur-xl border border-white/10`.
  - Depth lighting model:
    - Inner cavity deboss: `boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.9), inset 0 -1px 0 rgba(255, 255, 255, 0.06), 0 8px 20px -2px rgba(0, 0, 0, 0.7)"`.
    - Specular micro-rim: hairline gradient line (`absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent`).
  - Terminal Icon Socket:
    - Micro-well (`w-5 h-5 rounded-md bg-black/60 border border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]`).
    - Violet/Indigo terminal icon: `<Terminal className="w-3 h-3 text-indigo-400" />`.
  - Typography:
    - Subdued command: `<span className="text-neutral-400 select-none">pnpm add</span>`.
    - Emphasized package: `<span className="text-white font-medium">@adgrid-ui/ui</span>`.
  - Interaction: Can be clicked or text-selected (`select-all cursor-pointer`) with copy action.

---

## 3. Visual Harmony & Geometry
By matching both elements to `h-11` with `rounded-xl`, they create an intentional architectural contrast:
- **Command Capsule**: Sunken, recessed well (chassis level).
- **VoidButton**: Elevated, illuminated 3D mechanical button (tactile trigger).

---

## 4. Verification Plan
1. **Visual & Alignment Verification**: Confirm both elements align on the same horizontal baseline with identical `44px` (`h-11`) height.
2. **Tactile Interaction**: Verify `VoidButton` mechanical sound, cursor spotlight, and click compression work seamlessly.
3. **Copy Functionality**: Verify clicking `VoidButton` or command capsule copies `"pnpm add @adgrid-ui/ui"` to clipboard and reveals `"Copied!"` badge.
4. **Automated Build**: Run `pnpm turbo build --filter docs` to guarantee 0 build or TypeScript errors.
