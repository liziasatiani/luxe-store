"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    // In production: call /api/auth/forgot-password to send reset email
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
    toast.success("Reset link sent!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-3xl text-surface-900 dark:text-white">Luxe<span className="text-brand-500">.</span></Link>
          <h1 className="font-display text-3xl text-surface-900 dark:text-white mt-6 mb-2">Forgot password?</h1>
          <p className="text-surface-500">Enter your email and we'll send a reset link</p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-luxury-lg border border-surface-100 dark:border-surface-800 p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <Mail size={32} className="text-green-500" />
              </div>
              <p className="text-surface-700 dark:text-surface-300">Check your inbox for a password reset link.</p>
              <Link href="/login" className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 text-sm">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <Input id="email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              <Button onClick={handleSubmit} loading={loading} variant="gold" size="lg" fullWidth>Send Reset Link</Button>
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
