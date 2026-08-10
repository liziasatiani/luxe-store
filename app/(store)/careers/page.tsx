import { buildMetadata } from "@/lib/seo";
import { getLocale } from "next-intl/server";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "Careers", description: "Join the Everything Street team.", locale });
}

export default function CareersPage() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 24 }}>Careers</p>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 700, color: "var(--chalk)", marginBottom: 24, lineHeight: 1.2 }}>
          Join Everything Street
        </h1>
        <p style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.8, marginBottom: 40 }}>
          We're not hiring right now, but we're always looking for talented people.
          Send your CV to{" "}
          <a href="mailto:careers@everythingstreet.ge" style={{ color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid var(--borderg)" }}>
            careers@everythingstreet.ge
          </a>{" "}
          and we'll keep you in mind.
        </p>
        <div style={{ width: 40, height: 1, background: "var(--gold)", margin: "0 auto", opacity: 0.4 }} />
      </div>
    </div>
  );
}
