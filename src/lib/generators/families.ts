import { createNoise2D, createNoise3D } from "simplex-noise";
import { mixHex, rgbaFromHex } from "@/lib/palettes";
import {
  applyGrain,
  applyVignette,
  fillBackground,
  lerp,
  radialGlow,
  scaleFor,
  verticalGradient,
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
      palette.colors[0],
      palette.background,
      palette.colors[1],
    ]);
    ctx.fillRect(0, 0, width, height);

    const noise = createNoise2D(rng.next);
    const scale = scaleFor(width, height);
    const bands = Math.round(lerp(3, 9, params.density));
    ctx.globalCompositeOperation = "screen";

    for (let b = 0; b < bands; b += 1) {
      const color = palette.colors[2 + (b % (palette.colors.length - 3))];
      const baseY = height * (0.15 + 0.8 * (b / Math.max(1, bands - 1)));
      const amplitude = height * lerp(0.05, 0.22, params.turbulence) * (0.6 + rng.next());
      const thickness = lerp(60, 320, params.detail) * scale * (0.5 + rng.next());
      const freq = lerp(0.4, 1.8, params.detail) / width;
      const phase = rng.range(0, 1000);

      ctx.beginPath();
      ctx.moveTo(-40, baseY);
      for (let x = -40; x <= width + 40; x += 12) {
        const y = baseY + noise(x * freq, phase) * amplitude + noise(x * freq * 3, phase) * amplitude * 0.3;
        ctx.lineTo(x, y);
      }
      for (let x = width + 40; x >= -40; x -= 12) {
        const y =
          baseY +
          thickness +
          noise(x * freq + 10, phase) * amplitude * 0.8;
        ctx.lineTo(x, y);
      }
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, baseY - amplitude, 0, baseY + thickness);
      gradient.addColorStop(0, rgbaFromHex(color, 0));
      gradient.addColorStop(0.5, rgbaFromHex(color, lerp(0.25, 0.7, params.contrast)));
      gradient.addColorStop(1, rgbaFromHex(color, 0));
      ctx.fillStyle = gradient;
      ctx.shadowColor = rgbaFromHex(color, 0.5);
      ctx.shadowBlur = thickness * 0.8;
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
    const starCount = Math.round(220 * params.density * scale);
    ctx.fillStyle = rgbaFromHex(palette.colors[palette.colors.length - 1], 0.8);
    for (let i = 0; i < starCount; i += 1) {
      const x = rng.next() * width;
      const y = rng.next() * height * 0.6;
      const r = rng.next() * 1.6 * scale;
      ctx.globalAlpha = 0.2 + rng.next() * 0.8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    applyGrain(ctx, width, height, rng, params.grain);
    applyVignette(ctx, width, height, lerp(0.1, 0.4, params.contrast));
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
    ctx.fillStyle = verticalGradient(ctx, height, [palette.colors[1], palette.colors[3]]);
    ctx.fillRect(0, 0, width, height);

    const scale = scaleFor(width, height);
    const blobs = Math.round(lerp(4, 11, params.density));
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < blobs; i += 1) {
      const x = rng.next() * width;
      const y = rng.next() * height;
      const radius = lerp(0.25, 0.7, params.detail) * Math.max(width, height) * (0.5 + rng.next());
      const color = palette.colors[2 + rng.int(0, palette.colors.length - 3)];
      radialGlow(ctx, x, y, radius, color, lerp(0.18, 0.5, params.contrast));
    }
    ctx.globalCompositeOperation = "source-over";

    const wobble = createNoise2D(rng.next);
    ctx.strokeStyle = rgbaFromHex(palette.colors[palette.colors.length - 1], 0.06 * params.detail);
    ctx.lineWidth = scale;
    const lines = Math.round(18 * params.detail);
    for (let i = 0; i < lines; i += 1) {
      ctx.beginPath();
      const offset = (i / lines) * height;
      for (let x = 0; x <= width; x += 16) {
        const y = offset + wobble(x * 0.001, i) * 60 * params.turbulence;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    applyGrain(ctx, width, height, rng, params.grain);
    applyVignette(ctx, width, height, lerp(0.05, 0.28, params.contrast));
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
    ctx.fillStyle = verticalGradient(ctx, height, [palette.background, palette.colors[1]]);
    ctx.fillRect(0, 0, width, height);

    const noise = createNoise3D(rng.next);
    const scale = scaleFor(width, height);
    const fieldScale = lerp(0.0007, 0.0022, params.detail);
    const particles = Math.round(lerp(600, 2600, params.density) * scale);
    const steps = Math.round(lerp(40, 150, params.detail));
    const stepLength = lerp(2.4, 5, params.turbulence) * scale;
    const z = rng.range(0, 100);

    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let p = 0; p < particles; p += 1) {
      let x = rng.next() * width;
      let y = rng.next() * height;
      const color = palette.colors[2 + rng.int(0, palette.colors.length - 3)];
      ctx.strokeStyle = rgbaFromHex(color, lerp(0.03, 0.12, params.contrast));
      ctx.lineWidth = lerp(0.6, 2.2, params.density) * scale;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < steps; s += 1) {
        const angle = noise(x * fieldScale, y * fieldScale, z) * Math.PI * 3;
        x += Math.cos(angle) * stepLength;
        y += Math.sin(angle) * stepLength;
        if (x < -20 || x > width + 20 || y < -20 || y > height + 20) break;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";

    applyGrain(ctx, width, height, rng, params.grain);
    applyVignette(ctx, width, height, lerp(0.15, 0.45, params.contrast));
  },
};

/* ------------------------------------------------------------------ Strata */

const strata: Generator = {
  id: "strata",
  name: "Strata",
  blurb: "Topographic contours stacked like weathered rock",
  tags: ["lines", "geometric", "map", "structured"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.background);
    ctx.fillStyle = verticalGradient(ctx, height, [palette.colors[0], palette.colors[2]]);
    ctx.fillRect(0, 0, width, height);

    const noise = createNoise2D(rng.next);
    const scale = scaleFor(width, height);
    const layers = Math.round(lerp(14, 46, params.density));
    const freq = lerp(0.0008, 0.003, params.detail);

    for (let i = 0; i < layers; i += 1) {
      const t = i / layers;
      const baseY = lerp(height * 1.05, height * -0.05, t);
      const amp = lerp(40, 260, params.turbulence) * scale * (0.6 + t);
      const color = mixHex(palette.colors[2], palette.colors[palette.colors.length - 1], t);

      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 10) {
        const y =
          baseY +
          noise(x * freq, i * 0.35) * amp +
          noise(x * freq * 2.4, i * 0.35) * amp * 0.35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = rgbaFromHex(color, lerp(0.05, 0.16, params.contrast));
      ctx.fill();
      ctx.strokeStyle = rgbaFromHex(color, lerp(0.35, 0.9, params.contrast));
      ctx.lineWidth = lerp(0.75, 2, params.detail) * scale;
      ctx.stroke();
    }

    radialGlow(ctx, width * 0.7, height * 0.2, Math.max(width, height) * 0.6, palette.accent, 0.16);
    applyGrain(ctx, width, height, rng, params.grain);
    applyVignette(ctx, width, height, lerp(0.12, 0.4, params.contrast));
  },
};

/* -------------------------------------------------------------- Tessellate */

const tessellate: Generator = {
  id: "tessellate",
  name: "Tessellate",
  blurb: "A shattered mosaic of triangular glass",
  tags: ["geometric", "mosaic", "bold", "faceted"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.background);
    const scale = scaleFor(width, height);
    const cols = Math.round(lerp(6, 22, params.density));
    const rows = Math.round((cols * height) / width);
    const cellW = width / cols;
    const cellH = height / rows;
    const jitter = lerp(0.1, 0.5, params.turbulence);
    const light = { x: rng.range(0, width), y: rng.range(-height, 0) };

    const point = (cx: number, cy: number) => ({
      x: cx * cellW + (rng.next() - 0.5) * cellW * jitter * 2,
      y: cy * cellH + (rng.next() - 0.5) * cellH * jitter * 2,
    });

    const grid: { x: number; y: number }[][] = [];
    for (let y = 0; y <= rows; y += 1) {
      const line: { x: number; y: number }[] = [];
      for (let x = 0; x <= cols; x += 1) {
        line.push(point(x, y));
      }
      grid.push(line);
    }

    const paintTriangle = (
      a: { x: number; y: number },
      b: { x: number; y: number },
      c: { x: number; y: number },
    ) => {
      const midX = (a.x + b.x + c.x) / 3;
      const midY = (a.y + b.y + c.y) / 3;
      const dist = Math.hypot(midX - light.x, midY - light.y) / Math.hypot(width, height);
      const shade = Math.min(1, Math.max(0, 1 - dist * lerp(0.6, 1.6, params.contrast)));
      const base = palette.colors[1 + rng.int(0, palette.colors.length - 2)];
      const lit = mixHex(base, palette.colors[palette.colors.length - 1], shade * 0.8);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      ctx.fillStyle = lit;
      ctx.fill();
      if (params.detail > 0.3) {
        ctx.strokeStyle = rgbaFromHex(palette.background, 0.35);
        ctx.lineWidth = 0.6 * scale;
        ctx.stroke();
      }
    };

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const tl = grid[y][x];
        const tr = grid[y][x + 1];
        const bl = grid[y + 1][x];
        const br = grid[y + 1][x + 1];
        if (rng.bool()) {
          paintTriangle(tl, tr, bl);
          paintTriangle(tr, br, bl);
        } else {
          paintTriangle(tl, tr, br);
          paintTriangle(tl, br, bl);
        }
      }
    }

    radialGlow(ctx, light.x, light.y, Math.max(width, height) * 0.9, palette.accent, 0.12);
    applyGrain(ctx, width, height, rng, params.grain * 0.7);
    applyVignette(ctx, width, height, lerp(0.1, 0.36, params.contrast));
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

    const stars = Math.round(lerp(400, 1600, params.density) * scale);
    for (let i = 0; i < stars; i += 1) {
      const x = rng.next() * width;
      const y = rng.next() * height;
      const r = Math.pow(rng.next(), 3) * 2.4 * scale;
      ctx.globalAlpha = 0.25 + rng.next() * 0.75;
      ctx.fillStyle = rng.bool(0.85)
        ? palette.colors[palette.colors.length - 1]
        : palette.accent;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const nebulaCount = Math.round(lerp(2, 5, params.detail));
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < nebulaCount; i += 1) {
      radialGlow(
        ctx,
        rng.range(0, width),
        rng.range(0, height),
        Math.max(width, height) * rng.range(0.3, 0.7),
        palette.colors[2 + rng.int(0, palette.colors.length - 3)],
        lerp(0.1, 0.32, params.contrast),
      );
    }
    ctx.globalCompositeOperation = "source-over";

    const planetR = Math.min(width, height) * lerp(0.28, 0.55, params.detail);
    const px = width * rng.range(0.2, 0.8);
    const py = height * rng.range(0.75, 1.15);
    const planet = ctx.createRadialGradient(
      px - planetR * 0.4,
      py - planetR * 0.4,
      planetR * 0.1,
      px,
      py,
      planetR,
    );
    planet.addColorStop(0, palette.colors[3]);
    planet.addColorStop(0.7, palette.colors[1]);
    planet.addColorStop(1, palette.background);
    ctx.fillStyle = planet;
    ctx.beginPath();
    ctx.arc(px, py, planetR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rgbaFromHex(palette.accent, 0.9);
    ctx.lineWidth = lerp(2, 6, params.contrast) * scale;
    ctx.beginPath();
    ctx.arc(px, py, planetR + ctx.lineWidth, Math.PI * 1.05, Math.PI * 1.85);
    ctx.stroke();

    applyGrain(ctx, width, height, rng, params.grain);
    applyVignette(ctx, width, height, lerp(0.2, 0.5, params.contrast));
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
    ctx.fillStyle = verticalGradient(ctx, height, [palette.colors[0], palette.colors[1]]);
    ctx.fillRect(0, 0, width, height);

    const scale = scaleFor(width, height);
    const bands = Math.round(lerp(5, 16, params.density));
    const harmonics = Math.round(lerp(2, 6, params.detail));

    for (let b = 0; b < bands; b += 1) {
      const t = b / bands;
      const baseY = lerp(height * 0.1, height * 0.95, t);
      const color = mixHex(palette.colors[2], palette.colors[palette.colors.length - 1], t);
      const amp = lerp(20, 150, params.turbulence) * scale;
      const phase = rng.range(0, Math.PI * 2);
      const freqA = rng.range(1, 3) / width;

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);
      for (let x = 0; x <= width; x += 8) {
        let y = baseY;
        for (let h = 1; h <= harmonics; h += 1) {
          y += (Math.sin(x * freqA * h * Math.PI * 2 + phase * h) * amp) / h;
        }
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, baseY - amp, 0, height);
      gradient.addColorStop(0, rgbaFromHex(color, lerp(0.3, 0.85, params.contrast)));
      gradient.addColorStop(1, rgbaFromHex(color, 0.02));
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = rgbaFromHex(color, 0.9);
      ctx.lineWidth = lerp(1, 2.6, params.detail) * scale;
      ctx.stroke();
    }

    radialGlow(ctx, width * 0.5, height * 0.1, Math.max(width, height) * 0.7, palette.accent, 0.14);
    applyGrain(ctx, width, height, rng, params.grain);
    applyVignette(ctx, width, height, lerp(0.1, 0.34, params.contrast));
  },
};

/* --------------------------------------------------------------- Bauhaus */

const bauhaus: Generator = {
  id: "bauhaus",
  name: "Bauhaus",
  blurb: "Primary shapes in a confident modernist grid",
  tags: ["geometric", "bold", "graphic", "retro"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.colors[palette.colors.length - 1]);
    ctx.fillStyle = rgbaFromHex(palette.colors[1], 0.12);
    ctx.fillRect(0, 0, width, height);

    const scale = scaleFor(width, height);
    const cells = Math.round(lerp(3, 8, params.density));
    const cellW = width / cells;
    const rows = Math.max(1, Math.round(height / cellW));
    const cellH = height / rows;
    const shapeColors = palette.colors.slice(1, palette.colors.length - 1);

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cells; x += 1) {
        const cx = x * cellW;
        const cy = y * cellH;
        const color = shapeColors[rng.int(0, shapeColors.length - 1)];
        const kind = rng.int(0, 4);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = color;
        const pad = cellW * lerp(0.06, 0.18, 1 - params.detail);
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
          ctx.lineWidth = Math.min(cellW, cellH) * lerp(0.12, 0.3, params.contrast);
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(pad, pad);
          ctx.lineTo(cellW - pad, cellH - pad);
          ctx.moveTo(cellW - pad, pad);
          ctx.lineTo(pad, cellH - pad);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    ctx.strokeStyle = rgbaFromHex(palette.colors[0], 0.15 * params.detail);
    ctx.lineWidth = scale;
    for (let x = 1; x < cells; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * cellW, 0);
      ctx.lineTo(x * cellW, height);
      ctx.stroke();
    }

    applyGrain(ctx, width, height, rng, params.grain * 0.5);
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
    ctx.fillStyle = verticalGradient(ctx, height, [palette.colors[1], palette.colors[0]]);
    ctx.fillRect(0, 0, width, height);

    const scale = scaleFor(width, height);
    const noise = createNoise2D(rng.next);
    const spacing = lerp(52, 20, params.detail) * scale;
    const maxR = spacing * lerp(0.42, 0.72, params.density);
    const angle = rng.range(-0.35, 0.35);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const freq = lerp(0.0009, 0.0026, params.detail);
    const inkLight = palette.colors[palette.colors.length - 1];
    const inkAccent = palette.accent;
    const diag = Math.hypot(width, height);

    for (let gy = -diag; gy < diag; gy += spacing) {
      for (let gx = -diag; gx < diag; gx += spacing) {
        const x = width / 2 + gx * cos - gy * sin;
        const y = height / 2 + gx * sin + gy * cos;
        if (x < -spacing || x > width + spacing || y < -spacing || y > height + spacing) continue;
        const rd = Math.hypot(x - width * 0.5, y - height * 0.5) / diag;
        let v = (noise(x * freq, y * freq) + 1) / 2;
        v = Math.min(1, Math.max(0, v * lerp(0.8, 1.6, params.contrast) - rd * 0.55 + 0.25));
        const r = v * maxR;
        if (r < 0.5) continue;
        ctx.fillStyle = rgbaFromHex(v > 0.62 ? inkAccent : inkLight, lerp(0.55, 0.95, params.contrast));
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    applyGrain(ctx, width, height, rng, params.grain * 0.6);
    applyVignette(ctx, width, height, lerp(0.05, 0.3, params.contrast));
  },
};

/* -------------------------------------------------------------- Terrazzo */

const terrazzo: Generator = {
  id: "terrazzo",
  name: "Terrazzo",
  blurb: "Scattered stone chips set in a pale floor",
  tags: ["scatter", "playful", "pattern", "organic"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    const base = mixHex(palette.colors[palette.colors.length - 1], palette.colors[1], 0.12);
    fillBackground(ctx, width, height, base);

    const scale = scaleFor(width, height);
    const chips = Math.round(lerp(150, 520, params.density) * scale);
    const chipColors = palette.colors.slice(1, palette.colors.length - 1);
    const outline = params.detail > 0.35;

    for (let i = 0; i < chips; i += 1) {
      const x = rng.next() * width;
      const y = rng.next() * height;
      const size = lerp(9, 44, params.detail) * scale * (0.4 + rng.next() * rng.next() * 2);
      const sides = rng.int(3, 6);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rng.range(0, Math.PI * 2));
      ctx.scale(1, rng.range(0.6, 1));
      ctx.beginPath();
      for (let s = 0; s < sides; s += 1) {
        const a = (s / sides) * Math.PI * 2;
        const rr = size * rng.range(0.7, 1.15);
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.globalAlpha = lerp(0.7, 1, params.contrast);
      ctx.fillStyle = chipColors[rng.int(0, chipColors.length - 1)];
      ctx.fill();
      if (outline) {
        ctx.globalAlpha = 0.22;
        ctx.lineWidth = scale;
        ctx.strokeStyle = base;
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    radialGlow(ctx, width * 0.5, height * 0.3, Math.max(width, height) * 0.7, palette.accent, 0.08);
    applyGrain(ctx, width, height, rng, params.grain);
    applyVignette(ctx, width, height, lerp(0.04, 0.22, params.contrast));
  },
};

/* ---------------------------------------------------------------- Ripple */

const ripple: Generator = {
  id: "ripple",
  name: "Ripple",
  blurb: "Overlapping rings spreading from points on still water",
  tags: ["concentric", "calm", "hypnotic", "lines"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    fillBackground(ctx, width, height, palette.background);
    ctx.fillStyle = verticalGradient(ctx, height, [palette.colors[0], palette.colors[1]]);
    ctx.fillRect(0, 0, width, height);

    const scale = scaleFor(width, height);
    const noise = createNoise2D(rng.next);
    const sources = Math.round(lerp(2, 5, params.detail));
    const spacing = lerp(48, 17, params.density) * scale;
    const maxRadius = Math.hypot(width, height);
    const wobble = lerp(0, 28, params.turbulence) * scale;

    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = lerp(1, 2.4, params.density) * scale;
    for (let s = 0; s < sources; s += 1) {
      const ox = rng.range(width * 0.1, width * 0.9);
      const oy = rng.range(height * 0.1, height * 0.9);
      const color = palette.colors[2 + rng.int(0, palette.colors.length - 3)];
      const phase = rng.range(0, 10);
      for (let r = spacing; r < maxRadius; r += spacing) {
        const alpha = lerp(0.05, 0.16, params.contrast) * (1 - r / maxRadius);
        if (alpha <= 0.002) continue;
        ctx.strokeStyle = rgbaFromHex(color, alpha);
        ctx.beginPath();
        const steps = 96;
        for (let i = 0; i <= steps; i += 1) {
          const a = (i / steps) * Math.PI * 2;
          const wob =
            wobble * noise(Math.cos(a) * 2 + phase, Math.sin(a) * 2 + r * 0.0015);
          const rr = r + wob;
          const px = ox + Math.cos(a) * rr;
          const py = oy + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = "source-over";

    radialGlow(ctx, width * 0.5, height * 0.5, maxRadius * 0.5, palette.accent, 0.1);
    applyGrain(ctx, width, height, rng, params.grain);
    applyVignette(ctx, width, height, lerp(0.12, 0.4, params.contrast));
  },
};

/* ---------------------------------------------------------------- Marble */

const marble: Generator = {
  id: "marble",
  name: "Marble",
  blurb: "Mineral veins pulled through a slab of stone",
  tags: ["organic", "painterly", "veined", "atmospheric"],
  draw({ ctx, width, height, palette, rng, params }: DrawContext) {
    const base = mixHex(palette.colors[1], palette.colors[3], 0.4);
    fillBackground(ctx, width, height, base);
    ctx.fillStyle = verticalGradient(ctx, height, [
      rgbaFromHex(palette.colors[0], 0.5),
      rgbaFromHex(palette.colors[3], 0.4),
    ]);
    ctx.fillRect(0, 0, width, height);

    const scale = scaleFor(width, height);
    const warp = createNoise2D(rng.next);
    const warpX = createNoise2D(rng.next);
    const grit = createNoise2D(rng.next);
    const veins = Math.round(lerp(90, 260, params.density));
    const warpAmount = lerp(160, 620, params.turbulence) * scale;
    const octaves = Math.round(lerp(2, 5, params.detail));
    const veinTint = palette.colors[palette.colors.length - 1];
    const fissureTint = palette.colors[0];

    const drawVein = (baseY: number, seedRow: number, colorStop: string, alpha: number, weight: number) => {
      ctx.strokeStyle = rgbaFromHex(colorStop, alpha);
      ctx.lineWidth = weight;
      ctx.beginPath();
      for (let x = -20; x <= width + 20; x += 12) {
        let amp = warpAmount;
        let freq = 0.0006;
        let y = baseY;
        let sx = x;
        for (let o = 0; o < octaves; o += 1) {
          sx += warpX(x * freq + seedRow, baseY * freq) * amp * 0.4;
          y += warp(sx * freq, baseY * freq + seedRow * 0.05) * amp;
          amp *= 0.5;
          freq *= 2.15;
        }
        y += grit(x * 0.012, seedRow) * 7 * scale;
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    ctx.globalCompositeOperation = "screen";
    for (let v = 0; v < veins; v += 1) {
      const t = v / veins;
      const baseY = lerp(-height * 0.2, height * 1.2, t);
      drawVein(
        baseY,
        v,
        rng.bool(0.7) ? veinTint : palette.colors[3 + rng.int(0, palette.colors.length - 4)],
        lerp(0.03, 0.12, params.contrast),
        lerp(0.6, 2.6, params.detail) * scale * (0.5 + rng.next()),
      );
    }
    ctx.globalCompositeOperation = "source-over";

    // a handful of bold fissures for depth
    const fissures = Math.round(lerp(3, 9, params.detail));
    for (let f = 0; f < fissures; f += 1) {
      drawVein(
        rng.range(0, height),
        1000 + f * 13,
        fissureTint,
        lerp(0.12, 0.3, params.contrast),
        lerp(1.4, 3.6, params.detail) * scale,
      );
    }

    radialGlow(ctx, width * 0.3, height * 0.25, Math.max(width, height) * 0.7, palette.accent, 0.1);
    applyGrain(ctx, width, height, rng, params.grain);
    applyVignette(ctx, width, height, lerp(0.08, 0.3, params.contrast));
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
