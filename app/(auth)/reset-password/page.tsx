"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/forgot-password");
  }, [token, router]);

  const handleSubmit = async () => {
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
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-3xl text-surface-900 dark:text-white">
            Everything Street
          </Link>
          <h1 className="font-display text-3xl text-surface-900 dark:text-white mt-6 mb-2">Set new password</h1>
          <p className="text-surface-500">Choose a strong password for your account</p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-luxury-lg border border-surface-100 dark:border-surface-800 p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="text-surface-700 dark:text-surface-300">Your password has been updated.</p>
              <Link href="/login" className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 text-sm">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <Input
                id="password" label="New password" type="password"
                autoComplete="new-password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <Input
                id="confirm" label="Confirm password" type="password"
                autoComplete="new-password" placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              <Button onClick={handleSubmit} loading={loading} variant="gold" size="lg" fullWidth>
                Update password
              </Button>
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-surface-500 hover:text-surface-700">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
