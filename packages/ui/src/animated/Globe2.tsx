"use client";

import React, { useRef, Suspense, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "../lib/utils";

export interface Globe2Props {
  /** Visual theme mode: 'realistic' (full color Earth + night city lights), 'monochrome' (black & platinum), or 'midnight' (sapphire & steel) */
  mode?: "realistic" | "monochrome" | "midnight";
  /** Surface bump elevation scale for mountain relief */
  bumpScale?: number;
  /** Whether to show nighttime city lights on dark hemisphere */
  showLights?: boolean;
  /** Whether to render outer celestial atmospheric halo */
  showAtmosphere?: boolean;
  /** Custom atmospheric glow color override */
  atmosphereColor?: string;
  /** URL to Earth day color texture */
  dayMapUrl?: string;
  /** URL to Earth elevation bump heightmap */
  bumpMapUrl?: string;
  /** URL to Earth ocean specular mask */
  specularMapUrl?: string;
  /** URL to Earth night lights texture */
  lightsMapUrl?: string;
  /** Enable automatic idle spin */
  autoRotate?: boolean;
  /** Speed of auto rotation per frame */
  rotationSpeed?: number;
  /** Allow mouse drag orbit controls */
  interactive?: boolean;
  /** Allow scroll wheel / pinch zoom */
  enableZoom?: boolean;
  /** Minimum camera zoom distance */
  minDistance?: number;
  /** Maximum camera zoom distance */
  maxDistance?: number;
  /** Camera field of view */
  fov?: number;
  /** Container CSS class name */
  className?: string;
  /** Container CSS inline styles */
  style?: React.CSSProperties;
}

// ── Curated Lighting & Atmosphere Themes ────────────────────────────────────
const THEMES = {
  realistic: {
    atmosphereColor: "#38bdf8", // Celestial ice/sky-blue glow
    ambientColor: "#0b1220",    // Deep space obsidian navy
    keyLightColor: "#ffffff",   // Pure solar white key light
    fillLightColor: "#93c5fd",  // Azure rim fill light
    keyLightIntensity: 2.6,
    fillLightIntensity: 1.4,
    ambientIntensity: 0.25,
  },
  monochrome: {
    atmosphereColor: "#e2e8f0", // Pearl silver glow
    ambientColor: "#111827",    // Deep carbon obsidian
    keyLightColor: "#ffffff",   // Pure white key light
    fillLightColor: "#94a3b8",  // Slate rim fill light
    keyLightIntensity: 2.4,
    fillLightIntensity: 1.2,
    ambientIntensity: 0.2,
  },
  midnight: {
    atmosphereColor: "#60a5fa", // Deep sapphire glow
    ambientColor: "#070c18",    // Midnight abyss
    keyLightColor: "#ffffff",   // Pure white key light
    fillLightColor: "#60a5fa",  // Sapphire rim fill light
    keyLightIntensity: 2.5,
    fillLightIntensity: 1.3,
    ambientIntensity: 0.22,
  },
} as const;

// ── 3D Celestial Atmospheric Halo (Concentric BackSide Fresnel Sphere) ──────
function AtmosphereHalo({ color }: { color: string }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
    }),
    []
  );

  useEffect(() => {
    uniforms.uColor.value.set(color);
  }, [color, uniforms]);

  return (
    <mesh>
      <sphereGeometry args={[2.08, 64, 64]} />
      <shaderMaterial
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vPosition = mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform vec3 uColor;

          void main() {
            vec3 viewDir = normalize(-vPosition);
            // On BackSide, -vNormal points towards camera
            float fresnel = 1.0 - max(0.0, dot(-vNormal, viewDir));
            float intensity = pow(fresnel, 3.4) * 0.85;
            gl_FragColor = vec4(uColor, intensity);
          }
        `}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        transparent={true}
        depthWrite={false}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// ── Fallback Sphere (rendered smoothly during Suspense load) ────────────────
function GlobeFallback({
  autoRotate,
  rotationSpeed,
}: {
  autoRotate: boolean;
  rotationSpeed: number;
}) {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (globeRef.current && autoRotate) {
      globeRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#08101e"
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
}

// ── Main Textured Globe Mesh with Dynamic Day/Night & Relief Shading ────────
interface GlobeMeshProps {
  mode: "realistic" | "monochrome" | "midnight";
  bumpScale: number;
  showLights: boolean;
  atmosphereColor?: string;
  dayMapUrl: string;
  bumpMapUrl: string;
  specularMapUrl: string;
  lightsMapUrl: string;
  autoRotate: boolean;
  rotationSpeed: number;
}

function GlobeMesh({
  mode,
  bumpScale,
  showLights,
  atmosphereColor,
  dayMapUrl,
  bumpMapUrl,
  specularMapUrl,
  lightsMapUrl,
  autoRotate,
  rotationSpeed,
}: GlobeMeshProps) {
  const globeRef = useRef<THREE.Mesh>(null);

  // Load all 4 essential Earth maps
  const [dayMap, bumpMap, specularMap, lightsMap] = useLoader(THREE.TextureLoader, [
    dayMapUrl,
    bumpMapUrl,
    specularMapUrl,
    lightsMapUrl,
  ]);

  const theme = THEMES[mode] || THEMES.realistic;
  const activeAtmosphereColor = atmosphereColor || theme.atmosphereColor;

  // Normalized sun position in world space (matching key sunlight [5, 3, 4])
  const sunDirWorld = useMemo(() => new THREE.Vector3(5, 3, 4).normalize(), []);
  const sunDirView = useMemo(() => new THREE.Vector3(), []);
  const shaderRef = useRef<{ uniforms: Record<string, THREE.IUniform> } | null>(null);

  useFrame(({ camera }) => {
    if (globeRef.current && autoRotate) {
      globeRef.current.rotation.y += rotationSpeed;
    }

    if (shaderRef.current) {
      // Convert sun vector to view space so dot(vNormal, sunDirView) stays mathematically accurate
      sunDirView.copy(sunDirWorld).applyMatrix3(camera.normalMatrix).normalize();
      if (shaderRef.current.uniforms.uSunDirView) {
        shaderRef.current.uniforms.uSunDirView.value.copy(sunDirView);
      }
      if (shaderRef.current.uniforms.uAtmosphereColor) {
        shaderRef.current.uniforms.uAtmosphereColor.value.set(activeAtmosphereColor);
      }
      if (shaderRef.current.uniforms.uMode) {
        shaderRef.current.uniforms.uMode.value = mode === "monochrome" ? 1 : mode === "midnight" ? 2 : 0;
      }
      if (shaderRef.current.uniforms.uShowLights) {
        shaderRef.current.uniforms.uShowLights.value = showLights ? 1.0 : 0.0;
      }
    }
  });

  const customMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: dayMap,
      bumpMap: bumpMap,
      bumpScale: bumpScale,
      roughness: 0.7,
      metalness: 0.05,
    });

    mat.customProgramCacheKey = () => `globe2-aesthetic-v3`;

    mat.onBeforeCompile = (shader) => {
      shaderRef.current = shader;

      shader.uniforms.uSpecularMap = { value: specularMap };
      shader.uniforms.uLightsMap = { value: lightsMap };
      shader.uniforms.uSunDirView = { value: sunDirView };
      shader.uniforms.uAtmosphereColor = { value: new THREE.Color(activeAtmosphereColor) };
      shader.uniforms.uMode = { value: mode === "monochrome" ? 1 : mode === "midnight" ? 2 : 0 };
      shader.uniforms.uShowLights = { value: showLights ? 1.0 : 0.0 };

      // Inject custom uniform declarations into fragment shader
      shader.fragmentShader =
        `
        uniform sampler2D uSpecularMap;
        uniform sampler2D uLightsMap;
        uniform vec3 uSunDirView;
        uniform vec3 uAtmosphereColor;
        uniform int uMode;
        uniform float uShowLights;
      ` + shader.fragmentShader;

      // 1. Differentiate liquid specular oceans from matte land topography
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `
        #include <roughnessmap_fragment>
        #ifdef USE_MAP
          float waterSpec = texture2D(uSpecularMap, vMapUv).r;
          // Continents: matte elevation (0.85), Oceans: liquid gloss (0.18)
          roughnessFactor = mix(0.85, 0.18, waterSpec);
        #endif
        `
      );

      // 2. Diffuse map coloration (Realistic full-spectrum vs Stylized Monochrome/Midnight)
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
        #include <map_fragment>
        #ifdef USE_MAP
          if (uMode == 1) {
            // Monochrome platinum continents on velvet obsidian ocean
            float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
            float specVal = texture2D(uSpecularMap, vMapUv).r;
            vec3 ocean = vec3(0.02, 0.03, 0.05);
            vec3 land = mix(vec3(0.88, 0.90, 0.94), vec3(1.0), lum);
            diffuseColor.rgb = mix(land, ocean, specVal);
          } else if (uMode == 2) {
            // Midnight sapphire & steel
            float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
            float specVal = texture2D(uSpecularMap, vMapUv).r;
            vec3 ocean = vec3(0.04, 0.08, 0.18);
            vec3 land = mix(vec3(0.48, 0.65, 0.88), vec3(0.78, 0.90, 1.0), lum);
            diffuseColor.rgb = mix(land, ocean, specVal);
          } else {
            // Realistic full Earth colors with calibrated vibrance
            vec3 c = diffuseColor.rgb;
            float l = dot(c, vec3(0.299, 0.587, 0.114));
            c = mix(vec3(l), c, 1.15); // +15% saturation enhancement
            c = pow(c, vec3(0.96));    // subtle contrast curve
            diffuseColor.rgb = c;
          }
        #endif
        `
      );

      // 3. Add nocturnal city lights on shadow hemisphere + inner Rayleigh horizon scattering
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `
        #ifdef USE_MAP
          // Dynamic sun illumination angle
          float sunDot = dot(normalize(vNormal), uSunDirView);

          // Blend warm city lights across dark hemisphere & twilight terminator
          float nightFactor = 1.0 - smoothstep(-0.25, 0.12, sunDot);
          vec3 citySample = texture2D(uLightsMap, vMapUv).rgb;
          vec3 cityGlow = citySample * vec3(1.0, 0.86, 0.62) * 2.2 * uShowLights;
          outgoingLight += cityGlow * nightFactor;

          // Inner atmospheric Rayleigh scattering along perimeter
          float viewDot = dot(normalize(vNormal), normalize(-vViewPosition));
          float rim = pow(1.0 - max(0.0, viewDot), 3.2);
          float sunFacing = max(0.0, sunDot * 0.5 + 0.5);
          vec3 atmosphereRim = uAtmosphereColor * rim * (0.35 + 0.55 * sunFacing);
          outgoingLight += atmosphereRim;
        #endif
        #include <opaque_fragment>
        `
      );
    };

    return mat;
  }, [dayMap, bumpMap, specularMap, lightsMap, bumpScale, mode, activeAtmosphereColor, showLights, sunDirView]);

  // Keep bumpScale reactive without full material re-creation
  useEffect(() => {
    customMaterial.bumpScale = bumpScale;
  }, [bumpScale, customMaterial]);

  return (
    <mesh ref={globeRef} material={customMaterial}>
      <sphereGeometry args={[2, 64, 64]} />
    </mesh>
  );
}

// ── Exported Component ──────────────────────────────────────────────────────
export function Globe2({
  mode = "realistic",
  bumpScale = 0.07,
  showLights = true,
  showAtmosphere = true,
  atmosphereColor,
  dayMapUrl = "/earth-day.jpg",
  bumpMapUrl = "/earth-bump.png",
  specularMapUrl = "/earth-specular.jpg",
  lightsMapUrl = "/earth-lights.png",
  autoRotate = true,
  rotationSpeed = 0.0015,
  interactive = true,
  enableZoom = true,
  minDistance = 3.5,
  maxDistance = 10,
  fov = 45,
  className = "",
  style,
}: Globe2Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = THEMES[mode] || THEMES.realistic;
  const activeAtmosphereColor = atmosphereColor || theme.atmosphereColor;

  if (!mounted) {
    return (
      <div
        className={cn(
          "relative w-full h-full min-h-[380px] flex items-center justify-center select-none",
          className
        )}
        style={style}
      >
        <div className="w-48 h-48 rounded-full bg-slate-900/60 animate-pulse border border-white/10" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[380px] flex items-center justify-center select-none",
        className
      )}
      style={style}
    >
      <Canvas
        camera={{ position: [0, 0, 5.8], fov }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: interactive ? "auto" : "none" }}
      >
        {/* Calibrated deep space ambient illumination */}
        <ambientLight intensity={theme.ambientIntensity} color={theme.ambientColor} />

        {/* Primary warm solar key sunlight illuminating daytime terrain & mountain relief */}
        <directionalLight
          position={[5, 3, 4]}
          intensity={theme.keyLightIntensity}
          color={theme.keyLightColor}
        />

        {/* Cinematic opposing rim fill light from the left ensuring dual-sided depth */}
        <directionalLight
          position={[-5, 1, -3]}
          intensity={theme.fillLightIntensity}
          color={theme.fillLightColor}
        />

        {/* 3D Celestial Atmospheric Halo wrapping the globe */}
        {showAtmosphere && <AtmosphereHalo color={activeAtmosphereColor} />}

        {/* Textured globe with seamless Suspense fallback */}
        <Suspense
          fallback={
            <GlobeFallback
              autoRotate={autoRotate}
              rotationSpeed={rotationSpeed}
            />
          }
        >
          <GlobeMesh
            mode={mode}
            bumpScale={bumpScale}
            showLights={showLights}
            atmosphereColor={activeAtmosphereColor}
            dayMapUrl={dayMapUrl}
            bumpMapUrl={bumpMapUrl}
            specularMapUrl={specularMapUrl}
            lightsMapUrl={lightsMapUrl}
            autoRotate={autoRotate}
            rotationSpeed={rotationSpeed}
          />
        </Suspense>

        {/* Smooth OrbitControls with physical momentum damping */}
        {interactive && (
          <OrbitControls
            enableZoom={enableZoom}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={minDistance}
            maxDistance={maxDistance}
            rotateSpeed={0.8}
          />
        )}
      </Canvas>
    </div>
  );
}

export default Globe2;
