import React, { forwardRef, useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { CardsTwoProps, CardsTwoRef, Card } from "./types";
import { useCylinder } from "./hooks/useCylinder";
import { useRotation } from "./hooks/useRotation";
import { useCardTransforms } from "./hooks/useCardTransforms";
import { useCardsTwoRef } from "./hooks/useCardsTwo";
import { cn } from "../../lib/utils";

export const CardsTwo = forwardRef<CardsTwoRef, CardsTwoProps>(
  (
    {
      cards,
      radius = 500,
      gap = 40,
      cardWidth = 300,
      cardHeight = 400,
      rotationAxis = "y",
      rotationDirection = "clockwise",
      rotationSpeed = 36, // ~36 degrees per second (10s per full rotation)
      initialRotation = 0,
      rotationOffset = 0,
      autoRotate = true,
      pauseOnHover = true,
      draggable = true,
      scrollRotate = false,
      snap = true,
      perspective = 1200,
      depth = 0,
      height,
      visibleArc = 360,
      cameraDistance = 0,
      activeScale = 1.1,
      activeOpacity = 1.0,
      activeBrightness = 1.0,
      sideScale = 0.8,
      sideOpacity = 0.6,
      sideBrightness = 0.7,
      backScale = 0.6,
      backOpacity = 0.0, // Set to 0.0 by default to prevent clutter in the middle background
      backBrightness = 0.4,
      hideBackCards = true, // Hide back cards by default to keep the center empty and focus on foreground
      shadowIntensity = 0.5,
      depthBlur = true,
      blurStrength = 4,
      reflection = false,
      ringTiltX = 15, // 15 degree pitch tilt for isometric view
      ringTiltY = 0,
      faceCamera = false, // Set to false to skew/narrow cards at the sides for high-end 3D feel
      tiltX = 0,
      tiltY = 0,
      tiltZ = 0,
      getCardTransform,
      renderCard,
      background = "transparent",
      className,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewportWidth, setViewportWidth] = useState(
      typeof window !== "undefined" ? window.innerWidth : 1200
    );

    // Track resizing to prevent horizontal cutting on smaller screens
    useEffect(() => {
      const handleResize = () => {
        setViewportWidth(window.innerWidth);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { cardAngles, angularSpacing, adjustedRadius } = useCylinder(
      cards.length,
      radius,
      cardWidth,
      gap,
      visibleArc
    );

    const rotationState = useRotation({
      angularSpacing,
      radius: adjustedRadius,
      rotationAxis,
      rotationDirection,
      rotationSpeed,
      initialRotation,
      autoRotate,
      pauseOnHover,
      snap,
    });

    useCardsTwoRef({
      ref,
      targetAngle: rotationState.targetAngle,
      angularSpacing,
      cardCount: cards.length,
      setIsPlaying: rotationState.setIsPlaying,
      getSnappedAngle: rotationState.getSnappedAngle,
    });

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (angularSpacing === 0) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        rotationState.targetAngle.set(rotationState.targetAngle.get() - angularSpacing);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        rotationState.targetAngle.set(rotationState.targetAngle.get() + angularSpacing);
      } else if (e.key === "Home") {
        e.preventDefault();
        rotationState.targetAngle.set(0);
      } else if (e.key === "End") {
        rotationState.targetAngle.set(-(cards.length - 1) * angularSpacing);
      }
    };

    // Wheel listener for scroll rotation
    useEffect(() => {
      if (!scrollRotate) return;
      const el = containerRef.current;
      if (!el) return;

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * 0.001;
        rotationState.targetAngle.set(rotationState.targetAngle.get() - delta);
      };

      el.addEventListener("wheel", handleWheel, { passive: false });
      return () => el.removeEventListener("wheel", handleWheel);
    }, [scrollRotate, rotationState.targetAngle]);

    // Calculate maximum vertical displacement due to isometric tilt to set container height dynamically
    // This prevents vertical cutting/clipping
    const tiltRad = (Math.abs(ringTiltX) * Math.PI) / 180;
    const maxVerticalDrift = adjustedRadius * Math.sin(tiltRad) * 2;
    const computedHeight =
      height || Math.max(cardHeight * 1.5, maxVerticalDrift + cardHeight + 120);

    // Calculate dynamic scale factor to prevent horizontal screen overflow
    const maxDiameterNeeded = adjustedRadius * 2 + cardWidth + 80;
    const responsiveScale = Math.min(1, viewportWidth / maxDiameterNeeded);

    return (
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => {
          rotationState.isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          rotationState.isHoveredRef.current = false;
        }}
        className={cn(
          "relative flex items-center justify-center overflow-visible w-full select-none outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 rounded-2xl",
          background === "solid" && "bg-neutral-950",
          background === "gradient" && "bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900",
          className
        )}
        style={{
          perspective: `${perspective}px`,
          height: typeof computedHeight === "number" ? `${computedHeight}px` : computedHeight,
        }}
      >
        {/* Decorative Grid Overlays */}
        {background === "grid" && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />
        )}
        {background === "noise" && (
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
        )}

        {/* 3D Orbit Stage */}
        <motion.div
          className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
          onPanStart={draggable ? () => rotationState.handleDragStart() : undefined}
          onPan={draggable ? (_, info) => rotationState.handleDrag(info) : undefined}
          onPanEnd={draggable ? (_, info) => rotationState.handleDragEnd(info) : undefined}
          style={{
            transformStyle: "preserve-3d",
            // Apply both camera distance and responsive scaling factor
            transform: `translateZ(${cameraDistance}px) scale(${responsiveScale})`,
          }}
        >
          {cards.map((card, idx) => {
            const handleCardClick = () => {
              if (rotationState.isDragging) return;
              rotationState.targetAngle.set(-idx * angularSpacing);
            };

            return (
              <CardItem
                key={card.id}
                card={card}
                index={idx}
                cardAngle={cardAngles[idx] + (rotationOffset * Math.PI) / 180}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                radius={adjustedRadius}
                depth={depth}
                rotationAxis={rotationAxis}
                faceCamera={faceCamera}
                activeScale={activeScale}
                activeOpacity={activeOpacity}
                activeBrightness={activeBrightness}
                sideScale={sideScale}
                sideOpacity={sideOpacity}
                sideBrightness={sideBrightness}
                backScale={backScale}
                backOpacity={backOpacity}
                backBrightness={backBrightness}
                hideBackCards={hideBackCards}
                depthBlur={depthBlur}
                blurStrength={blurStrength}
                shadowIntensity={shadowIntensity}
                reflection={reflection}
                ringTiltX={ringTiltX}
                ringTiltY={ringTiltY}
                tiltX={tiltX}
                tiltY={tiltY}
                tiltZ={tiltZ}
                angularSpacing={angularSpacing}
                currentAngle={rotationState.currentAngle}
                getCardTransform={getCardTransform}
                renderCard={renderCard}
                onClick={handleCardClick}
              />
            );
          })}
        </motion.div>
      </div>
    );
  }
);

CardsTwo.displayName = "CardsTwo";

// Isolated Card Item Component to prevent parent re-renders and enable clean MotionValue calculations
interface CardItemProps {
  card: Card;
  index: number;
  cardAngle: number;
  cardWidth: number;
  cardHeight: number;
  radius: number;
  depth: number;
  rotationAxis: "x" | "y" | "z";
  faceCamera: boolean;
  activeScale: number;
  activeOpacity: number;
  activeBrightness: number;
  sideScale: number;
  sideOpacity: number;
  sideBrightness: number;
  backScale: number;
  backOpacity: number;
  backBrightness: number;
  hideBackCards: boolean;
  depthBlur: boolean;
  blurStrength: number;
  shadowIntensity: number;
  reflection: boolean;
  ringTiltX: number;
  ringTiltY: number;
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  angularSpacing: number;
  currentAngle: any;
  getCardTransform: any;
  renderCard: any;
  onClick: () => void;
}

const CardItem = ({
  card,
  index,
  cardAngle,
  cardWidth,
  cardHeight,
  radius,
  depth,
  rotationAxis,
  faceCamera,
  activeScale,
  activeOpacity,
  activeBrightness,
  sideScale,
  sideOpacity,
  sideBrightness,
  backScale,
  backOpacity,
  backBrightness,
  hideBackCards,
  depthBlur,
  blurStrength,
  shadowIntensity,
  reflection,
  ringTiltX,
  ringTiltY,
  tiltX,
  tiltY,
  tiltZ,
  angularSpacing,
  currentAngle,
  getCardTransform,
  renderCard,
  onClick,
}: CardItemProps) => {
  const styles = useCardTransforms({
    index,
    cardAngle,
    currentAngle,
    radius,
    depth,
    rotationAxis,
    faceCamera,
    activeScale,
    activeOpacity,
    activeBrightness,
    sideScale,
    sideOpacity,
    sideBrightness,
    backScale,
    backOpacity,
    backBrightness,
    hideBackCards,
    depthBlur,
    blurStrength,
    tiltX,
    tiltY,
    tiltZ,
    ringTiltX,
    ringTiltY,
    angularSpacing,
    getCardTransform,
  });

  return (
    <motion.div
      onClick={onClick}
      className="absolute"
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transform: useTransform(styles, (s) => s.transform),
        zIndex: useTransform(styles, (s) => s.zIndex),
        opacity: useTransform(styles, (s) => s.opacity),
        filter: useTransform(styles, (s) => s.filter),
        transformStyle: "preserve-3d",
        willChange: "transform, opacity, filter",
      }}
    >
      {/* Premium Floating Shadow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-shadow duration-300"
        style={{
          boxShadow: `0 30px 60px -12px rgba(0, 0, 0, ${shadowIntensity * 0.75})`,
        }}
      />

      {/* Main Card Body */}
      <div className="w-full h-full rounded-2xl overflow-hidden border border-neutral-800/40 bg-neutral-900/90 text-neutral-200">
        {renderCard ? (
          renderCard(card, false)
        ) : (
          <div
            className={cn(
              "relative flex flex-col justify-end w-full h-full p-6 bg-cover bg-center select-none"
            )}
            style={{
              backgroundImage: card.image ? `url(${card.image})` : undefined,
              backgroundColor: !card.image ? "#171717" : undefined,
            }}
          >
            {/* Accent Background Layer */}
            {!card.image && card.background && (
              <div className={cn("absolute inset-0 opacity-40 bg-gradient-to-tr", card.background)} />
            )}

            {/* Badge */}
            {card.badge && (
              <span className="absolute top-4 right-4 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase border border-neutral-700 bg-neutral-950/80 text-neutral-300 rounded-full z-20">
                {card.badge}
              </span>
            )}

            {/* Contents */}
            <div className="space-y-1.5 z-10 relative">
              {card.icon && <div className="text-white w-6 h-6 mb-2">{card.icon}</div>}
              <h3 className="text-xl font-bold tracking-tight text-white">{card.title}</h3>
              {card.subtitle && <p className="text-xs font-semibold text-neutral-400">{card.subtitle}</p>}
              {card.description && <p className="text-xs text-neutral-500 line-clamp-2 mt-1.5">{card.description}</p>}
            </div>

            {/* Ambient Dark/Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-0 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Card Reflection */}
      {reflection && (
        <div
          className="absolute left-0 w-full rounded-2xl overflow-hidden border border-neutral-800/20 bg-neutral-900/40 opacity-[0.18] pointer-events-none origin-bottom select-none"
          style={{
            height: `${cardHeight}px`,
            bottom: `-${cardHeight + 8}px`,
            transform: "scaleY(-1)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.18))",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.18))",
          }}
        >
          {renderCard ? (
            renderCard(card, false)
          ) : (
            <div
              className="relative flex flex-col justify-end w-full h-full p-6 bg-cover bg-center"
              style={{
                backgroundImage: card.image ? `url(${card.image})` : undefined,
                backgroundColor: !card.image ? "#171717" : undefined,
              }}
            >
              {!card.image && card.background && (
                <div className={cn("absolute inset-0 opacity-40 bg-gradient-to-tr", card.background)} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
