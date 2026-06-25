# Design Spec: Lumina Wave WebGL Background

This document outlines the design specification for porting the Stitch "Shader" screen to a highly customizable and interactive React WebGL component named `LuminaWave` inside the `@adgrid/ui` package.

## Goal
Create an atmospheric, high-performance background component that renders undulating waves resembling an aurora glow. The component should expose React props to adjust speed, intensity, colors, and quality, and support interactive mouse bending.

---

## 1. Component Props & API

The React component `LuminaWave` will support the following properties:

```typescript
export interface LuminaWaveProps {
  speed?: number;          // Speed multiplier for the animation (default: 1.0)
  intensity?: number;      // Brightness/contrast multiplier of the wave lines (default: 1.0)
  colorPrimary?: string;   // Hex color for the primary wave (default: "#2563eb")
  colorSecondary?: string; // Hex color for the secondary wave (default: "#6610f2")
  quality?: "high" | "medium" | "low"; // Downscaling resolution factor (default: "medium")
  mouseReactivity?: number; // Strength of mouse bend influence (default: 0.5, 0 to disable)
  className?: string;      // Custom wrapper CSS class
}
```

---

## 2. Shader Logic & Uniforms

### Vertex Shader
Standard screen-space vertex shader mapping canvas coordinates:
```glsl
attribute vec2 position;
varying vec2 v_texCoord;

void main() {
  v_texCoord = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
```

### Fragment Shader
Extends the original screen shader by parameterized uniforms for color and interactivity, including mouse bend logic:
```glsl
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_intensity;
uniform float u_mouse_reactivity;
uniform vec3 u_color_primary;
uniform vec3 u_color_secondary;
varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    vec2 mouse_pos = u_mouse / u_resolution;
    
    // Interactive mouse bending: bend waves based on distance from mouse cursor
    if (u_mouse_reactivity > 0.0) {
        float dist = length(uv - mouse_pos);
        float bend = exp(-dist * 4.0) * u_mouse_reactivity;
        uv += (uv - mouse_pos) * bend * 0.08;
    }
    
    vec3 color = vec3(0.0);
    float time = u_time * u_speed;
    
    // Create multiple sine waves for aurora effect
    for(float i = 1.0; i < 5.0; i++) {
        uv.x += 0.3 / i * sin(i * 3.0 * uv.y + time * 0.5);
        uv.y += 0.3 / i * cos(i * 3.0 * uv.x + time * 0.5);
        
        float dist = abs(uv.y - 0.5 + 0.1 * sin(uv.x * 5.0 + time));
        float intensity = 0.01 / dist;
        
        // Dynamically mix user-supplied colors
        vec3 auroraColor = u_color_primary;
        if(mod(i, 2.0) == 0.0) {
            auroraColor = u_color_secondary;
        }
        
        color += auroraColor * intensity;
    }
    
    // Background dimming
    color *= 0.5 + 0.5 * sin(time * 0.2);
    
    gl_FragColor = vec4(color * 0.8 * u_intensity, 1.0);
}
```

---

## 3. WebGL Lifecycle & Performance

### Color Utility
A helper function parses hex string colors into normalized RGB arrays:
```typescript
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return [r, g, b];
}
```

### Performance Presets (Quality)
To balance visual fidelity and frame rate on high-DPI displays, the canvas internal resolution scales based on the `quality` prop:
*   `high`: Scale factor = `1.0`
*   `medium`: Scale factor = `0.75`
*   `low`: Scale factor = `0.5`

### Event Listeners & Damping
*   **Mouse Coordinates**: Mouse coordinates are tracked relative to the canvas bounding box and normalized, with linear interpolation (easing) applied to `u_mouse` to ensure smooth movement transitions.
*   **Resize Observer**: Listens to viewport size changes and resizes the WebGL drawing-buffer.

---

## 4. Reduced Motion Fallback
If the user prefers reduced motion, the WebGL loop is skipped to conserve resources. Instead, a CSS radial gradient using the configured colors is rendered:
```css
radial-gradient(ellipse at 50% 50%, colorPrimary + "22" 0%, colorSecondary + "11" 50%, #000000 100%)
```

---

## Verification Plan

### Automated Checks
*   Build the library (`pnpm build` or `turbo run build`) to verify TypeScript compilations and WebGL configurations.
*   Lint the files to ensure formatting alignment.

### Manual Verification
*   Test prop combinations: check customized color blending, speed adjustments, and mouse reactivity.
*   Verify reduced-motion behavior.
