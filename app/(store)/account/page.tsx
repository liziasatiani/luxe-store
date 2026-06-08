"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await update({ name });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-surface-900 dark:text-white mb-1">My Profile</h1>
        <p className="text-surface-500 text-sm">Manage your personal information</p>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 space-y-5 max-w-lg">
        <Input id="name" label="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <Input id="email" label="Email" value={session?.user?.email ?? ""} disabled className="opacity-60 cursor-not-allowed" />
        <Input id="phone" label="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
        <Button onClick={handleSave} loading={loading} variant="gold" leftIcon={<Save size={16} />}>Save Changes</Button>
      </div>
    </div>
  );
}
