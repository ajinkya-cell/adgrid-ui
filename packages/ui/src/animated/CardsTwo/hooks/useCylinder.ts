import { useMemo } from "react";

export function useCylinder(
  cardCount: number,
  radius: number,
  cardWidth: number,
  gap: number,
  visibleArcDegrees: number
) {
  return useMemo(() => {
    const visibleArcRadians = (visibleArcDegrees * Math.PI) / 180;
    
    // Auto-calculate the ideal radius required to prevent card overlaps
    // Circumference C = N * (W_card + gap) -> R = C / 2PI
    const circumferenceNeeded = cardCount * (cardWidth + gap);
    const idealRadius = circumferenceNeeded / (2 * Math.PI);
    
    // Use the larger of the user-requested radius or the ideal radius to guarantee no overlaps
    const adjustedRadius = visibleArcDegrees === 360
      ? Math.max(radius, idealRadius)
      : radius;

    let angularSpacing = 0;
    const cardAngles: number[] = [];

    if (visibleArcDegrees === 360) {
      // Symmetrical distribution around the full circle
      angularSpacing = (2 * Math.PI) / cardCount;
      for (let i = 0; i < cardCount; i++) {
        cardAngles.push(i * angularSpacing);
      }
    } else {
      // Spread cards evenly across the partial arc
      angularSpacing = cardCount > 1 ? visibleArcRadians / (cardCount - 1) : 0;
      const startAngle = -visibleArcRadians / 2;

      for (let i = 0; i < cardCount; i++) {
        cardAngles.push(startAngle + i * angularSpacing);
      }
    }

    return { cardAngles, angularSpacing, adjustedRadius };
  }, [cardCount, radius, cardWidth, gap, visibleArcDegrees]);
}
