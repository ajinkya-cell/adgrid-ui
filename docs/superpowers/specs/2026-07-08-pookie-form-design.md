# Design Spec: Pookie Form Component

**Date**: 2026-07-08  
**Status**: Approved  

---

## 1. Goal

Refine the **PookieForm** component to deliver a premium, physical 3D aesthetic:
1. **Typography**: Force the font-family to **Plus Jakarta Sans** (regular and bold weights).
2. **Card Borders & 3D styling**: Change the card border to be top-and-bottom only (`border-y`) and apply a deep layered box shadow.
3. **Input Depth**: Implement a carved/recessed depth effect inside inputs similar to the props sidebar.
4. **Mechanical Button**: Build a clicky 3D submit button that physically compresses (`translate-y` and `border-b` compression) on click.

---

## 2. API & Props

```typescript
export interface PookieFormField {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "textarea";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  validation?: (value: string) => { valid: boolean; error?: string };
}

export interface PookieFormProps {
  title?: string;
  serialNumber?: string;
  buttonText?: string;
  fields?: PookieFormField[];
  footerText?: string;
  backgroundColor?: string;
  paperTexture?: boolean;
  showScrews?: boolean;
  shadowIntensity?: "low" | "medium" | "high";
  rounded?: "sm" | "md" | "lg" | "xl" | "none";
  onSubmit?: (data: Record<string, string>) => void | Promise<void>;
  className?: string;
}
```

---

## 3. Style Updates (Tailwind v4 / CSS)

### 3.1 Font Family
Inject locally to override default system fonts:
```css
.pookie-form-container, .pookie-form-container * {
  font-family: var(--font-plus-jakarta), sans-serif !important;
}
```

### 3.2 Card Layout & 3D Shadow
*   **Borders**: `border-y border-black/[0.12]` (side borders removed).
*   **Shadow**:
    ```tsx
    shadow-[0_30px_70px_rgba(0,0,0,0.08),inset_0_1.5px_0_rgba(255,255,255,0.9),inset_0_-2px_6px_rgba(0,0,0,0.04)]
    ```

### 3.3 Input Depth Effect
*   **Background**: `#EBE8DD`
*   **Shadow**:
    ```tsx
    shadow-[inset_0_3px_6px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.6)]
    ```

### 3.4 3D Mechanical Button
*   **Initial Bevel & Shadow**: `border-x border-t border-black/[0.08] border-b-[5px] border-black/22 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]`
*   **Hover**: `-translate-y-[1px] border-b-[6px] bg-[#FAF9F5]`
*   **Active (Compressed)**: `translate-y-[4px] border-b-[1px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]`
