"use client";

import { useEffect, useRef } from "react";

export interface LuminaWaveProps {
  speed?: number;          // Speed multiplier for the animation (default: 1.0)
  intensity?: number;      // Brightness/contrast multiplier of the wave lines (default: 1.0)
  colorPrimary?: string;   // Hex color for the primary wave (default: "#2563eb")
  colorSecondary?: string; // Hex color for the secondary wave (default: "#6610f2")
  quality?: "high" | "medium" | "low"; // Downscaling resolution factor (default: "medium")
  mouseReactivity?: number; // Strength of mouse bend influence (default: 0.5, 0 to disable)
  className?: string;      // Custom wrapper CSS class
}

const VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
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
`;

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16) || 0;
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return [r, g, b];
}

const ensureHex = (color: string) => {
  if (typeof color !== "string") return "#000000";
  if (color.startsWith("#")) return color;
  return `#${color}`;
};

export function LuminaWave({
  speed = 1.0,
  intensity = 1.0,
  colorPrimary = "#2563eb",
  colorSecondary = "#6610f2",
  quality = "medium",
  mouseReactivity = 0.5,
  className,
}: LuminaWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mq.matches;

    if (reducedMotion) return;

    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const scale =
      quality === "high" ? 1.0 : quality === "medium" ? 0.75 : 0.5;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("LuminaWave shader compilation error:", gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(VERTEX_SHADER, gl.VERTEX_SHADER));
    gl.attachShader(prog, compile(FRAGMENT_SHADER, gl.FRAGMENT_SHADER));
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

    // Uniform locations
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uSpeed = gl.getUniformLocation(prog, "u_speed");
    const uIntensity = gl.getUniformLocation(prog, "u_intensity");
    const uMouseReactivity = gl.getUniformLocation(prog, "u_mouse_reactivity");
    const uColorPrimary = gl.getUniformLocation(prog, "u_color_primary");
    const uColorSecondary = gl.getUniformLocation(prog, "u_color_secondary");

    // Static / semi-static uniforms
    gl.uniform1f(uSpeed, speed);
    gl.uniform1f(uIntensity, intensity);
    gl.uniform1f(uMouseReactivity, mouseReactivity);

    const rgbPrimary = hexToRgb(ensureHex(colorPrimary));
    const rgbSecondary = hexToRgb(ensureHex(colorSecondary));
    gl.uniform3f(uColorPrimary, rgbPrimary[0], rgbPrimary[1], rgbPrimary[2]);
    gl.uniform3f(uColorSecondary, rgbSecondary[0], rgbSecondary[1], rgbSecondary[2]);

    let mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let hasMouseInput = false;

    const updateMouse = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (clientX - rect.left) / rect.width;
        const ny = 1.0 - (clientY - rect.top) / rect.height;
        mouse.tx = nx * canvas.width;
        mouse.ty = ny * canvas.height;
        if (!hasMouseInput) {
          mouse.x = mouse.tx;
          mouse.y = mouse.ty;
          hasMouseInput = true;
        }
      }
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
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      gl.viewport(0, 0, w, h);

      // Reset mouse targets to center if no movement has registered yet
      if (!hasMouseInput) {
        mouse.tx = w / 2;
        mouse.ty = h / 2;
        mouse.x = w / 2;
        mouse.y = h / 2;
      }
    };

    window.addEventListener("resize", resize);
    resize();

    const render = (time: number) => {
      // Smoothly interpolate mouse coordinates
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      gl.uniform2f(uRes, canvas.width, canvas.height);
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
      gl.deleteBuffer(buf);
    };
  }, [speed, intensity, colorPrimary, colorSecondary, quality, mouseReactivity]);

  const fallbackStyle = getReducedFallbackStyle(ensureHex(colorPrimary), ensureHex(colorSecondary));
  const containerClass = className ?? "fixed inset-0 pointer-events-none z-0";

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={{ background: "#000" }}
    >
      <div className="lw-reduced-fallback" style={fallbackStyle} />
      <canvas
        ref={canvasRef}
        className="lw-canvas"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      <style>{`
        .lw-reduced-fallback {
          position: absolute;
          inset: 0;
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .lw-canvas { display: none; }
          .lw-reduced-fallback { display: block; }
        }
      `}</style>
    </div>
  );
}

function getReducedFallbackStyle(colorPrimary: string, colorSecondary: string): React.CSSProperties {
  return {
    background: `radial-gradient(ellipse at 50% 50%, ${colorPrimary}22 0%, ${colorSecondary}11 50%, #000000 100%)`,
  };
}
