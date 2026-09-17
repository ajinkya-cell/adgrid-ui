# Globe 2: Tactile Mountain Topography & Subtle Ambient Glow

**Date:** 2026-09-16  
**Status:** Approved  
**Target:** `packages/ui/src/animated/Globe2.tsx`, `apps/docs`

---

## 1. Goal & Aesthetic Direction

Elevate **Globe 2** (`Globe2`) into a premium 3D WebGL globe featuring:
1. **Tactile Mountain & Continental Texture**: Rich topographical definition across major mountain ranges (Himalayas, Andes, Rockies, Alps) using the 4K elevation heightmap with crest highlights and dynamic normal grazing shadows.
2. **Subtle All-Around Glow (Atmosphere)**: A seamless, soft celestial halo that softly envelops the entire perimeter of the globe using a custom back-side additive Fresnel shader (`1.03x` scale, smooth exponential falloff) with zero hard edges or detached ring artifacts.
3. **Dual Curated Modes**:
   - `monochrome` (default): Matte carbon/obsidian ocean (`#090a0f`), luminous silvery-platinum continents (`#f1f5f9`), crisp mountain ridges (`#ffffff`), and a soft pearl-white glow (`#e2e8f0`).
   - `default`: Midnight sapphire ocean (`#101e38`), steel-blue continents (`#82a4d4`), and a celestial ice-blue glow (`#38bdf8`).
4. **Clean Presentation**: Zero harsh specular glare dots (`totalSpecular = vec3(0.0)`), zero latitude/longitude graticule lines.

---

## 2. Technical Architecture

### 2.1 Mountain & Relief Texture
- **Elevation Sampling**: Sample `earth-bump.png` (4K heightmap) in the fragment shader.
- **Topographical Gradient**:
  ```glsl
  float elevVal = texture2D(bumpMap, vBumpMapUv).r;
  vec3 styledLand = mix(uLandColor, vec3(1.0), smoothstep(0.05, 0.70, elevVal) * 0.55);
  ```
- **Physical Bump Mapping**: `bumpScale: 0.08`, `roughness: 0.70`, `metalness: 0.0` on `MeshStandardMaterial` for natural surface grazing shadows as directional light glides across peaks.
- **Continent Separation**: Sample `earth-specular.jpg` (2K mask) to cleanly divide ocean (`waterVal > 0.5`) from land with smooth anti-aliasing (`smoothstep(0.42, 0.58, waterVal)`).

### 2.2 Subtle All-Around Atmospheric Glow
- **Concentric Halo Geometry**: Outer sphere scaled `1.03` relative to globe radius `2`.
- **Shader Pipeline**:
  - `side: THREE.BackSide`
  - `blending: THREE.AdditiveBlending`
  - `transparent: true`, `depthWrite: false`
  - Vertex shader passes view-space normal and view-space position.
  - Fragment shader computes Fresnel grazing factor:
    ```glsl
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - max(0.0, dot(vNormal, viewDir));
    float intensity = pow(fresnel, 3.8) * 0.65;
    gl_FragColor = vec4(uAtmosphereColor, 1.0) * intensity;
    ```
- **Mode-reactive Color**:
  - `monochrome`: `#e2e8f0` (pearl-silver halo)
  - `default`: `#38bdf8` (cyan/ice-blue halo)

### 2.3 Lighting Rig
- Key Directional Light: `[5, 4, 6]`, intensity `2.8`, color `#ffffff`
- Fill Directional Light: `[-5, 2, -4]`, intensity `0.9` (`#cbd5e1` in monochrome, `#93c5fd` in default)
- Ambient Light: intensity `1.4` (`#e4e4e7` in monochrome, `#cbd5e1` in default)

---

## 3. Component Interface (`Globe2Props`)
- `mode?: "monochrome" | "default"` (default: `"monochrome"`)
- `bumpMapUrl?: string` (default: `"/earth-bump.png"`)
- `waterMapUrl?: string` (default: `"/earth-specular.jpg"`)
- `autoRotate?: boolean` (default: `true`)
- `rotationSpeed?: number` (default: `0.0015`)
- `interactive?: boolean` (default: `true`)
- `enableZoom?: boolean` (default: `true`)
- `minDistance?: number` (default: `3.5`)
- `maxDistance?: number` (default: `10`)
- `fov?: number` (default: `45`)
- `className?: string`, `style?: React.CSSProperties`
