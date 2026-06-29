// Self-contained 2D Perlin noise implementation for organic led shifting textures
class PerlinNoise {
  private p: number[] = new Array(512);

  constructor(seed = 42) {
    const permutation = Array.from({ length: 256 }, (_, i) => i);
    
    // Seeded random number generator
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    let currentSeed = seed;
    // Shuffle permutation array
    for (let i = 255; i > 0; i--) {
      const r = Math.floor(random(currentSeed++) * (i + 1));
      const temp = permutation[i];
      permutation[i] = permutation[r];
      permutation[r] = temp;
    }

    // Duplicate permutation array
    for (let i = 0; i < 256; i++) {
      this.p[i] = permutation[i];
      this.p[256 + i] = permutation[i];
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number) {
    // Convert low 3 bits of hash code into 8 gradient directions
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  public noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;

    const val = this.lerp(v,
      this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
      this.lerp(u, this.grad(this.p[A + 1], x, y - 1), this.grad(this.p[B + 1], x - 1, y - 1))
    );

    // Normalize result between -1.0 and 1.0
    return val * 0.5;
  }
}

let defaultNoiseInstance: PerlinNoise | null = null;
const noiseCache = new Map<number, PerlinNoise>();

/**
 * Returns a 2D Perlin noise value between -1.0 and 1.0.
 */
export function noise2D(x: number, y: number, seed = 42): number {
  if (seed === 42) {
    if (!defaultNoiseInstance) {
      defaultNoiseInstance = new PerlinNoise(42);
    }
    return defaultNoiseInstance.noise(x, y);
  }

  let noiseObj = noiseCache.get(seed);
  if (!noiseObj) {
    noiseObj = new PerlinNoise(seed);
    noiseCache.set(seed, noiseObj);
  }
  
  return noiseObj.noise(x, y);
}
