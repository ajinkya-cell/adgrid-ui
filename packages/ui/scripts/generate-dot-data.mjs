import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { feature } from "topojson-client";
import { geoMercator } from "d3-geo";
import { polygonContains } from "d3-polygon";

const __dirname = dirname(fileURLToPath(import.meta.url));

const WIDTH = 1200;
const HEIGHT = 600;
const SPACING = 3;

function loadTopoJSON() {
  const topoPath = join(__dirname, "..", "node_modules", "world-atlas", "countries-50m.json");
  const raw = JSON.parse(readFileSync(topoPath, "utf-8"));
  return feature(raw, raw.objects.countries);
}

function buildCountryIndex(features) {
  const countryMap = {};
  for (const f of features) {
    const code = f.id;
    const name = f.properties?.name || code;
    const polygons = [];
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;

    if (f.geometry.type === "Polygon") {
      polygons.push(f.geometry.coordinates);
      for (const ring of f.geometry.coordinates) {
        for (const [l, a] of ring) {
          if (l < minLng) minLng = l;
          if (l > maxLng) maxLng = l;
          if (a < minLat) minLat = a;
          if (a > maxLat) maxLat = a;
        }
      }
    } else if (f.geometry.type === "MultiPolygon") {
      for (const coords of f.geometry.coordinates) {
        polygons.push(coords);
        for (const ring of coords) {
          for (const [l, a] of ring) {
            if (l < minLng) minLng = l;
            if (l > maxLng) maxLng = l;
            if (a < minLat) minLat = a;
            if (a > maxLat) maxLat = a;
          }
        }
      }
    }

    countryMap[code] = { name, polygons, bounds: [minLng, minLat, maxLng, maxLat] };
  }
  return countryMap;
}

function findCountry(lng, lat, countryMap) {
  const candidates = [];
  for (const [code, country] of Object.entries(countryMap)) {
    const [minLng, minLat, maxLng, maxLat] = country.bounds;
    if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
      candidates.push(code);
    }
  }

  for (const code of candidates) {
    const country = countryMap[code];
    for (const polygon of country.polygons) {
      const ring = polygon[0];
      const coords = ring.map(([l, a]) => [l, a]);
      if (polygonContains(coords, [lng, lat])) {
        for (let i = 1; i < polygon.length; i++) {
          const hole = polygon[i].map(([l, a]) => [l, a]);
          if (polygonContains(hole, [lng, lat])) {
            return null;
          }
        }
        return code;
      }
    }
  }
  return null;
}

function generateDots(projectionName, world) {
  const proj = geoMercator()
    .translate([WIDTH / 2, HEIGHT / 2])
    .scale((WIDTH / 2) * 0.95 / Math.PI)
    .precision(0.5);

  const countryMap = buildCountryIndex(world.features);
  console.log(`  Indexed ${Object.keys(countryMap).length} countries`);

  const dots = [];
  const countryDots = {};

  let total = 0;
  const cols = Math.floor(WIDTH / SPACING);
  const rows = Math.floor(HEIGHT / SPACING);
  console.log(`  Grid: ${cols}x${rows} = ${cols * rows} points`);

  for (let row = 0; row < rows; row++) {
    const y = row * SPACING;
    for (let col = 0; col < cols; col++) {
      const x = col * SPACING;
      const inv = proj.invert([x, y]);
      if (!inv) continue;
      const [lng, lat] = inv;
      if (isNaN(lng) || isNaN(lat)) continue;

      const countryCode = findCountry(lng, lat, countryMap);
      if (countryCode) {
        const [px, py] = proj([lng, lat]);
        if (isNaN(px) || isNaN(py)) continue;
        dots.push({
          x: Math.round(px * 10) / 10,
          y: Math.round(py * 10) / 10,
          country: countryCode,
        });
        if (!countryDots[countryCode]) countryDots[countryCode] = [];
        countryDots[countryCode].push(dots.length - 1);
      }
    }
    if (row % 20 === 0) {
      console.log(`  Row ${row}/${rows} — ${dots.length} dots found`);
    }
  }

  console.log(`  Found ${dots.length} total dots`);

  const countries = {};
  for (const f of world.features) {
    const code = f.id;
    if (!countryMap[code]) continue;
    let paths = [];
    const ringToPath = (ring) => {
      return ring.map(([l, a]) => {
        const [px, py] = proj([l, a]);
        return isNaN(px) || isNaN(py) ? null : `${Math.round(px * 10) / 10},${Math.round(py * 10) / 10}`;
      }).filter(Boolean).join(" L");
    };
    if (f.geometry.type === "Polygon") {
      const d = "M" + ringToPath(f.geometry.coordinates[0]);
      paths.push(d);
    } else if (f.geometry.type === "MultiPolygon") {
      for (const poly of f.geometry.coordinates) {
        const d = "M" + ringToPath(poly[0]);
        paths.push(d);
      }
    }
    countries[code] = {
      name: countryMap[code].name,
      dotCount: countryDots[code]?.length || 0,
      dotIndices: countryDots[code] || [],
      paths,
    };
  }

  return {
    projection: projectionName,
    width: WIDTH,
    height: HEIGHT,
    spacing: SPACING,
    dots,
    countries,
  };
}

function main() {
  console.log("Loading world data...");
  const world = loadTopoJSON();
  console.log(`Loaded ${world.features.length} countries`);

  const outDir = join(__dirname, "..", "src", "react-dot-map", "data");
  mkdirSync(outDir, { recursive: true });

  console.log("Generating mercator projection...");
  const data = generateDots("mercator", world);
  const outPath = join(outDir, `dots_mercator.json`);
  writeFileSync(outPath, JSON.stringify(data));
  console.log(`Written to ${outPath}`);

  console.log("Done!");
}

main();
