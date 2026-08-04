"use client";
import { useState } from "react";

export function NewsletterK() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const subscribe = async () => {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ borderTop: "1px solid rgba(239,233,218,0.08)", borderBottom: "1px solid rgba(239,233,218,0.08)" }}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center" style={{ padding: "80px 52px" }}>
        <div>
          <h2 className="font-display font-bold leading-[1.1] tracking-[-0.02em] mb-3"
            style={{ fontSize: "clamp(28px,3vw,44px)", color: "#EFE9DA" }}>
            First to Know
          </h2>
          <p className="text-[13px] leading-[1.7]" style={{ color: "rgba(239,233,218,0.55)" }}>
            New arrivals, exclusive drops and curated edits — straight to your inbox.
          </p>
        </div>
        <div>
          {status === "success" ? (
            <p className="text-[11px] tracking-[0.1em] uppercase" style={{ color: "rgba(239,233,218,0.5)" }}>Subscribed ✓</p>
          ) : (
            <>
              <div className="flex gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && subscribe()}
                  placeholder="Your email"
                  className="flex-1 px-4 py-3.5 text-[13px] outline-none transition-colors"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(201,164,74,0.4)",
                    borderRadius: "2px",
                    color: "#EFE9DA",
                  }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "#C9A44A"; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(201,164,74,0.4)"; }}
                />
                <button
                  onClick={subscribe}
                  disabled={status === "loading"}
                  className="px-7 py-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-all whitespace-nowrap disabled:opacity-50"
                  style={{ background: "transparent", border: "1px solid #C9A44A", color: "#C9A44A", borderRadius: "2px" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#C9A44A"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#C9A44A"; }}
                >
                  {status === "loading" ? "…" : "Subscribe"}
                </button>
              </div>
              <p className="text-[10px] mt-3" style={{ color: "rgba(239,233,218,0.3)" }}>
                By subscribing you agree to our Privacy Policy. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
