"use client";
import { useState } from "react";
import toast from "react-hot-toast";

const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";
const ADDRESS = process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "";
const MAPS_URL = process.env.NEXT_PUBLIC_CONTACT_MAPS_URL ?? "";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!form.name.trim()) { toast.error("Please enter your name."); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { toast.error("Please enter a valid email."); return; }
    if (!form.message.trim() || form.message.trim().length < 10) { toast.error("Message must be at least 10 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      toast.success("Message sent!");
    } catch { toast.error("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="clayout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 1400, margin: "0 auto", paddingTop: "var(--nav-h)", minHeight: "100vh" }}>
      {/* Left info panel */}
      <div style={{ padding: "88px 64px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "var(--s1)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(44px,5.5vw,80px)", fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.025em", marginBottom: 56, color: "var(--chalk)" }}>
            Get in <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Touch</em>
          </h1>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 7 }}>Email</div>
            <div style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.6 }}>hello@everythingstreet.ge</div>
          </div>

          {PHONE && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 7 }}>Phone</div>
              <div style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.6 }}>{PHONE}</div>
            </div>
          )}

          {ADDRESS && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 7 }}>Address</div>
              <div style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.6 }}>{ADDRESS}</div>
            </div>
          )}

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 7 }}>Business Hours</div>
            <div style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.6 }}>
              Mon – Fri: 9AM – 6PM GET<br />
              Saturday: 10AM – 4PM GET<br />
              Sunday: Closed
            </div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: "var(--chalk2)", opacity: 0.5 }}>
          © {new Date().getFullYear()} Everything Street
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ padding: "88px 64px" }}>
        {sent ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--chalk)", marginBottom: 16 }}>Message Sent</div>
            <p style={{ fontSize: 15, color: "var(--chalk2)", lineHeight: 1.7, marginBottom: 32 }}>Thank you for reaching out. We'll get back to you within one business day.</p>
            <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              style={{ fontSize: 11, color: "var(--gold)", letterSpacing: "0.14em", textTransform: "uppercase", background: "none", cursor: "pointer" }}>
              Send Another →
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, marginBottom: 44, color: "var(--chalk)" }}>Send a Message</h2>

            <div style={{ marginBottom: 26 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 10 }}>Your Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith"
                style={{ width: "100%", padding: "15px 20px", background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 1, color: "var(--chalk)", fontFamily: "var(--sans)", fontSize: 14, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
            </div>

            <div style={{ marginBottom: 26 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 10 }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com"
                style={{ width: "100%", padding: "15px 20px", background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 1, color: "var(--chalk)", fontFamily: "var(--sans)", fontSize: 14, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
            </div>

            <div style={{ marginBottom: 26 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 10 }}>Subject</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="How can we help?"
                style={{ width: "100%", padding: "15px 20px", background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 1, color: "var(--chalk)", fontFamily: "var(--sans)", fontSize: 14, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
            </div>

            <div style={{ marginBottom: 26 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 10 }}>Message</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us what's on your mind..." rows={5}
                style={{ width: "100%", padding: "15px 20px", background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 1, color: "var(--chalk)", fontFamily: "var(--sans)", fontSize: 14, outline: "none", transition: "border-color 0.2s", resize: "vertical", height: 138, boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
            </div>

            <button onClick={sendMessage} disabled={loading}
              style={{ width: "100%", padding: 17, background: "var(--gold)", color: "#000", fontFamily: "var(--sans)", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", borderRadius: 1, transition: "opacity 0.2s", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = loading ? "0.7" : "1"; }}>
              {loading ? "Sending…" : "Send Message"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
