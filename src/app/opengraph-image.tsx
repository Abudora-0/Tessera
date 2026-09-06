import { ImageResponse } from "next/og";

export const alt = "Tessera, a generative wallpaper studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0b0d",
          padding: 72,
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative", width: 60, height: 60, display: "flex" }}>
            <div style={{ position: "absolute", width: 0, height: 0, borderTop: "30px solid #e8b04b", borderRight: "30px solid transparent" }} />
            <div style={{ position: "absolute", right: 0, width: 0, height: 0, borderTop: "30px solid #8b7bff", borderLeft: "30px solid transparent" }} />
            <div style={{ position: "absolute", bottom: 0, width: 0, height: 0, borderBottom: "30px solid #f3f1ec", borderRight: "30px solid transparent" }} />
            <div style={{ position: "absolute", right: 0, bottom: 0, width: 0, height: 0, borderBottom: "30px solid #e8b04b", borderLeft: "30px solid transparent" }} />
          </div>
          <div style={{ color: "#f3f1ec", fontSize: 34, letterSpacing: -1 }}>tessera</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ color: "#f3f1ec", fontSize: 68, lineHeight: 1.05, maxWidth: 900 }}>
            Wallpapers grown from a single seed.
          </div>
          <div style={{ color: "#b7b4ad", fontSize: 28, maxWidth: 820 }}>
            Twelve families, eight palettes, exported pixel perfect for any screen.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["#e8b04b", "#8b7bff", "#7ee0e6", "#5fd08a", "#ff6fae"].map((color) => (
            <div key={color} style={{ width: 40, height: 40, background: color, transform: "rotate(45deg)" }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
