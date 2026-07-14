interface BackgroundLayerProps {
  type: "solid" | "noise" | "paper" | "grid" | "gradient" | "texture";
  colorMode: "light" | "dark";
}

export function BackgroundLayer({ type, colorMode }: BackgroundLayerProps) {
  const isDark = colorMode === "dark";

  // Base theme variables
  const bgBase = isDark ? "bg-[#0B0B0B]" : "bg-[#F4F1E8]";

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden select-none pointer-events-none ${bgBase}`}>
      {/* Noise Texture Layer */}
      {(type === "noise" || type === "texture" || type === "paper") && (
        <div 
          className="absolute inset-0 mix-blend-overlay opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      )}

      {/* Grid Pattern Layer */}
      {(type === "grid" || type === "texture") && (
        <div 
          className={`absolute inset-0 opacity-[0.25] ${
            isDark 
              ? "[background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]"
              : "[background-image:linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)]"
          } [background-size:60px_60px]`}
        />
      )}

      {/* Paper Fibers Texture */}
      {type === "paper" && (
        <>
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] [background-size:24px_24px] text-neutral-500" />
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] [background-size:8px_8px]" />
        </>
      )}

      {/* Modern Blurred Mesh Gradients */}
      {type === "gradient" && (
        <div className="absolute -inset-[40px] opacity-[0.45] blur-[130px] overflow-hidden">
          {isDark ? (
            <>
              {/* Deep charcoal, slate, and hint of aubergine */}
              <div className="absolute top-[10%] left-[20%] w-[55%] h-[55%] rounded-full bg-[#18151A]" />
              <div className="absolute bottom-[15%] right-[10%] w-[60%] h-[60%] rounded-full bg-[#11161B]" />
              <div className="absolute top-[40%] right-[30%] w-[45%] h-[45%] rounded-full bg-[#141414]" />
            </>
          ) : (
            <>
              {/* Soft warm tan, oatmeal, and eggshell cream */}
              <div className="absolute top-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#ECE7DC]" />
              <div className="absolute bottom-[10%] right-[10%] w-[55%] h-[55%] rounded-full bg-[#EAE3D5]" />
              <div className="absolute top-[35%] right-[25%] w-[50%] h-[50%] rounded-full bg-[#F3ECE0]" />
            </>
          )}
        </div>
      )}

      {/* Soft Vignette Overlay */}
      <div 
        className={`absolute inset-0 ${
          isDark 
            ? "bg-[radial-gradient(circle_at_center,transparent_20%,rgba(9,9,9,0.3)_100%)]" 
            : "bg-[radial-gradient(circle_at_center,transparent_20%,rgba(244,241,232,0.25)_100%)]"
        }`}
      />
    </div>
  );
}
