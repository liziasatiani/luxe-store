"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function NewsletterK() {
  const t = useTranslations("newsletter");
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
    <div className="nl-section">
      <div className="nl-inner">
        <div>
          <h2 className="nl-title">{t("title")}</h2>
          <p className="nl-desc">{t("desc")}</p>
        </div>
        <div>
          {status === "success" ? (
            <p className="nl-note" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("subscribed")}</p>
          ) : (
            <>
              <div className="nl-form">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && subscribe()}
                  placeholder={t("placeholder")}
                  className="nl-input"
                />
                <button
                  onClick={subscribe}
                  disabled={status === "loading"}
                  className="nl-btn"
                >
                  {status === "loading" ? "…" : t("subscribe")}
                </button>
              </div>
              <p className="nl-note">{t("privacy")}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
