import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Fetch stats
  const totalUsers = await prisma.gitHubProfile.count();
  const totalRatings = await prisma.rating.count();
  // const totalPRs = await prisma.pullRequest.count();

  try {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          fontSize: 48,
          fontWeight: 600,
          fontFamily: "Arial, sans-serif",
          padding: "50px",
          position: "relative",
        }}
      >
        {/* Geometric background elements */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 50,
              right: 100,
              width: "280px",
              height: "280px",
              border: "2px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "50%",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 100,
              left: 150,
              width: "220px",
              height: "220px",
              border: "2px solid rgba(255, 255, 255, 0.06)",
              transform: "rotate(45deg)",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 280,
              left: 680,
              width: "200px",
              height: "200px",
              border: "2px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
            }}
          />
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, marginBottom: 30, color: "#ffffff" }}>
            Rate My Contributor
          </div>

          <div style={{ display: "flex", fontSize: 32, fontWeight: 400, marginBottom: 50, color: "#aaaaaa" }}>
            Discover and rate GitHub contributors
          </div>

          {/* Stats Grid */}
          <div style={{ display: "flex", flexDirection: "row", gap: "60px", marginTop: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#ffdd00" }}>
                {totalUsers.toLocaleString()}
              </div>
              <div style={{ display: "flex", fontSize: 24, color: "#888888" }}>
                Contributors
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#ffdd00" }}>
                {totalRatings.toLocaleString()}
              </div>
              <div style={{ display: "flex", fontSize: 24, color: "#888888" }}>
                Ratings
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 50,
            fontSize: 24,
            color: "#888",
            fontWeight: 400,
            display: "flex",
          }}
        >
          ratemycontributor.com
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
