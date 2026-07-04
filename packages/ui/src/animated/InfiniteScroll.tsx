"use client";

import { useEffect, useRef, useId, useMemo, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ------------------------------------------------------------------ */
/*  Type definitions                                                   */
/* ------------------------------------------------------------------ */

export interface SlideData {
  /** Full-width image URL */
  src: string;
  /** Short label shown on the slide */
  label?: string;
  /** Optional longer caption under the label */
  caption?: string;
}

export interface InfiniteScrollProps {
  /** Array of slide objects (uses defaults when omitted). */
  slides?: SlideData[];
  /** Parallax vertical offset percentage (0 = none, 100 = full). */
  parallaxPercent?: number;
  /** Lenis snap animation duration in seconds. */
  snapDuration?: number;
  /** Show a minimal progress indicator at the bottom. */
  showProgress?: boolean;
  /** Show the slide label overlay. */
  showLabels?: boolean;
  /** Show a "scroll" cue on the first visible slide. */
  showScrollCue?: boolean;
  /** Opacity of the dark overlay gradient (0 … 1). */
  overlayOpacity?: number;
  /** Additional Tailwind / CSS class on the outer wrapper. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Default demo data                                                  */
/* ------------------------------------------------------------------ */

const DEFAULT_SLIDES: SlideData[] = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    label: "Alpine",
    caption: "Where silence speaks",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
    label: "Forest",
    caption: "Light through the canopy",
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80",
    label: "Mist",
    caption: "Drifting into calm",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function InfiniteScroll({
  slides,
  parallaxPercent = 50,
  snapDuration = 0.9,
  showProgress = true,
  showLabels = true,
  showScrollCue = true,
  overlayOpacity = 0.55,
  className,
}: InfiniteScrollProps) {
  const uid = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<{ destroy: () => void } | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollHintVisible, setScrollHintVisible] = useState(true);

  /* Resolve slides */
  const resolved =
    slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

  /* Duplicate first slide at the end for seamless infinite loop */
  const allSlides = useMemo(
    () => [...resolved, resolved[0]],
    [resolved]
  );

  /* Lenis + ScrollTrigger initialisation */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content || allSlides.length === 0) return;

    let cancelled = false;
    let lenisInstance: { destroy: () => void } | null = null;
    const w = wrapper;
    const c = content;

    async function init() {
      try {
        const [LenisModule, SnapModule] = await Promise.all([
          import("lenis"),
          import("lenis/snap"),
        ]);

        if (cancelled) return;

        const LenisCls = LenisModule.default as new (...args: unknown[]) => {
          scroll: number;
          scrollTo: (v: number, opts: { immediate: boolean }) => void;
          on: (e: string, fn: () => void) => void;
          raf: (t: number) => void;
          destroy: () => void;
        };

        const SnapCls = SnapModule.default as new (
          lenis: unknown,
          opts?: Record<string, unknown>
        ) => {
          addElements: (
            el: HTMLElement[],
            opts: { align: string }
          ) => void;
        };

        const lenis = new LenisCls({
          infinite: true,
          wrapper: w,
          content: c,
          syncTouch: true,
        });

        lenisInstance = lenis;
        lenisRef.current = lenis;

        const snap = new SnapCls(lenis, {
          type: "mandatory",
          debounce: 500,
          duration: snapDuration,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
        });

        /* ScrollTrigger proxy */
        ScrollTrigger.scrollerProxy(w, {
          scrollTop(value?: number) {
            if (value !== undefined) {
              lenis.scrollTo(value, { immediate: true });
              return value;
            }
            return lenis.scroll;
          },
          getBoundingClientRect() {
            return {
              top: 0,
              left: 0,
              width: w.clientWidth,
              height: w.clientHeight,
            };
          },
          pinType: "transform",
        });

        /* Snap each section */
        const sections = Array.from(
          w.querySelectorAll<HTMLElement>("[data-infinite-slide]")
        );
        snap.addElements(sections, { align: "start" });

        lenis.on("scroll", ScrollTrigger.update);

        gsap.ticker.add((time: number) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        /* Active-index tracking */
        const updateActive = () => {
          const h = w.clientHeight || window.innerHeight;
          const scrollY = lenis.scroll;
          const idx = Math.round(scrollY / h) % resolved.length;
          setActiveIndex(idx >= 0 ? idx : resolved.length + idx);
        };
        lenis.on("scroll", updateActive);

        /* Per-slide animations */
        allSlides.forEach((_, index) => {
          const slide = w.querySelector(
            `[data-infinite-slide="${uid}-${index}"]`
          );
          if (!slide) return;
          const image = slide.querySelector<HTMLElement>("[data-infinite-image]");
          const labelGroup = slide.querySelector<HTMLElement>(
            "[data-infinite-labels]"
          );

          /* Parallax on image */
          if (image) {
            gsap.set(image, { yPercent: -parallaxPercent });
            gsap.fromTo(
              image,
              { yPercent: -parallaxPercent, scale: 1.05 },
              {
                yPercent: parallaxPercent,
                scale: 1.15,
                ease: "none",
                scrollTrigger: {
                  scroller: wrapper,
                  trigger: slide,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                  fastScrollEnd: true,
                },
              }
            );
          }

          /* Label entrance */
          if (labelGroup) {
            gsap.fromTo(
              labelGroup,
              { y: 40, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                  scroller: wrapper,
                  trigger: slide,
                  start: "top 60%",
                  end: "top 30%",
                  scrub: true,
                },
              }
            );
          }
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[InfiniteScroll] init failed:", err);
      }
    }

    init();

    return () => {
      cancelled = true;
      ScrollTrigger.getAll().forEach((st) => st.kill());
      if (lenisInstance) {
        lenisInstance.destroy();
      }
      lenisRef.current = null;
    };
  }, [allSlides, parallaxPercent, snapDuration, uid, resolved.length]);

  /* Dismiss scroll cue on user scroll */
  useEffect(() => {
    const onScroll = () => {
      setScrollHintVisible(false);
    };
    window.addEventListener("wheel", onScroll, { once: true });
    window.addEventListener("touchmove", onScroll, { once: true });
    return () => {
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
    };
  }, []);

  if (allSlides.length === 0) return null;

  /* ---------------------------------------------------------------- */
  /*  Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        height: "100vh",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {/* Slide container */}
      <div ref={contentRef} className="relative">
        {allSlides.map((slide, index) => {
          const isLast = index === allSlides.length - 1;

          return (
            <section
              key={`${uid}-${index}`}
              data-infinite-slide={`${uid}-${index}`}
              className="relative grid place-items-center w-full overflow-clip"
              style={{ height: "100vh" }}
              aria-hidden={isLast || undefined}
            >
              {/* Ken Burns parallax image */}
              <picture
                data-infinite-image
                className="absolute inset-0 will-change-transform"
              >
                <img
                  src={slide.src}
                  alt={slide.label ?? ""}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                  loading="eager"
                />
              </picture>

              {/* Dark overlay gradient + vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,${overlayOpacity}) 100%)`,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 150px 60px rgba(0,0,0,0.4)",
                }}
              />

              {/* Label overlay */}
              {showLabels && (
                <div
                  data-infinite-labels
                  className="relative z-10 text-center px-6"
                >
                  {slide.label && (
                    <h2
                      className="font-display text-white uppercase tracking-[0.3em] text-sm md:text-base mb-3 opacity-70"
                      style={{ letterSpacing: "0.3em" }}
                    >
                      {slide.label}
                    </h2>
                  )}
                  {slide.caption && (
                    <p className="font-body text-white/50 text-xs md:text-sm tracking-wide">
                      {slide.caption}
                    </p>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Progress indicator */}
      {showProgress && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {resolved.map((_, i) => (
            <div
              key={i}
              className="h-[3px] rounded-full transition-all duration-500"
              style={{
                width: i === activeIndex ? 32 : 12,
                background:
                  i === activeIndex
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      )}

      {/* Scroll cue */}
      {showScrollCue && scrollHintVisible && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-white/40 text-[10px] uppercase tracking-[0.25em] font-medium">
            Scroll
          </span>
          <div className="w-[1px] h-10 bg-white/20 relative overflow-hidden">
            <div className="absolute w-full bg-white/60 animate-ping" style={{ height: "40%", top: 0 }} />
          </div>
        </div>
      )}
    </div>
  );
}
