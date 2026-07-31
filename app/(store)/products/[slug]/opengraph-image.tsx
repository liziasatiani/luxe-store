import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props { params: Promise<{ slug: string }> }

export default async function OGImage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    select: { name: true, price: true, brand: { select: { name: true } }, images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
  });

  const name = product?.name ?? "Everything Street";
  const brand = product?.brand?.name ?? "";
  const price = product ? `$${Number(product.price).toFixed(2)}` : "";
  const imageUrl = product?.images[0]?.url;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          fontFamily: "serif",
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            style={{ width: 630, height: 630, objectFit: "cover", opacity: 0.6 }}
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 60px 60px 50px",
            flex: 1,
          }}
        >
          <p style={{ color: "#666", fontSize: 14, letterSpacing: 4, textTransform: "uppercase", margin: "0 0 16px" }}>
            {brand || "Everything Street"}
          </p>
          <p style={{ color: "#fff", fontSize: name.length > 40 ? 32 : 42, fontWeight: 300, lineHeight: 1.2, margin: "0 0 24px" }}>
            {name}
          </p>
          {price && (
            <p style={{ color: "#999", fontSize: 28, margin: "0 0 40px" }}>{price}</p>
          )}
          <p style={{ color: "#444", fontSize: 13, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
            everythingstreet.com
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
