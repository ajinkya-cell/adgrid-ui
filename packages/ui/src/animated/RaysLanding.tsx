import { useEffect, useRef, useState } from "react";
import { House, Code, Briefcase, LayoutGrid, MessageCircle } from "lucide-react";

export interface SocialLink {
  name: string;
  url: string;
}

export interface RaysLandingProps {
  /** Name displayed in main headline */
  name?: string;
  /** Array of roles cycled in headline subtitle */
  roles?: string[];
  /** Hex color for WebGL light rays */
  raysColor?: string;
  /** Speed multiplier for ray movement */
  raysSpeed?: number;
  /** Angular spread of rays (0.1 to 3.0) */
  lightSpread?: number;
  /** Reach length of rays (0.5 to 4.0) */
  rayLength?: number;
  /** Enable mouse position tracking for light source */
  followMouse?: boolean;
  /** URL target for View Projects button */
  projectsUrl?: string;
  /** URL target for Contact button */
  contactUrl?: string;
  /** Custom social links array */
  socialLinks?: SocialLink[];
  /** Optional container class name override */
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(clean);
  if (!match) return [1, 1, 1];
  return [
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  ];
}

/* ─────────────────────────────────────────────────────────────────────────
 * WebGL Overhead Light Rays Sub-Component
 * ───────────────────────────────────────────────────────────────────────── */
function LightRaysBg({
  raysColor = "#ffffff",
  raysSpeed = 1.0,
  lightSpread = 1.0,
  rayLength = 2.0,
  followMouse = true,
}: {
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  followMouse?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vertShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragShaderSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2  iResolution;
      uniform vec2  rayPos;
      uniform vec2  rayDir;
      uniform vec3  raysColor;
      uniform float raysSpeed;
      uniform float lightSpread;
      uniform float rayLength;
      uniform vec2  mousePos;

      varying vec2 vUv;

      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
        vec2 sourceToCoord = coord - raySource;
        vec2 dirNorm = normalize(sourceToCoord);
        float cosAngle = dot(dirNorm, rayRefDirection);
        float spreadFactor = pow(max(cosAngle, 0.0), 1.0 / max(lightSpread, 0.001));

        float dist = length(sourceToCoord);
        float maxDistance = iResolution.x * rayLength;
        float lengthFalloff = clamp((maxDistance - dist) / maxDistance, 0.0, 1.0);
        float fadeFalloff = clamp((iResolution.x * 1.2 - dist) / (iResolution.x * 1.2), 0.3, 1.0);

        float baseStrength = clamp(
          (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
          (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
          0.0, 1.0
        );

        return baseStrength * lengthFalloff * fadeFalloff * spreadFactor;
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

        vec2 finalRayDir = rayDir;
        if (mousePos.x >= 0.0) {
          vec2 mouseScreenPos = mousePos * iResolution.xy;
          vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
          finalRayDir = normalize(mix(rayDir, mouseDirection, 0.15));
        }

        vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
        vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);

        vec4 color = rays1 * 0.5 + rays2 * 0.4;
        float brightness = 1.0 - (coord.y / iResolution.y);
        color.x *= 0.1 + brightness * 0.8;
        color.y *= 0.3 + brightness * 0.6;
        color.z *= 0.5 + brightness * 0.5;

        color.rgb *= raysColor;
        gl_FragColor = color;
      }
    `;

    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, vertShaderSource);
    const fragShader = createShader(gl.FRAGMENT_SHADER, fragShaderSource);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const posLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    const iTimeLoc = gl.getUniformLocation(program, "iTime");
    const iResLoc = gl.getUniformLocation(program, "iResolution");
    const rayPosLoc = gl.getUniformLocation(program, "rayPos");
    const rayDirLoc = gl.getUniformLocation(program, "rayDir");
    const raysColorLoc = gl.getUniformLocation(program, "raysColor");
    const raysSpeedLoc = gl.getUniformLocation(program, "raysSpeed");
    const lightSpreadLoc = gl.getUniformLocation(program, "lightSpread");
    const rayLengthLoc = gl.getUniformLocation(program, "rayLength");
    const mousePosLoc = gl.getUniformLocation(program, "mousePos");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.clientWidth * dpr;
      const height = container.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);

      gl.uniform2f(iResLoc, width, height);
      gl.uniform2f(rayPosLoc, width * 0.5, -0.1 * height);
      gl.uniform2f(rayDirLoc, 0.0, 1.0);
    };

    window.addEventListener("resize", resize);
    resize();

    let animId: number;
    const startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) * 0.001;

      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.08;

      gl.uniform1f(iTimeLoc, elapsed);
      gl.uniform3fv(raysColorLoc, hexToRgb(raysColor));
      gl.uniform1f(raysSpeedLoc, raysSpeed);
      gl.uniform1f(lightSpreadLoc, lightSpread);
      gl.uniform1f(rayLengthLoc, rayLength);
      gl.uniform2f(mousePosLoc, mouseRef.current.x, mouseRef.current.y);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleMouseMove = (e: MouseEvent) => {
      if (!followMouse) return;
      const rect = container.getBoundingClientRect();
      targetMouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [raysColor, raysSpeed, lightSpread, rayLength, followMouse]);

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" />;
}

/* ─────────────────────────────────────────────────────────────────────────
 * RaysLanding Main Component
 * ───────────────────────────────────────────────────────────────────────── */
export function RaysLanding({
  name = "Ajinkya",
  roles = ["Full Stack Developer", "Tech Enthusiast", "AI/ML Explorer"],
  raysColor = "#ffffff",
  raysSpeed = 1.0,
  lightSpread = 1.0,
  rayLength = 2.0,
  followMouse = true,
  projectsUrl = "#projects",
  contactUrl = "#contact",
  socialLinks = [
    { name: "GitHub", url: "https://github.com" },
    { name: "LinkedIn", url: "https://linkedin.com" },
    { name: "Twitter", url: "https://x.com" },
  ],
  className = "",
}: RaysLandingProps) {
  const [activeTab, setActiveTab] = useState("Home");
  const initial = name ? name.charAt(0).toUpperCase() + "." : "A.";

  const navItems = [
    { id: "Home", label: "Home", icon: House, href: "#" },
    { id: "Skills", label: "Skills", icon: Code, href: "#skills" },
    { id: "Work", label: "Work", icon: Briefcase, href: "#work" },
    { id: "Projects", label: "Projects", icon: LayoutGrid, href: projectsUrl },
    { id: "Contact", label: "Contact", icon: MessageCircle, href: contactUrl },
  ];

  return (
    <div
      className={`relative isolate flex min-h-screen w-full flex-col bg-[#0d0d11] text-white selection:bg-[rgba(79,184,178,0.24)] ${className}`}
      style={{ fontFamily: "'Outfit', system-ui, -apple-system, sans-serif" }}
    >
      {/* Component Scoped Animations & Liquid Glass Styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');

        .liquid-glass-nav {
          backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px rgba(255, 255, 255, 0.1);
        }

        .liquid-glass-pill {
          backdrop-filter: blur(10px);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1) 40%, rgba(255, 255, 255, 0.15));
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }

        @keyframes role-cycle {
          0%, 25% {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0);
          }
          30%, 95% {
            opacity: 0;
            filter: blur(4px);
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0);
          }
        }

        .role-text-item {
          opacity: 0;
          animation: 9s ease-in-out infinite role-cycle;
        }

        .role-text-item:nth-child(1) { animation-delay: 0s; }
        .role-text-item:nth-child(2) { animation-delay: 3s; }
        .role-text-item:nth-child(3) { animation-delay: 6s; }
      `}</style>

      {/* Overhead WebGL Light Rays Engine */}
      <LightRaysBg
        raysColor={raysColor}
        raysSpeed={raysSpeed}
        lightSpread={lightSpread}
        rayLength={rayLength}
        followMouse={followMouse}
      />

      {/* Top Desktop Navigation Header */}
      <nav className="inset-x-0 top-0 z-50 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <a href="#" className="p-0 text-xl font-bold text-white no-underline hover:bg-transparent">
            {initial}
          </a>

          <div className="relative hidden md:flex">
            <div className="liquid-glass-nav relative flex items-center gap-1 rounded-2xl p-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setActiveTab(item.id)}
                    className="relative z-10 flex items-center gap-2 rounded-xl px-4 py-2 text-xs no-underline transition-colors duration-300"
                  >
                    {isActive && <span className="liquid-glass-pill absolute inset-0 rounded-xl" />}
                    <span
                      className={`relative z-10 flex items-center gap-2 font-medium transition-all duration-300 ${
                        isActive ? "text-white" : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Floating Bottom Dock Navigation */}
      <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center md:hidden">
        <div className="liquid-glass-nav flex items-center gap-1 rounded-[22px] p-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab(item.id)}
                className="relative flex h-12 w-12 items-center justify-center rounded-2xl no-underline transition-transform duration-100 active:scale-90"
              >
                {isActive && <span className="liquid-glass-pill absolute inset-0 rounded-2xl" />}
                <Icon
                  className={`relative z-10 h-5 w-5 transition-all duration-300 ${
                    isActive ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" : "text-white/40"
                  }`}
                />
              </a>
            );
          })}
        </div>
      </div>

      {/* Main Landing Hero Content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="relative z-10 max-w-xl text-center">
          {/* Greeting Badge (Hardcoded) */}
          <p className="mb-4 font-mono text-sm tracking-widest text-blue-400">
            Hello, I'm
          </p>

          {/* Main Headline */}
          <h1 className="mb-4 pb-3 bg-gradient-to-b from-white via-white/80 to-white/35 bg-clip-text text-6xl font-bold tracking-tighter text-transparent leading-none sm:text-7xl lg:text-8xl">
            {name}
          </h1>

          {/* Role Cycler Subtitle */}
          <div className="relative mb-6 flex h-6 justify-center">
            {roles.map((role) => (
              <span
                key={role}
                className="role-text-item absolute text-base font-normal whitespace-nowrap text-white/70"
              >
                {role}
              </span>
            ))}
          </div>

          {/* Bio Description (Hardcoded) */}
          <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-white/60">
            A tech lover who likes to build real world applications that actually have a purpose. Explores new tech be it in dev or non-dev world in his free time.
          </p>

          {/* Action Buttons */}
          <div className="mb-10 flex justify-center gap-3">
            <a
              href={projectsUrl}
              className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black no-underline transition-colors hover:bg-white/90 shadow-sm"
            >
              View Projects
            </a>
            <a
              href={contactUrl}
              className="inline-flex h-9 items-center justify-center rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-white/10 shadow-sm"
            >
              Contact
            </a>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-5">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-white/50 no-underline transition-colors hover:text-blue-400"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RaysLanding;
