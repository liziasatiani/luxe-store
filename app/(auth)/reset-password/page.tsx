"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

function KInput({ label, error, type = "text", rightIcon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; rightIcon?: React.ReactNode }) {
  return (
    <div style={{ width: "100%" }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 8 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          style={{ width: "100%", padding: "12px 16px", background: "transparent", border: "1px solid var(--borderg)", color: "var(--chalk)", fontSize: 14, outline: "none", transition: "border-color 0.2s", paddingRight: rightIcon ? 44 : 16 }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--borderg)")}
          {...props}
        />
        {rightIcon && (
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--chalk2)", cursor: "pointer" }}>{rightIcon}</span>
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: "var(--crimson)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/forgot-password");
  }, [token, router]);

  const updatePassword = async () => {
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword: confirm }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to reset password"); return; }
      setDone(true);
    } catch {
      toast.error("Couldn't update password — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--chalk)", marginBottom: 8 }}>Set new password</h1>
          <p style={{ fontSize: 13, color: "var(--chalk2)" }}>Choose a strong password for your account</p>
        </div>

        <div style={{ border: "1px solid var(--border)", padding: 36 }}>
          {done ? (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, border: "1px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={22} style={{ color: "var(--gold)" }} />
              </div>
              <p style={{ fontSize: 14, color: "var(--chalk2)", lineHeight: 1.6 }}>Your password has been updated successfully.</p>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none" }}>
                Sign In →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <KInput
                label="New password" id="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                rightIcon={
                  <button type="button" onClick={() => setShowPw(p => !p)} style={{ background: "none", border: "none", padding: 0, color: "var(--chalk2)", cursor: "pointer", display: "flex" }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <KInput
                label="Confirm password" id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password" placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && updatePassword()}
                rightIcon={
                  <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ background: "none", border: "none", padding: 0, color: "var(--chalk2)", cursor: "pointer", display: "flex" }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <button
                onClick={updatePassword} disabled={loading}
                style={{ width: "100%", padding: "14px 24px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, transition: "0.2s" }}
              >
                {loading ? "…" : "Update password"}
              </button>
              <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--chalk2)", textDecoration: "none" }}>
                <ArrowLeft size={13} /> Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
