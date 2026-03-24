import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Invoicer — Professional Invoice Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #000 0%, #1a1a2e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-2px",
            marginBottom: 16,
          }}
        >
          Invoicer
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Create, manage, and send professional invoices in minutes.
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["PDF Export", "Email Delivery", "170+ Currencies", "Analytics"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 999,
                  padding: "8px 20px",
                  color: "#e4e4e7",
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {feature}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
