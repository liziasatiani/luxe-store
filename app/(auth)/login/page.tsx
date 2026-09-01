"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

function KInput({ label, error, type = "text", rightIcon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; rightIcon?: React.ReactNode }) {
  return (
    <div style={{ width: "100%", marginBottom: error ? 4 : 0 }}>
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") ?? "/";
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("auth.login");

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", { ...data, redirect: false });
      if (result?.error) throw new Error(t("invalidCredentials"));
      toast.success(t("welcomeBack"));
      router.push(redirect);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--chalk)", marginBottom: 8 }}>{t("title")}</h1>
          <p style={{ fontSize: 13, color: "var(--chalk2)" }}>{t("subtitle")}</p>
        </div>

        <div className="glass-card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <KInput id="email" label={t("email")} type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
            <KInput id="password" label={t("password")} type={showPw ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" error={errors.password?.message}
              rightIcon={<button type="button" onClick={() => setShowPw(p => !p)} style={{ background: "none", border: "none", padding: 0, color: "var(--chalk2)", cursor: "pointer", display: "flex" }}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
              {...register("password")} />
            <div style={{ textAlign: "right", marginTop: -12 }}>
              <Link href="/forgot-password" style={{ fontSize: 11, color: "var(--gold)", textDecoration: "none", letterSpacing: "0.06em" }}>{t("forgotPassword")}</Link>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px 24px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, transition: "0.2s" }}>
              {loading ? "…" : t("signIn")}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--chalk2)" }}>{t("orContinueWith")}</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <button onClick={() => signIn("google", { callbackUrl: redirect })}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 24px", border: "1px solid var(--borderg)", background: "transparent", color: "var(--chalk)", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", transition: "0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--borderg)"}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t("continueWithGoogle")}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--chalk2)" }}>
          {t("noAccount")}{" "}
          <Link href="/register" style={{ color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid var(--borderg)" }}>{t("createAccount")}</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
