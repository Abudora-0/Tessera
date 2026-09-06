import { createNoise2D, createNoise3D } from "simplex-noise";
import { mixHex, rgbaFromHex } from "@/lib/palettes";
import {
  applyGrain,
  applyVignette,
  clamp01,
  fillBackground,
  lerp,
  linearGradient,
  radialGlow,
  scaleFor,
  smoothLine,
  verticalGradient,
  withLayer,
  type DrawContext,
  type Generator,
} from "./shared";

/* ------------------------------------------------------------------ Aurora */

const aurora: Generator = {
  id: "aurora",
  name: "Aurora",
  blurb: "Layered ribbons of light drifting across a night sky",
  tags: ["gradient", "calm", "abstract", "atmospheric"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.background);
    ctx.fillStyle = verticalGradient(ctx, height, [
      palette.colors[1],
      palette.colors[0],
      palette.background,
      mixHex(palette.background, palette.colors[1], 0.4),
    ]);
    ctx.fillRect(0, 0, width, height);

    const noise = createNoise2D(rng.next);
    const scale = scaleFor(width, height);
    const bands = Math.round(lerp(3, 8, params.density));

    withLayer(
      ctx,
      width,
      height,
      { blur: lerp(14, 44, params.detail) * scale, composite: "screen", alpha: 0.95 },
      (l) => {
        for (let b = 0; b < bands; b += 1) {
          const color = palette.colors[2 + (b % Math.max(1, palette.colors.length - 3))];
          const baseY = height * (0.12 + 0.82 * (b / Math.max(1, bands - 1)));
          const amplitude = height * lerp(0.05, 0.2, params.turbulence) * (0.6 + rng.next());
          const thickness = lerp(90, 380, params.detail) * scale * (0.5 + rng.next());
          const freq = lerp(0.5, 1.7, params.detail) / width;
          const phase = rng.range(0, 1000);

          const top: Array<[number, number]> = [];
          const bottom: Array<[number, number]> = [];
          for (let x = -60; x <= width + 60; x += 6) {
            const drift =
              noise(x * freq, phase) * amplitude +
              noise(x * freq * 2.7, phase + 40) * amplitude * 0.32;
            top.push([x, baseY + drift]);
            bottom.push([x, baseY + thickness + drift * 0.7]);
          }

          l.beginPath();
          smoothLine(l, top);
          for (let i = bottom.length - 1; i >= 0; i -= 1) l.lineTo(bottom[i][0], bottom[i][1]);
          l.closePath();

          const grad = l.createLinearGradient(0, baseY - amplitude, 0, baseY + thickness);
          grad.addColorStop(0, rgbaFromHex(color, 0));
          grad.addColorStop(0.28, rgbaFromHex(color, lerp(0.22, 0.6, params.contrast)));
          grad.addColorStop(0.5, rgbaFromHex(mixHex(color, palette.colors[palette.colors.length - 1], 0.35), lerp(0.3, 0.72, params.contrast)));
          grad.addColorStop(0.72, rgbaFromHex(color, lerp(0.18, 0.5, params.contrast)));
          grad.addColorStop(1, rgbaFromHex(color, 0));
          l.fillStyle = grad;
          l.fill();

          // bright core line
          l.beginPath();
          smoothLine(l, top.map(([x, y]) => [x, y + thickness * 0.32] as [number, number]));
          l.strokeStyle = rgbaFromHex(palette.colors[palette.colors.length - 1], lerp(0.1, 0.32, params.contrast));
          l.lineWidth = lerp(1.5, 5, params.detail) * scale;
          l.stroke();
        }
      },
    );

    const starCount = Math.round(lerp(120, 340, params.density) * scale);
    for (let i = 0; i < starCount; i += 1) {
      const x = rng.next() * width;
      const y = rng.next() * height * 0.7;
      const r = Math.pow(rng.next(), 2.2) * 2 * scale + 0.3 * scale;
      const bright = rng.bool(0.08);
      ctx.globalAlpha = bright ? 0.9 : 0.15 + rng.next() * 0.6;
      ctx.fillStyle = bright ? palette.accent : palette.colors[palette.colors.length - 1];
      ctx.beginPath();
      ctx.arc(x, y, bright ? r * 1.6 : r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    applyGrain(ctx, width, height, params.grain);
    applyVignette(ctx, width, height, lerp(0.08, 0.32, params.contrast), palette.background);
  },
};

/* -------------------------------------------------------------------- Mesh */

const mesh: Generator = {
  id: "mesh",
  name: "Mesh",
  blurb: "Soft blooms of colour melting into a smooth gradient",
  tags: ["gradient", "minimal", "soft", "modern"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.colors[1]);
    ctx.fillStyle = linearGradient(ctx, 0, 0, width, height, [
      palette.colors[1],
      mixHex(palette.colors[1], palette.colors[3], 0.5),
      palette.colors[3],
    ]);
    ctx.fillRect(0, 0, width, height);

    const blobs = Math.round(lerp(4, 8, params.density));
    withLayer(
      ctx,
      width,
      height,
      { blur: lerp(40, 130, params.detail) * scaleFor(width, height), composite: "screen" },
      (l) => {
        for (let i = 0; i < blobs; i += 1) {
          const x = rng.range(-0.1, 1.1) * width;
          const y = rng.range(-0.1, 1.1) * height;
          const radius = lerp(0.3, 0.75, params.detail) * Math.max(width, height) * (0.55 + rng.next());
          const color = palette.colors[2 + rng.int(0, palette.colors.length - 3)];
          const g = l.createRadialGradient(x, y, 0, x, y, radius);
          const s = lerp(0.22, 0.55, params.contrast);
          g.addColorStop(0, rgbaFromHex(color, s));
          g.addColorStop(0.4, rgbaFromHex(color, s * 0.55));
          g.addColorStop(0.75, rgbaFromHex(color, s * 0.14));
          g.addColorStop(1, rgbaFromHex(color, 0));
          l.fillStyle = g;
          l.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
      },
    );

    // faint diagonal sheen
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = linearGradient(ctx, 0, 0, width, height, [
      rgbaFromHex(palette.colors[palette.colors.length - 1], 0.12),
      rgbaFromHex(palette.colors[0], 0.08),
    ]);
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    applyGrain(ctx, width, height, params.grain * 0.8);
    applyVignette(ctx, width, height, lerp(0.04, 0.22, params.contrast), palette.colors[1]);
  },
};

/* -------------------------------------------------------------------- Flow */

const flow: Generator = {
  id: "flow",
  name: "Flow",
  blurb: "Thousands of strokes tracing an invisible current",
  tags: ["particles", "organic", "energetic", "abstract"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.background);
    ctx.fillStyle = verticalGradient(ctx, height, [
      palette.background,
      mixHex(palette.background, palette.colors[1], 0.6),
      palette.colors[1],
    ]);
    ctx.fillRect(0, 0, width, height);

    radialGlow(ctx, width * 0.5, height * 0.45, Math.max(width, height) * 0.6, palette.colors[2], lerp(0.06, 0.16, params.contrast));

    const noise = createNoise3D(rng.next);
    const scale = scaleFor(width, height);
    const fieldScale = lerp(0.0007, 0.0021, params.detail);
    const particles = Math.round(lerp(1100, 3200, params.density) * scale);
    const steps = Math.round(lerp(70, 190, params.detail));
    const stepLength = lerp(2.2, 4.6, params.turbulence) * scale;
    const z = rng.range(0, 100);
    const strokeColors = [
      palette.colors[2],
      palette.colors[3],
      palette.colors[palette.colors.length - 2],
    ];

    withLayer(ctx, width, height, { composite: "lighter", alpha: 0.9 }, (l) => {
      l.lineCap = "round";
      for (let p = 0; p < particles; p += 1) {
        let x = rng.next() * width;
        let y = rng.next() * height;
        const color = strokeColors[rng.int(0, strokeColors.length - 1)];
        const baseAlpha = lerp(0.025, 0.1, params.contrast);
        l.lineWidth = lerp(0.5, 2, params.density) * scale;
        l.beginPath();
        l.moveTo(x, y);
        let broke = false;
        for (let s = 0; s < steps; s += 1) {
          const angle = noise(x * fieldScale, y * fieldScale, z) * Math.PI * 3;
          x += Math.cos(angle) * stepLength;
          y += Math.sin(angle) * stepLength;
          if (x < -20 || x > width + 20 || y < -20 || y > height + 20) {
            broke = true;
            break;
          }
          l.lineTo(x, y);
        }
        l.strokeStyle = rgbaFromHex(color, broke ? baseAlpha * 0.6 : baseAlpha);
        l.stroke();
      }
    });

    applyGrain(ctx, width, height, params.grain);
    applyVignette(ctx, width, height, lerp(0.12, 0.4, params.contrast), palette.background);
  },
};

/* ------------------------------------------------------------------ Strata */

const strata: Generator = {
  id: "strata",
  name: "Strata",
  blurb: "Topographic ridges receding into haze",
  tags: ["lines", "geometric", "map", "structured"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    // sky: a hazy wash the far ridges will blend into
    const sky = mixHex(palette.colors[1], palette.colors[palette.colors.length - 1], 0.4);
    fillBackground(ctx, width, height, sky);
    ctx.fillStyle = verticalGradient(ctx, height, [
      mixHex(sky, palette.colors[palette.colors.length - 1], 0.35),
      sky,
      mixHex(sky, palette.colors[2], 0.3),
    ]);
    ctx.fillRect(0, 0, width, height);

    radialGlow(ctx, width * 0.7, height * 0.2, Math.max(width, height) * 0.8, palette.accent, lerp(0.1, 0.22, params.contrast));

    const noise = createNoise2D(rng.next);
    const scale = scaleFor(width, height);
    const layers = Math.round(lerp(7, 16, params.density));
    const freq = lerp(0.0009, 0.0026, params.detail);

    // draw far (top, hazy) to near (bottom, dark, opaque)
    for (let i = 0; i < layers; i += 1) {
      const t = i / (layers - 1);
      const baseY = lerp(height * 0.16, height * 0.92, t);
      const amp = lerp(24, 130, params.turbulence) * scale * (0.7 + t * 0.9);
      const ridge = mixHex(
        sky,
        mixHex(palette.colors[2], palette.background, 0.4),
        Math.pow(t, 0.7),
      );

      const pts: Array<[number, number]> = [];
      for (let x = -20; x <= width + 20; x += 6) {
        const y =
          baseY +
          noise(x * freq, i * 0.5) * amp +
          noise(x * freq * 2.7, i * 0.5 + 9) * amp * 0.28;
        pts.push([x, y]);
      }

      ctx.beginPath();
      ctx.moveTo(-20, height + 20);
      smoothLine(ctx, pts);
      ctx.lineTo(width + 20, height + 20);
      ctx.closePath();
      ctx.fillStyle = rgbaFromHex(ridge, lerp(0.55, 1, t));
      ctx.fill();

      // a thin sunlit rim on each crest
      ctx.beginPath();
      smoothLine(ctx, pts);
      ctx.strokeStyle = rgbaFromHex(
        mixHex(ridge, palette.accent, 0.35 + t * 0.2),
        lerp(0.2, 0.6, t) * lerp(0.5, 1, params.contrast),
      );
      ctx.lineWidth = lerp(0.8, 2, params.detail) * scale;
      ctx.stroke();
    }

    applyGrain(ctx, width, height, params.grain);
    applyVignette(ctx, width, height, lerp(0.08, 0.3, params.contrast), palette.colors[0]);
  },
};

/* -------------------------------------------------------------- Tessellate */

const tessellate: Generator = {
  id: "tessellate",
  name: "Tessellate",
  blurb: "A shattered mosaic of faceted glass",
  tags: ["geometric", "mosaic", "bold", "faceted"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.background);
    const scale = scaleFor(width, height);
    const cols = Math.round(lerp(6, 20, params.density));
    const rows = Math.max(2, Math.round((cols * height) / width));
    const cellW = width / cols;
    const cellH = height / rows;
    const jitter = lerp(0.12, 0.5, params.turbulence);
    const light = { x: rng.range(-0.2, 1.2) * width, y: rng.range(-0.6, 0.1) * height };
    const diag = Math.hypot(width, height);

    const point = (cx: number, cy: number) => ({
      x: cx * cellW + (rng.next() - 0.5) * cellW * jitter * 2,
      y: cy * cellH + (rng.next() - 0.5) * cellH * jitter * 2,
    });

    const grid: { x: number; y: number }[][] = [];
    for (let y = 0; y <= rows; y += 1) {
      const line: { x: number; y: number }[] = [];
      for (let x = 0; x <= cols; x += 1) line.push(point(x, y));
      grid.push(line);
    }

    type P = { x: number; y: number };
    const paint = (a: P, b: P, c: P) => {
      const midX = (a.x + b.x + c.x) / 3;
      const midY = (a.y + b.y + c.y) / 3;
      const dist = Math.hypot(midX - light.x, midY - light.y) / diag;
      const shade = clamp01(1 - dist * lerp(0.7, 1.8, params.contrast));
      const base = palette.colors[1 + rng.int(0, palette.colors.length - 2)];
      const facet = mixHex(base, palette.colors[palette.colors.length - 1], shade * 0.85);
      // per facet gradient toward the light for glassiness
      const g = ctx.createLinearGradient(a.x, a.y, c.x, c.y);
      g.addColorStop(0, mixHex(facet, palette.colors[palette.colors.length - 1], 0.12));
      g.addColorStop(1, mixHex(facet, palette.background, 0.14));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = rgbaFromHex(palette.background, 0.4);
      ctx.lineWidth = Math.max(0.75, 0.9 * scale);
      ctx.stroke();
    };

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const tl = grid[y][x];
        const tr = grid[y][x + 1];
        const bl = grid[y + 1][x];
        const br = grid[y + 1][x + 1];
        if (rng.bool()) {
          paint(tl, tr, bl);
          paint(tr, br, bl);
        } else {
          paint(tl, tr, br);
          paint(tl, br, bl);
        }
      }
    }

    radialGlow(ctx, light.x, light.y, diag * 0.95, palette.accent, lerp(0.08, 0.18, params.contrast));
    applyGrain(ctx, width, height, params.grain * 0.6);
    applyVignette(ctx, width, height, lerp(0.08, 0.3, params.contrast), palette.background);
  },
};

/* ----------------------------------------------------------------- Orbital */

const orbital: Generator = {
  id: "orbital",
  name: "Orbital",
  blurb: "A quiet planet against deep space and a dust cloud",
  tags: ["space", "scenic", "dramatic", "cosmic"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.background);
    const scale = scaleFor(width, height);

    // nebula, built from a few blurred blooms
    withLayer(
      ctx,
      width,
      height,
      { blur: lerp(50, 150, params.detail) * scale, composite: "screen" },
      (l) => {
        const clouds = Math.round(lerp(2, 5, params.detail));
        for (let i = 0; i < clouds; i += 1) {
          const color = palette.colors[2 + rng.int(0, palette.colors.length - 3)];
          const x = rng.range(0, width);
          const y = rng.range(0, height);
          const radius = Math.max(width, height) * rng.range(0.3, 0.65);
          const g = l.createRadialGradient(x, y, 0, x, y, radius);
          const s = lerp(0.12, 0.34, params.contrast);
          g.addColorStop(0, rgbaFromHex(color, s));
          g.addColorStop(0.5, rgbaFromHex(color, s * 0.4));
          g.addColorStop(1, rgbaFromHex(color, 0));
          l.fillStyle = g;
          l.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
      },
    );

    const stars = Math.round(lerp(500, 1800, params.density) * scale);
    for (let i = 0; i < stars; i += 1) {
      const x = rng.next() * width;
      const y = rng.next() * height;
      const r = Math.pow(rng.next(), 3.4) * 2.6 * scale;
      const bright = rng.bool(0.04);
      ctx.globalAlpha = bright ? 1 : 0.2 + rng.next() * 0.7;
      ctx.fillStyle = bright
        ? palette.accent
        : rng.bool(0.85)
          ? palette.colors[palette.colors.length - 1]
          : palette.colors[3];
      ctx.beginPath();
      ctx.arc(x, y, bright ? r + 0.8 * scale : r, 0, Math.PI * 2);
      ctx.fill();
      if (bright) {
        ctx.strokeStyle = rgbaFromHex(palette.accent, 0.4);
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(x - r * 3, y);
        ctx.lineTo(x + r * 3, y);
        ctx.moveTo(x, y - r * 3);
        ctx.lineTo(x, y + r * 3);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    const planetR = Math.min(width, height) * lerp(0.3, 0.56, params.detail);
    const px = width * rng.range(0.2, 0.8);
    const py = height * rng.range(0.78, 1.12);

    // atmosphere limb glow
    withLayer(ctx, width, height, { blur: planetR * 0.16, composite: "screen" }, (l) => {
      l.strokeStyle = rgbaFromHex(palette.accent, lerp(0.3, 0.7, params.contrast));
      l.lineWidth = planetR * 0.06;
      l.beginPath();
      l.arc(px, py, planetR + l.lineWidth * 0.5, 0, Math.PI * 2);
      l.stroke();
    });

    const planet = ctx.createRadialGradient(
      px - planetR * 0.45,
      py - planetR * 0.45,
      planetR * 0.05,
      px,
      py,
      planetR,
    );
    planet.addColorStop(0, mixHex(palette.colors[3], palette.colors[palette.colors.length - 1], 0.3));
    planet.addColorStop(0.35, palette.colors[3]);
    planet.addColorStop(0.6, palette.colors[2]);
    planet.addColorStop(0.82, palette.colors[1]);
    planet.addColorStop(1, mixHex(palette.colors[0], palette.background, 0.5));
    ctx.fillStyle = planet;
    ctx.beginPath();
    ctx.arc(px, py, planetR, 0, Math.PI * 2);
    ctx.fill();

    // thin rim light on the sunlit edge
    ctx.strokeStyle = rgbaFromHex(palette.accent, 0.85);
    ctx.lineWidth = lerp(1.5, 4, params.contrast) * scale;
    ctx.beginPath();
    ctx.arc(px, py, planetR - ctx.lineWidth * 0.5, Math.PI * 1.05, Math.PI * 1.8);
    ctx.stroke();

    applyGrain(ctx, width, height, params.grain);
    applyVignette(ctx, width, height, lerp(0.18, 0.46, params.contrast), palette.background);
  },
};

/* --------------------------------------------------------------- Waveform */

const waveform: Generator = {
  id: "waveform",
  name: "Waveform",
  blurb: "Stacked sine bands like a frozen equaliser",
  tags: ["lines", "rhythmic", "retro", "structured"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.background);
    ctx.fillStyle = verticalGradient(ctx, height, [
      palette.colors[0],
      mixHex(palette.colors[0], palette.colors[1], 0.5),
      palette.colors[1],
    ]);
    ctx.fillRect(0, 0, width, height);
    radialGlow(ctx, width * 0.5, height * 0.08, Math.max(width, height) * 0.75, palette.accent, lerp(0.08, 0.18, params.contrast));

    const scale = scaleFor(width, height);
    const bands = Math.round(lerp(5, 15, params.density));
    const harmonics = Math.round(lerp(2, 6, params.detail));

    for (let b = 0; b < bands; b += 1) {
      const t = b / bands;
      const baseY = lerp(height * 0.12, height * 0.96, t);
      const color = mixHex(palette.colors[2], palette.colors[palette.colors.length - 1], t);
      const amp = lerp(18, 130, params.turbulence) * scale;
      const phase = rng.range(0, Math.PI * 2);
      const freqA = rng.range(1, 3) / width;

      const pts: Array<[number, number]> = [];
      for (let x = 0; x <= width; x += 6) {
        let y = baseY;
        for (let h = 1; h <= harmonics; h += 1) {
          y += (Math.sin(x * freqA * h * Math.PI * 2 + phase * h) * amp) / h;
        }
        pts.push([x, y]);
      }

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, pts[0][1]);
      smoothLine(ctx, pts);
      ctx.lineTo(width, height);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, baseY - amp, 0, height);
      g.addColorStop(0, rgbaFromHex(color, lerp(0.32, 0.85, params.contrast)));
      g.addColorStop(0.6, rgbaFromHex(color, lerp(0.12, 0.4, params.contrast)));
      g.addColorStop(1, rgbaFromHex(color, 0.015));
      ctx.fillStyle = g;
      ctx.fill();

      // crest highlight
      ctx.beginPath();
      smoothLine(ctx, pts);
      ctx.strokeStyle = rgbaFromHex(mixHex(color, palette.colors[palette.colors.length - 1], 0.5), 0.9);
      ctx.lineWidth = lerp(1, 2.4, params.detail) * scale;
      ctx.stroke();
    }

    applyGrain(ctx, width, height, params.grain);
    applyVignette(ctx, width, height, lerp(0.08, 0.3, params.contrast), palette.colors[0]);
  },
};

/* --------------------------------------------------------------- Bauhaus */

const bauhaus: Generator = {
  id: "bauhaus",
  name: "Bauhaus",
  blurb: "Primary shapes in a confident modernist grid",
  tags: ["geometric", "bold", "graphic", "retro"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    const paper = mixHex(palette.colors[palette.colors.length - 1], palette.colors[1], 0.05);
    fillBackground(ctx, width, height, paper);
    // subtle paper tone before the grain
    applyGrain(ctx, width, height, 0.4);

    const scale = scaleFor(width, height);
    const cells = Math.round(lerp(3, 7, params.density));
    const cellW = width / cells;
    const rows = Math.max(1, Math.round(height / cellW));
    const cellH = height / rows;
    const shapeColors = palette.colors.slice(1, palette.colors.length - 1);
    const shadow = rgbaFromHex(palette.colors[0], 0.18);
    const off = Math.min(cellW, cellH) * 0.03;

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cells; x += 1) {
        const cx = x * cellW;
        const cy = y * cellH;
        const color = shapeColors[rng.int(0, shapeColors.length - 1)];
        const kind = rng.int(0, 4);
        const pad = cellW * lerp(0.05, 0.16, 1 - params.detail);
        const drawShape = (fill: string, dx: number, dy: number) => {
          ctx.save();
          ctx.translate(cx + dx, cy + dy);
          ctx.fillStyle = fill;
          ctx.strokeStyle = fill;
          if (kind === 0) {
            ctx.beginPath();
            ctx.arc(cellW / 2, cellH / 2, Math.min(cellW, cellH) / 2 - pad, 0, Math.PI * 2);
            ctx.fill();
          } else if (kind === 1) {
            ctx.fillRect(pad, pad, cellW - pad * 2, cellH - pad * 2);
          } else if (kind === 2) {
            ctx.beginPath();
            const start = rng.int(0, 3) * (Math.PI / 2);
            ctx.moveTo(cellW / 2, cellH / 2);
            ctx.arc(cellW / 2, cellH / 2, Math.min(cellW, cellH) / 2 - pad, start, start + Math.PI);
            ctx.closePath();
            ctx.fill();
          } else if (kind === 3) {
            ctx.beginPath();
            ctx.moveTo(pad, cellH - pad);
            ctx.lineTo(cellW - pad, cellH - pad);
            ctx.lineTo(rng.bool() ? pad : cellW - pad, pad);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.lineWidth = Math.min(cellW, cellH) * lerp(0.1, 0.26, params.contrast);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(pad, pad);
            ctx.lineTo(cellW - pad, cellH - pad);
            ctx.moveTo(cellW - pad, pad);
            ctx.lineTo(pad, cellH - pad);
            ctx.stroke();
          }
          ctx.restore();
        };
        drawShape(shadow, off, off);
        drawShape(color, 0, 0);
      }
    }

    ctx.strokeStyle = rgbaFromHex(palette.colors[0], 0.12 * params.detail);
    ctx.lineWidth = Math.max(1, scale);
    for (let x = 1; x < cells; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * cellW, 0);
      ctx.lineTo(x * cellW, height);
      ctx.stroke();
    }

    applyGrain(ctx, width, height, params.grain * 0.35);
  },
};

/* -------------------------------------------------------------- Halftone */

const halftone: Generator = {
  id: "halftone",
  name: "Halftone",
  blurb: "A print screen of dots swelling across a gradient",
  tags: ["print", "retro", "pattern", "graphic"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.colors[0]);
    ctx.fillStyle = linearGradient(ctx, 0, 0, width * 0.3, height, [
      mixHex(palette.colors[1], palette.colors[0], 0.3),
      palette.colors[0],
    ]);
    ctx.fillRect(0, 0, width, height);

    const scale = scaleFor(width, height);
    const noise = createNoise2D(rng.next);
    const spacing = lerp(56, 22, params.detail) * scale;
    const maxR = spacing * lerp(0.44, 0.72, params.density);
    const angle = rng.range(-0.35, 0.35);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const freq = lerp(0.0009, 0.0024, params.detail);
    const inkLight = palette.colors[palette.colors.length - 1];
    const inkAccent = palette.accent;
    const diag = Math.hypot(width, height);
    const strength = lerp(0.55, 0.95, params.contrast);

    for (let gy = -diag; gy < diag; gy += spacing) {
      for (let gx = -diag; gx < diag; gx += spacing) {
        const x = width / 2 + gx * cos - gy * sin;
        const y = height / 2 + gx * sin + gy * cos;
        if (x < -spacing || x > width + spacing || y < -spacing || y > height + spacing) continue;
        const rd = Math.hypot(x - width * 0.5, y - height * 0.5) / diag;
        let v = (noise(x * freq, y * freq) + 1) / 2;
        v = clamp01(v * lerp(0.85, 1.6, params.contrast) - rd * 0.5 + 0.24);
        const r = v * maxR;
        if (r < 0.35) continue;
        ctx.fillStyle = rgbaFromHex(mixHex(inkLight, inkAccent, clamp01((v - 0.35) * 1.6)), strength);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    applyGrain(ctx, width, height, params.grain * 0.55);
    applyVignette(ctx, width, height, lerp(0.05, 0.28, params.contrast), palette.colors[0]);
  },
};

/* -------------------------------------------------------------- Terrazzo */

const terrazzo: Generator = {
  id: "terrazzo",
  name: "Terrazzo",
  blurb: "Scattered stone chips set in a pale floor",
  tags: ["scatter", "playful", "pattern", "organic"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    const base = mixHex(palette.colors[palette.colors.length - 1], palette.colors[1], 0.1);
    fillBackground(ctx, width, height, base);

    const scale = scaleFor(width, height);
    const chips = Math.round(lerp(160, 520, params.density) * scale);
    const chipColors = palette.colors.slice(1, palette.colors.length - 1);
    const outline = params.detail > 0.35;

    for (let i = 0; i < chips; i += 1) {
      const x = rng.next() * width;
      const y = rng.next() * height;
      const size = lerp(9, 42, params.detail) * scale * (0.4 + rng.next() * rng.next() * 2);
      const sides = rng.int(3, 6);
      const rot = rng.range(0, Math.PI * 2);
      const squish = rng.range(0.62, 1);
      const color = chipColors[rng.int(0, chipColors.length - 1)];

      // convex polygon: fixed radii, evenly spaced angles + small jitter
      const verts: Array<[number, number]> = [];
      for (let s = 0; s < sides; s += 1) {
        const a = (s / sides) * Math.PI * 2 + rng.range(-0.15, 0.15);
        const rr = size * rng.range(0.82, 1.1);
        verts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(1, squish);
      const trace = () => {
        ctx.beginPath();
        verts.forEach(([vx, vy], idx) => (idx === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy)));
        ctx.closePath();
      };
      ctx.globalAlpha = lerp(0.78, 1, params.contrast);
      ctx.fillStyle = color;
      trace();
      ctx.fill();
      // dimension: light top-left, shade bottom-right
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = mixHex(color, palette.colors[palette.colors.length - 1], 0.6);
      ctx.beginPath();
      ctx.arc(-size * 0.4, -size * 0.4, size * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = mixHex(color, "#000000", 0.4);
      ctx.beginPath();
      ctx.arc(size * 0.5, size * 0.5, size * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (outline) {
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = Math.max(1, scale);
        ctx.strokeStyle = base;
        trace();
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    radialGlow(ctx, width * 0.5, height * 0.3, Math.max(width, height) * 0.75, palette.accent, 0.07);
    applyGrain(ctx, width, height, params.grain);
    applyVignette(ctx, width, height, lerp(0.03, 0.2, params.contrast), base);
  },
};

/* ---------------------------------------------------------------- Ripple */

const ripple: Generator = {
  id: "ripple",
  name: "Ripple",
  blurb: "Slow rings spreading from points on still water",
  tags: ["concentric", "calm", "hypnotic", "lines"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.background);
    ctx.fillStyle = verticalGradient(ctx, height, [
      palette.colors[0],
      mixHex(palette.colors[0], palette.colors[1], 0.6),
      palette.colors[1],
    ]);
    ctx.fillRect(0, 0, width, height);

    const scale = scaleFor(width, height);
    const noise = createNoise2D(rng.next);
    const sources = Math.round(lerp(2, 3, params.detail));
    const spacing = lerp(74, 34, params.density) * scale;
    const maxRadius = Math.hypot(width, height) * 1.1;
    const wobble = lerp(0, 22, params.turbulence) * scale;

    withLayer(ctx, width, height, { composite: "screen", alpha: 0.95 }, (l) => {
      for (let s = 0; s < sources; s += 1) {
        const ox = rng.range(width * 0.15, width * 0.85);
        const oy = rng.range(height * 0.15, height * 0.85);
        const color = palette.colors[2 + rng.int(0, palette.colors.length - 3)];
        const phase = rng.range(0, 10);

        // central bloom
        radialGlow(l, ox, oy, maxRadius * 0.4, color, lerp(0.12, 0.26, params.contrast));

        let ringIndex = 0;
        for (let r = spacing; r < maxRadius; r += spacing) {
          const fade = 1 - r / maxRadius;
          const pts: Array<[number, number]> = [];
          const steps = 120;
          for (let i = 0; i <= steps; i += 1) {
            const a = (i / steps) * Math.PI * 2;
            const wob = wobble * noise(Math.cos(a) * 2 + phase, Math.sin(a) * 2 + r * 0.0012);
            const rr = r + wob;
            pts.push([ox + Math.cos(a) * rr, oy + Math.sin(a) * rr]);
          }
          // faint fill on alternate rings for body
          if (ringIndex % 2 === 0) {
            l.beginPath();
            pts.forEach(([x, y], idx) => (idx === 0 ? l.moveTo(x, y) : l.lineTo(x, y)));
            l.closePath();
            l.fillStyle = rgbaFromHex(color, lerp(0.015, 0.05, params.contrast) * fade);
            l.fill();
          }
          l.beginPath();
          pts.forEach(([x, y], idx) => (idx === 0 ? l.moveTo(x, y) : l.lineTo(x, y)));
          l.closePath();
          l.strokeStyle = rgbaFromHex(
            mixHex(color, palette.colors[palette.colors.length - 1], 0.3),
            lerp(0.1, 0.28, params.contrast) * fade,
          );
          l.lineWidth = lerp(1.4, 4, params.density) * scale;
          l.stroke();
          ringIndex += 1;
        }
      }
    });

    applyGrain(ctx, width, height, params.grain);
    applyVignette(ctx, width, height, lerp(0.1, 0.36, params.contrast), palette.colors[0]);
  },
};

/* ---------------------------------------------------------------- Marble */

const marble: Generator = {
  id: "marble",
  name: "Marble",
  blurb: "Mineral veins pulled through polished stone",
  tags: ["organic", "painterly", "veined", "atmospheric"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    const stone = mixHex(palette.colors[1], palette.colors[3], 0.45);
    fillBackground(ctx, width, height, stone);
    ctx.fillStyle = linearGradient(ctx, 0, 0, width, height, [
      mixHex(palette.colors[0], stone, 0.5),
      stone,
      mixHex(palette.colors[3], stone, 0.4),
    ]);
    ctx.fillRect(0, 0, width, height);

    const scale = scaleFor(width, height);
    const warp = createNoise2D(rng.next);
    const warpX = createNoise2D(rng.next);
    const grit = createNoise2D(rng.next);
    const veins = Math.round(lerp(40, 130, params.density));
    const warpAmount = lerp(160, 560, params.turbulence) * scale;
    const octaves = Math.round(lerp(2, 5, params.detail));
    const veinLight = palette.colors[palette.colors.length - 1];

    const vein = (baseY: number, seed: number, color: string, alpha: number, weight: number) => {
      const pts: Array<[number, number]> = [];
      for (let x = -20; x <= width + 20; x += 8) {
        let amp = warpAmount;
        let freq = 0.0006;
        let y = baseY;
        let sx = x;
        for (let o = 0; o < octaves; o += 1) {
          sx += warpX(x * freq + seed, baseY * freq) * amp * 0.4;
          y += warp(sx * freq, baseY * freq + seed * 0.05) * amp;
          amp *= 0.5;
          freq *= 2.15;
        }
        y += grit(x * 0.012, seed) * 6 * scale;
        pts.push([x, y]);
      }
      ctx.beginPath();
      smoothLine(ctx, pts);
      ctx.strokeStyle = rgbaFromHex(color, alpha);
      ctx.lineWidth = weight;
      ctx.stroke();
    };

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let v = 0; v < veins; v += 1) {
      const t = v / veins;
      vein(
        lerp(-height * 0.15, height * 1.15, t),
        v,
        rng.bool(0.75) ? veinLight : palette.colors[3 + rng.int(0, palette.colors.length - 4)],
        lerp(0.05, 0.16, params.contrast),
        lerp(0.7, 2.8, params.detail) * scale * (0.5 + rng.next()),
      );
    }
    ctx.restore();

    // bold fissures, softly glowing
    const fissures = Math.round(lerp(3, 8, params.detail));
    withLayer(ctx, width, height, { blur: 1.4 * scale }, (l) => {
      for (let f = 0; f < fissures; f += 1) {
        const baseY = rng.range(0, height);
        const seed = 900 + f * 17;
        const pts: Array<[number, number]> = [];
        for (let x = -20; x <= width + 20; x += 8) {
          let amp = warpAmount;
          let freq = 0.0006;
          let y = baseY;
          let sx = x;
          for (let o = 0; o < octaves; o += 1) {
            sx += warpX(x * freq + seed, baseY * freq) * amp * 0.4;
            y += warp(sx * freq, baseY * freq + seed * 0.05) * amp;
            amp *= 0.5;
            freq *= 2.15;
          }
          pts.push([x, y]);
        }
        l.beginPath();
        smoothLine(l, pts);
        l.strokeStyle = rgbaFromHex(palette.colors[0], lerp(0.16, 0.36, params.contrast));
        l.lineWidth = lerp(1.4, 3.4, params.detail) * scale;
        l.stroke();
      }
    });

    // polished sheen
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = linearGradient(ctx, 0, 0, width, height, [
      rgbaFromHex(veinLight, 0.16),
      rgbaFromHex(veinLight, 0),
      rgbaFromHex(palette.colors[0], 0.1),
    ]);
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    applyGrain(ctx, width, height, params.grain * 0.9);
    applyVignette(ctx, width, height, lerp(0.06, 0.28, params.contrast), stone);
  },
};

export const GENERATORS: Generator[] = [
  aurora,
  mesh,
  flow,
  strata,
  tessellate,
  orbital,
  waveform,
  bauhaus,
  halftone,
  terrazzo,
  ripple,
  marble,
];

export const GENERATOR_MAP: Record<string, Generator> = Object.fromEntries(
  GENERATORS.map((generator) => [generator.id, generator]),
);

export function getGenerator(id: string): Generator {
  return GENERATOR_MAP[id] ?? GENERATORS[0];
}
