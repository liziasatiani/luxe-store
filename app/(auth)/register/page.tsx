"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Input, Divider } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      // Auto-login
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      toast.success("Account created! Welcome to Luxe Store.");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-3xl text-surface-900 dark:text-white">Luxe<span className="text-brand-500">.</span></Link>
          <h1 className="font-display text-3xl text-surface-900 dark:text-white mt-6 mb-2">Create account</h1>
          <p className="text-surface-500">Join the Luxe Store community</p>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-luxury-lg border border-surface-100 dark:border-surface-800 p-8">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full h-12 rounded-xl border border-surface-200 dark:border-surface-700 flex items-center justify-center gap-3 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          <Divider label="or" className="mb-6" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input id="name" label="Full Name" placeholder="Jane Smith" error={errors.name?.message} {...register("name")} />
            <Input id="email" label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
            <Input
              id="password" label="Password" type={showPw ? "text" : "password"} placeholder="Min 8 chars, 1 uppercase, 1 number"
              error={errors.password?.message}
              rightIcon={<button type="button" onClick={() => setShowPw(p => !p)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
              {...register("password")}
            />
            <Input id="confirmPassword" label="Confirm Password" type={showPw ? "text" : "password"} placeholder="••••••••" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
            <Button type="submit" loading={loading} variant="gold" size="lg" fullWidth leftIcon={<UserPlus size={18} />}>Create Account</Button>
          </form>
          <p className="text-center text-sm text-surface-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
