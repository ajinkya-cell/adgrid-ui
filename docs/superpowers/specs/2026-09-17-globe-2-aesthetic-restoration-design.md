# Globe 2: Photorealistic Earth Restoration & Aesthetic Lighting Rig

**Date:** 2026-09-17  
**Status:** Approved  
**Target:** `packages/ui/src/animated/Globe2.tsx`, `apps/docs/src/registry/index.ts`

---

## 1. Goal & Aesthetic Direction

Restore **Globe 2** (`Globe2`) into a premium, photorealistic 3D WebGL globe combining orbital NASA Earth satellite imagery with tangible mountain topography and dual-sided cinematic studio lighting:

1. **Colours From Everywhere**:
   - Primary daytime diffuse map from `earth-day.jpg` capturing lush continental greens, arid desert sands, glacial polar ice caps, and deep azure oceans.
   - Night city lights from `earth-lights.png` seamlessly blended across the shadow hemisphere and twilight terminator.
2. **Tactile Bumpy Texture**:
   - 4K elevation heightmap (`earth-bump.png`) combined with ocean specular masking (`earth-specular.jpg`) to produce crisp topographical relief across major mountain chains (Himalayas, Andes, Rockies, Alps).
3. **Dual-Sided Lighting Rig ("Light on Both Sides")**:
   - Key Sunlight (`[5, 3, 4]`, intensity `2.6`, `#ffffff`): Powers the daytime hemisphere and grazing terrain shadows.
   - Rim Fill Light (`[-5, 1, -3]`, intensity `1.4`, `#93c5fd`): Illuminates the opposite curvature and silhouette so neither side is lost in complete blackness.
   - Space Ambient (`intensity: 0.25`, `#1e293b`): Preserves deep space contrast.
4. **3D Celestial Atmospheric Halo ("Nice Glow")**:
   - Concentric outer sphere (`args={[2.08, 64, 64]}`) with a `THREE.BackSide` Fresnel additive shader providing a smooth, camera-independent glow around the globe's perimeter.
   - Inner Rayleigh rim scattering on the sphere horizon.
5. **Multi-Mode Support**:
   - `realistic` (default): Full-color daytime Earth + night city lights + cyan atmospheric halo.
   - `monochrome`: Carbon obsidian oceans + platinum continents + silver halo.
   - `midnight`: Deep midnight sapphire + steel-blue continents + ice-blue halo.

---

## 2. Technical Architecture

### 2.1 Texture Pipeline
- `dayMap`: `apps/docs/public/earth-day.jpg` (2048×1024)
- `bumpMap`: `apps/docs/public/earth-bump.png` (4096×2048)
- `specularMap`: `apps/docs/public/earth-specular.jpg` (2048×1024)
- `lightsMap`: `apps/docs/public/earth-lights.png` (2048×1024)

### 2.2 Shader Implementation
In `GlobeMesh`:
- Shader uniforms:
  - `uDayMap`: `THREE.Texture`
  - `uLightsMap`: `THREE.Texture`
  - `uSpecularMap`: `THREE.Texture`
  - `uSunDirection`: normalized sun light vector
  - `uAtmosphereColor`: `vec3`
  - `uMode`: int (`0: realistic`, `1: monochrome`, `2: midnight`)
  - `uShowLights`: float (`1.0` or `0.0`)
- Normal and lighting computation:
  - Compute sun dot product `sunDot = dot(vNormal, uSunDirection)`.
  - Calculate daytime diffuse color with mountain elevation highlights.
  - Calculate nighttime city lights with golden tint (`vec3(1.0, 0.88, 0.65)`), blended via `1.0 - smoothstep(-0.25, 0.15, sunDot)`.
  - Add inner atmospheric rim Fresnel on the perimeter.

### 2.3 Outer 3D Atmospheric Halo
- Sphere mesh scaled `1.04` relative to globe radius `2.0`.
- Vertex shader transforms normals and positions into view space.
- Fragment shader computes `fresnel = 1.0 - max(0.0, dot(vNormal, normalize(-vPosition)))` with exponent `3.5` and intensity `0.75`.
- Rendered with `side: THREE.BackSide`, `blending: THREE.AdditiveBlending`, `depthWrite: false`.

---

## 3. Component Interface (`Globe2Props`)
```typescript
export interface Globe2Props {
  mode?: "realistic" | "monochrome" | "midnight";
  bumpScale?: number;
  showAtmosphere?: boolean;
  showLights?: boolean;
  atmosphereColor?: string;
  dayMapUrl?: string;
  bumpMapUrl?: string;
  specularMapUrl?: string;
  lightsMapUrl?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  interactive?: boolean;
  enableZoom?: boolean;
  minDistance?: number;
  maxDistance?: number;
  fov?: number;
  className?: string;
  style?: React.CSSProperties;
}
```
