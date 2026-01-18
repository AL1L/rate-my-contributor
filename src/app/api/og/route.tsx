import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "Unknown User";
  const avatar = searchParams.get("avatar") || "https://via.placeholder.com/150";
  const rating = searchParams.get("rating") || "0.0";
  const count = searchParams.get("count") || "0";

  const fullStars = Math.floor(parseFloat(rating));
  const halfStar = parseFloat(rating) - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
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
      
      {/* Avatar Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "50px" }}>
        <img
          src={avatar}
          alt="Avatar"
          width={200}
          height={200}
          style={{ borderRadius: "50%", border: "5px solid #fff" }}
        />
      </div>

      {/* Content Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {/* Username */}
        <div style={{ display: "flex", fontSize: 56, fontWeight: 500, marginBottom: 20, color: "#cccccc" }}>
          {username}
        </div>

        {/* Stars */}
        <div style={{ display: "flex", marginBottom: 20 }}>
          {Array.from({ length: fullStars }).map((_, i) => (
            <svg
              key={`full-${i}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="yellow"
              width="48"
              height="48"
              style={{ marginRight: "5px" }}
            >
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.158L12 18.896l-7.334 3.854 1.4-8.158L.132 9.21l8.2-1.192L12 .587z" />
            </svg>
          ))}
          {halfStar && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="gray"
              width="48"
              height="48"
              style={{ marginRight: "5px" }}
            >
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.158L12 18.896l-7.334 3.854 1.4-8.158L.132 9.21l8.2-1.192L12 .587z" />
              <path d="M12 .587V.587L8.332 8.018l-8.2 1.192 5.934 5.782-1.4 8.158L12 18.896z" fill="yellow" />
            </svg>
          )}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <svg
              key={`empty-${i}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="gray"
              width="48"
              height="48"
              style={{ marginRight: "5px" }}
            >
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.158L12 18.896l-7.334 3.854 1.4-8.158L.132 9.21l8.2-1.192L12 .587z" />
            </svg>
          ))}
        </div>

        {/* Rating and Reviews */}
        <div style={{ display: "flex", marginTop: 10, fontSize: 32, color: "#aaa" }}>
          {rating}/5 ({count} reviews)
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
        }}
      >
        RateMyContributor.com
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
