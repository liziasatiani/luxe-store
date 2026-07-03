"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <html>
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "1rem" }}>Everything Street</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Something went wrong</h1>
          <p style={{ color: "#9ca3af", marginBottom: "2rem" }}>An unexpected error occurred. Please try again.</p>
          <button
            onClick={reset}
            style={{ background: "#fff", color: "#000", border: "none", padding: "0.75rem 2rem", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
