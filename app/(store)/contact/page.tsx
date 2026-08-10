"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";
const ADDRESS = process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "";
const MAPS_URL = process.env.NEXT_PUBLIC_CONTACT_MAPS_URL ?? "";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "15px 20px", background: "var(--s1)",
  border: "1px solid var(--border)", borderRadius: 1, color: "var(--chalk)",
  fontFamily: "var(--sans)", fontSize: 14, outline: "none",
  transition: "border-color 0.2s", boxSizing: "border-box",
};

export default function ContactPage() {
  const t = useTranslations("pages.contact");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!form.name.trim()) { toast.error(t("yourName").replace(" *", "") + " required"); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { toast.error("Invalid email"); return; }
    if (!form.message.trim() || form.message.trim().length < 10) { toast.error("Message too short"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      toast.success(t("messageSent"));
    } catch { toast.error("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .contact-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1400px;
          margin: 0 auto;
          padding-top: var(--nav-h);
          min-height: 100vh;
        }
        .contact-info {
          padding: 88px 64px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: var(--s1);
        }
        .contact-form {
          padding: 88px 64px;
        }
        @media (max-width: 768px) {
          .contact-layout { grid-template-columns: 1fr; }
          .contact-info {
            padding: 48px 24px 32px;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .contact-form { padding: 40px 24px 64px; }
        }
      `}</style>
      <div className="contact-layout">
        {/* Left: info */}
        <div className="contact-info">
          <div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(44px,5.5vw,80px)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.025em", marginBottom: 56, color: "var(--chalk)" }}>
              {t("getInTouch")}
            </h1>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 7 }}>{t("email")}</div>
              <div style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.6 }}>hello@everythingstreet.ge</div>
            </div>

            {PHONE && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 7 }}>{t("phone")}</div>
                <div style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.6 }}>{PHONE}</div>
              </div>
            )}

            {ADDRESS && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 7 }}>{t("address")}</div>
                <div style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.6 }}>{ADDRESS}</div>
                {MAPS_URL && (
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--gold)", textDecoration: "none", display: "inline-block", marginTop: 6 }}>
                    {t("openInMaps")}
                  </a>
                )}
              </div>
            )}

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 7 }}>{t("businessHours")}</div>
              <div style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.6 }}>
                {t("monFri")}: 9AM – 6PM GET<br />
                {t("saturday")}: 10AM – 4PM GET<br />
                {t("sunday")}: {t("closed")}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: "var(--chalk2)", opacity: 0.5 }}>
            © {new Date().getFullYear()} Everything Street
          </div>
        </div>

        {/* Right: form */}
        <div className="contact-form">
          {sent ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--chalk)", marginBottom: 16 }}>{t("messageSent")}</div>
              <p style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.7, marginBottom: 32 }}>{t("messageSentDesc")}</p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                style={{ fontSize: 11, color: "var(--gold)", letterSpacing: "0.14em", textTransform: "uppercase", background: "none", cursor: "pointer" }}>
                {t("sendAnother")} →
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, marginBottom: 44, color: "var(--chalk)" }}>{t("sendMessage")}</h2>

              {[
                { key: "name", label: t("yourName"), type: "text", placeholder: "Jane Smith" },
                { key: "email", label: t("yourEmail"), type: "email", placeholder: "you@example.com" },
                { key: "subject", label: t("subject"), type: "text", placeholder: "How can we help?" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key} style={{ marginBottom: 26 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 10 }}>{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={INPUT_STYLE}
                    onFocus={e => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 26 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 10 }}>{t("message")}</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  style={{ ...INPUT_STYLE, resize: "vertical", height: 138 }}
                  onFocus={e => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={loading}
                style={{ width: "100%", padding: 17, background: "var(--gold)", color: "#000", fontFamily: "var(--sans)", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", borderRadius: 1, transition: "opacity 0.2s", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = loading ? "0.7" : "1"; }}
              >
                {loading ? "…" : t("send")}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
