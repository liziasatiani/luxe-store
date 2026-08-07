"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const t = useTranslations("account.profile");
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/account/profile")
      .then(r => r.json())
      .then(d => { if (d.data?.phone) setPhone(d.data.phone); })
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? t("error")); return; }
      await update({ name });
      toast.success(t("updated"));
    } catch {
      toast.error(t("connectionError"));
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await signOut({ redirect: false });
      router.push("/");
      toast.success("Account deleted.");
    } catch {
      toast.error("Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-surface-900 dark:text-white mb-1">{t("title")}</h1>
        <p className="text-surface-500 text-sm">{t("subtitle")}</p>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 space-y-5 max-w-lg">
        <Input id="name" label={t("fullName")} value={name} onChange={e => setName(e.target.value)} />
        <Input id="email" label={t("email")} value={session?.user?.email ?? ""} disabled className="opacity-60 cursor-not-allowed" />
        <Input id="phone" label={t("phone")} value={phone} onChange={e => setPhone(e.target.value)} placeholder={t("phonePlaceholder")} />
        <Button onClick={saveProfile} loading={loading} variant="gold" leftIcon={<Save size={16} />}>{t("saveChanges")}</Button>
      </div>

      {/* Danger zone */}
      <div className="max-w-lg">
        <h2 className="text-sm font-medium text-surface-900 dark:text-white mb-1">Danger zone</h2>
        <p className="text-xs text-surface-500 mb-4">Once you delete your account, all your data will be permanently removed.</p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} /> Delete my account
          </button>
        ) : (
          <div className="border border-red-200 dark:border-red-900/50 rounded-xl p-5 space-y-4 bg-red-50/50 dark:bg-red-950/20">
            <p className="text-sm text-red-700 dark:text-red-400">
              This action is <strong>permanent</strong> and cannot be undone. Type <strong>DELETE</strong> to confirm.
            </p>
            <Input
              id="delete-confirm"
              label=""
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
            <div className="flex gap-3">
              <Button
                onClick={deleteAccount}
                loading={deleting}
                disabled={deleteConfirmText !== "DELETE"}
                className="!bg-red-600 hover:!bg-red-700 !text-white disabled:opacity-40"
                leftIcon={<Trash2 size={14} />}
              >
                Delete account
              </Button>
              <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
