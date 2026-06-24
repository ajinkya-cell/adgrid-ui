"use client";

import { useEffect, useRef, useMemo } from "react";

export type ObsidianVariant = "black" | "gold" | "rainbow" | "emerald";

export interface MoltenObsidianProps {
  variant?: ObsidianVariant;
  intensity?: number;
  speed?: number;
  mouseReactivity?: number;
  quality?: "high" | "medium" | "low";
  className?: string;
}

interface VariantColors {
  base: [number, number, number];
  vein: [number, number, number];
  specular: [number, number, number];
  glow: [number, number, number];
  subsurface: [number, number, number];
}

const VARIANT_COLORS: Record<ObsidianVariant, VariantColors> = {
  black: {
    base: [0.01, 0.01, 0.012],
    vein: [0.04, 0.035, 0.05],
    specular: [0.65, 0.70, 0.90],
    glow: [0.55, 0.35, 0.15],
    subsurface: [0.08, 0.05, 0.12],
  },
  gold: {
    base: [0.015, 0.012, 0.008],
    vein: [0.25, 0.18, 0.05],
    specular: [0.95, 0.80, 0.50],
    glow: [0.90, 0.65, 0.20],
    subsurface: [0.12, 0.08, 0.03],
  },
  rainbow: {
    base: [0.01, 0.01, 0.014],
    vein: [0.02, 0.025, 0.04],
    specular: [0.80, 0.75, 0.95],
    glow: [0.60, 0.50, 0.70],
    subsurface: [0.06, 0.04, 0.10],
  },
  emerald: {
    base: [0.008, 0.015, 0.012],
    vein: [0.03, 0.08, 0.05],
    specular: [0.50, 0.90, 0.70],
    glow: [0.20, 0.70, 0.40],
    subsurface: [0.05, 0.12, 0.08],
  },
};

function makeFragmentShader(variant: ObsidianVariant): string {
  const c = VARIANT_COLORS[variant];

  return `
    #extension GL_OES_standard_derivatives : enable
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    uniform float u_intensity;
    uniform float u_speed;
    uniform float u_mouseReactivity;

    vec3 baseColor = vec3(${c.base[0]}, ${c.base[1]}, ${c.base[2]});
    vec3 veinColor = vec3(${c.vein[0]}, ${c.vein[1]}, ${c.vein[2]});
    vec3 specColor = vec3(${c.specular[0]}, ${c.specular[1]}, ${c.specular[2]});
    vec3 glowColor = vec3(${c.glow[0]}, ${c.glow[1]}, ${c.glow[2]});
    vec3 subColor  = vec3(${c.subsurface[0]}, ${c.subsurface[1]}, ${c.subsurface[2]});

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 0.5;
      float freq = 1.0;
      for (int i = 0; i < 5; i++) {
        value += amp * noise(p * freq);
        freq *= 2.1;
        amp *= 0.48;
      }
      return value;
    }

    float veins(vec2 p, float time) {
      float t = time * 0.12;
      float v = 0.0;
      v += sin(p.x * 1.2 + p.y * 0.7 + t);
      v += sin(p.x * 0.8 - p.y * 1.3 + t * 0.7 + 1.4);
      v += sin(p.x * 1.9 + p.y * 0.4 + t * 0.5 + 2.8);
      v += sin(p.x * 0.5 - p.y * 1.8 + t * 0.9 + 4.2);
      return smoothstep(0.3, 0.7, v * 0.25 + 0.5);
    }

    ${variant === "rainbow" ? `
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    float thinFilm(vec2 p, float time, vec3 viewDir) {
      float thickness = 0.5 + 0.5 * sin(p.x * 2.0 + p.y * 1.5 + time * 0.2);
      thickness += 0.3 * sin(p.x * 3.5 - p.y * 2.0 + time * 0.15);
      float angle = max(dot(normalize(vec3(p, 0.5)), viewDir), 0.0);
      return thickness * angle;
    }
    ` : ""}

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
      vec2 m = (u_mouse - 0.5 * u_resolution.xy) / u_resolution.y;
      float time = u_time * max(u_speed, 0.01);

      vec2 scaleUV = uv * 4.0;
      float stone = fbm(scaleUV + time * 0.008);

      float vein = veins(uv * 5.0 + stone * 0.3, time);

      float h = 0.001;
      float height = fbm(scaleUV + time * 0.008);
      float dx = fbm(scaleUV + vec2(h, 0.0) + time * 0.008) - height;
      float dy = fbm(scaleUV + vec2(0.0, h) + time * 0.008) - height;
      vec3 normal = normalize(vec3(dx, dy, 0.25));

      vec3 lightDir = normalize(vec3(0.3, 0.5, 0.7));
      float diff = max(dot(normal, lightDir), 0.0);
      float spec = pow(diff, 45.0);

      float cursorDist = length(p - m);
      float cursorHeat = exp(-cursorDist * 2.5) * u_mouseReactivity;
      float cursorWarmth = exp(-cursorDist * 4.0) * u_mouseReactivity;

      vec3 cursorLightDir = normalize(vec3(m - p, 0.6));
      float cursorDiff = max(dot(normal, cursorLightDir), 0.0);
      float cursorSpec = pow(cursorDiff * cursorHeat + 0.001, 15.0);

      vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
      vec3 halfVec = normalize(lightDir + viewDir);
      float blinnSpec = pow(max(dot(normal, halfVec), 0.0), 60.0);

      float rim = 1.0 - max(dot(normal, viewDir), 0.0);
      rim = pow(rim, 3.0);

      float subsurface = diff * 0.15 + cursorHeat * 0.3;

      vec3 color = baseColor;

      float veinStrength = vein * 0.6 + vein * cursorHeat * 0.4;
      color = mix(color, veinColor, veinStrength);

      color += subColor * subsurface * 0.5;

      color += specColor * spec * 0.15 * u_intensity;
      color += specColor * blinnSpec * 0.08 * u_intensity;

      color += glowColor * cursorSpec * 0.4 * u_intensity;
      color += glowColor * cursorWarmth * 0.2;

      color += specColor * rim * 0.04;

      float grain = hash(uv * u_resolution.y * 3.0 + time * 0.02);
      color += (grain - 0.5) * 0.015;

      ${variant === "rainbow" ? `
      float film = thinFilm(p, time, viewDir);
      float filmIntensity = 0.08 + cursorHeat * 0.15;
      vec3 filmColor = hsv2rgb(vec3(film + time * 0.02, 0.6, 0.4));
      color += filmColor * filmIntensity;
      color += specColor * spec * 0.1;
      ` : ""}

      ${variant === "gold" ? `
      float goldSparkle = pow(noise(uv * 40.0 + time * 0.02), 12.0);
      color += vec3(1.0, 0.85, 0.5) * goldSparkle * 0.3 * u_intensity;
      color += glowColor * cursorWarmth * 0.35;
      ` : ""}

      ${variant === "emerald" ? `
      float emeraldSparkle = pow(noise(uv * 35.0 + time * 0.015), 10.0);
      color += vec3(0.3, 0.9, 0.5) * emeraldSparkle * 0.2 * u_intensity;
      color += subColor * subsurface * 0.8;
      ` : ""}

      color += glowColor * cursorHeat * vein * 0.15;

      color = clamp(color, 0.0, 1.0);

      float vignette = 1.0 - length(uv - 0.5) * 0.5;
      color *= vignette;

      gl_FragColor = vec4(color, 1.0);
    }
  `;
}

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

function getReducedFallbackStyle(variant: ObsidianVariant): React.CSSProperties {
  switch (variant) {
    case "black":
      return {
        background:
          "radial-gradient(ellipse at 50% 50%, #0a0a0e 0%, #050508 50%, #000000 100%)",
      };
    case "gold":
      return {
        background:
          "radial-gradient(ellipse at 40% 50%, #1a1208 0%, #0d0a05 40%, #000000 100%)",
      };
    case "rainbow":
      return {
        background:
          "linear-gradient(135deg, #080812 0%, #0a0818 25%, #080a14 50%, #0c0812 75%, #080810 100%)",
      };
    case "emerald":
      return {
        background:
          "radial-gradient(ellipse at 50% 40%, #081a0e 0%, #050d08 50%, #000000 100%)",
      };
  }
}

export function MoltenObsidian({
  variant = "black",
  intensity = 1,
  speed = 1,
  mouseReactivity = 1,
  quality = "medium",
  className,
}: MoltenObsidianProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fragmentShader = useMemo(() => makeFragmentShader(variant), [variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mq.matches;

    if (reducedMotion) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    gl.getExtension("OES_standard_derivatives");

    const scale =
      quality === "high" ? 1
      : quality === "medium" ? 0.75
      : 0.5;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("MoltenObsidian shader error:", gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(VERTEX_SHADER, gl.VERTEX_SHADER));
    gl.attachShader(prog, compile(fragmentShader, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uIntensity = gl.getUniformLocation(prog, "u_intensity");
    const uSpeed = gl.getUniformLocation(prog, "u_speed");
    const uMouseReactivity = gl.getUniformLocation(prog, "u_mouseReactivity");

    gl.uniform1f(uIntensity, intensity);
    gl.uniform1f(uSpeed, speed);
    gl.uniform1f(uMouseReactivity, mouseReactivity);

    let mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const updateMouse = (clientX: number, clientY: number) => {
      mouse.tx = clientX * devicePixelRatio;
      mouse.ty = (window.innerHeight - clientY) * devicePixelRatio;
    };

    const onMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    let anim: number;

    const resize = () => {
      const w = Math.round(window.innerWidth * devicePixelRatio * scale);
      const h = Math.round(window.innerHeight * devicePixelRatio * scale);
      canvas!.width = w;
      canvas!.height = h;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      gl!.viewport(0, 0, w, h);
    };

    window.addEventListener("resize", resize);
    resize();

    const render = (time: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      gl.uniform2f(uRes, canvas!.width, canvas!.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, time * 0.001);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      anim = requestAnimationFrame(render);
    };
    anim = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(prog);
    };
  }, [fragmentShader, intensity, speed, mouseReactivity, quality]);

  const fallback = getReducedFallbackStyle(variant);
  const containerClass = className ?? "fixed inset-0 pointer-events-none z-0";

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={{ background: "#000" }}
    >
      <div className="mo-reduced-fallback" style={fallback} />
      <canvas
        ref={canvasRef}
        className="mo-canvas"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <style>{`
        .mo-reduced-fallback {
          position: absolute;
          inset: 0;
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .mo-canvas { display: none; }
          .mo-reduced-fallback { display: block; }
        }
      `}</style>
    </div>
  );
}
