export interface PositionedName {
  id: string;
  name: string;
  x: number; // absolute px
  y: number; // absolute px
  z: number; // depth layer index (0: foreground, 1: midground, 2: background)
  fontSize: number;
  rotation: number;
  isHighlighted: boolean;
}

// Seedable linear congruential generator for stable, deterministic layout
export function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateLayout(
  names: string[],
  variant: "constellation" | "grid" | "helical",
  width: number,
  height: number,
  density: number = 2, // 1: sparse, 2: balanced, 3: dense
  spacing: number = 1.0,
  fontScale: number = 1.0,
  highlightedNames: string[] = []
): PositionedName[] {
  if (width <= 0 || height <= 0 || names.length === 0) return [];

  const rand = createRandom(42); // fixed seed for layout stability
  const densityMultiplier = density === 1 ? 0.4 : density === 2 ? 0.7 : 1.1;
  const maxItems = Math.min(names.length, Math.floor(250 * densityMultiplier));
  const selectedNames = names.slice(0, maxItems);

  const highlightedSet = new Set(
    highlightedNames.map((n) => n.toLowerCase())
  );

  const items: PositionedName[] = [];

  // Helper to approximate text width/height
  const getBox = (name: string, fontSize: number) => {
    // Width factor of 0.6 per char for typical sans-serif
    return {
      w: name.length * fontSize * 0.55,
      h: fontSize * 1.3,
    };
  };

  if (variant === "constellation") {
    // 1. Distribute names into depth layers
    // Foreground (15%), Midground (35%), Background (50%)
    for (let i = 0; i < selectedNames.length; i++) {
      const name = selectedNames[i];
      const isHighlighted = highlightedSet.has(name.toLowerCase());
      
      let z = 2; // default background
      const layerRoll = rand();
      if (isHighlighted || layerRoll < 0.15) {
        z = 0; // foreground
      } else if (layerRoll < 0.5) {
        z = 1; // midground
      }

      // Base font size dependent on layer
      let baseSize = 13;
      if (z === 0) baseSize = isHighlighted ? 48 : 34;
      else if (z === 1) baseSize = 22;
      else baseSize = 14;

      const fontSize = Math.round(baseSize * fontScale);
      const rotation = (rand() - 0.5) * 8; // light rotation

      // Place initial random position focused around center
      const r = Math.min(width, height) * 0.4 * Math.sqrt(rand());
      const angle = rand() * Math.PI * 2;
      const x = width / 2 + Math.cos(angle) * r;
      const y = height / 2 + Math.sin(angle) * r;

      items.push({
        id: `${name}-${i}`,
        name,
        x,
        y,
        z,
        fontSize,
        rotation,
        isHighlighted,
      });
    }

    // 2. Collision avoidance relaxation (25 iterations)
    const basePadding = 18 * spacing;
    for (let iter = 0; iter < 25; iter++) {
      for (let i = 0; i < items.length; i++) {
        const itemA = items[i];
        const boxA = getBox(itemA.name, itemA.fontSize);

        for (let j = i + 1; j < items.length; j++) {
          const itemB = items[j];
          // Only push away significantly if they are on same or adjacent layer
          if (Math.abs(itemA.z - itemB.z) > 1) continue;

          const boxB = getBox(itemB.name, itemB.fontSize);

          const dx = itemB.x - itemA.x;
          const dy = itemB.y - itemA.y;

          const minDistanceX = (boxA.w + boxB.w) / 2 + basePadding;
          const minDistanceY = (boxA.h + boxB.h) / 2 + basePadding;

          const overlapX = minDistanceX - Math.abs(dx);
          const overlapY = minDistanceY - Math.abs(dy);

          if (overlapX > 0 && overlapY > 0) {
            // Push along the vector with smaller overlap to minimize movement distance
            const pushX = Math.sign(dx || 0.1) * overlapX * 0.45;
            const pushY = Math.sign(dy || 0.1) * overlapY * 0.45;

            if (overlapX < overlapY) {
              itemA.x -= pushX;
              itemB.x += pushX;
            } else {
              itemA.y -= pushY;
              itemB.y += pushY;
            }
          }
        }

        // Apply a gentle boundary correction and center gravity
        const borderX = width * 0.05;
        const borderY = height * 0.05;
        itemA.x = Math.max(borderX, Math.min(width - borderX - boxA.w, itemA.x));
        itemA.y = Math.max(borderY, Math.min(height - borderY - boxA.h, itemA.y));
      }
    }
  } else if (variant === "grid") {
    // Balanced masonry column layout
    const colCount = Math.max(3, Math.min(8, Math.floor(width / (220 * spacing))));
    const colWidths = width / colCount;

    // Track vertical usage per column
    const colHeights = Array(colCount).fill(height * 0.06);

    for (let i = 0; i < selectedNames.length; i++) {
      const name = selectedNames[i];
      const isHighlighted = highlightedSet.has(name.toLowerCase());

      // Assign to the shortest column
      let colIndex = 0;
      let minH = colHeights[0];
      for (let c = 1; c < colCount; c++) {
        if (colHeights[c] < minH) {
          minH = colHeights[c];
          colIndex = c;
        }
      }

      // Determine layer and font sizes
      let z = 2; // background
      const roll = rand();
      if (isHighlighted || roll < 0.12) z = 0;
      else if (roll < 0.4) z = 1;

      let baseSize = 14;
      if (z === 0) baseSize = isHighlighted ? 44 : 32;
      else if (z === 1) baseSize = 20;

      const fontSize = Math.round(baseSize * fontScale);
      const box = getBox(name, fontSize);

      // Align columns with natural shifts
      const shiftX = (rand() - 0.5) * colWidths * 0.3;
      const x = colIndex * colWidths + colWidths / 2 + shiftX - box.w / 2;
      const y = colHeights[colIndex];

      const rotation = (rand() - 0.5) * 5; // light clean rotation

      items.push({
        id: `${name}-${i}`,
        name,
        x,
        y,
        z,
        fontSize,
        rotation,
        isHighlighted,
      });

      // Update vertical height for this column
      colHeights[colIndex] += box.h + (35 * spacing * (0.8 + rand() * 0.4));

      // Wrap back up if the column height overflows the layout container
      if (colHeights[colIndex] > height * 0.9) {
        colHeights[colIndex] = height * (0.06 + rand() * 0.1);
      }
    }
  } else if (variant === "helical") {
    // 3D Helix coordinate distribution
    const helixRadius = Math.min(width, height) * 0.36;
    const spiralTurns = 3;
    const angleOffset = Math.PI * 0.3;

    for (let i = 0; i < selectedNames.length; i++) {
      const name = selectedNames[i];
      const isHighlighted = highlightedSet.has(name.toLowerCase());

      const progress = i / selectedNames.length;
      const theta = progress * spiralTurns * Math.PI * 2 + angleOffset;

      // Spiral equations
      const r = helixRadius * (0.4 + 0.6 * progress);
      const x = width / 2 + Math.cos(theta) * r;
      const y = height * (0.1 + progress * 0.8);

      // Distribute to depth z levels based on helix theta position
      // Foreground: Front-facing quadrant of helix
      const cosTheta = Math.cos(theta);
      let z = 1; // midground
      if (cosTheta > 0.4) z = 0; // foreground
      else if (cosTheta < -0.3) z = 2; // background

      let baseSize = 13;
      if (z === 0) baseSize = isHighlighted ? 46 : 30;
      else if (z === 1) baseSize = 20;

      const fontSize = Math.round(baseSize * fontScale);
      const rotation = (rand() - 0.5) * 6;

      items.push({
        id: `${name}-${i}`,
        name,
        x: x - (name.length * fontSize * 0.25), // dynamic center correction
        y,
        z,
        fontSize,
        rotation,
        isHighlighted,
      });
    }
  }

  return items;
}
