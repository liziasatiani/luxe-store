"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

function KInput({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div style={{ width: "100%" }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--chalk2)", marginBottom: 8 }}>{label}</label>
      <input
        style={{ width: "100%", padding: "11px 14px", background: "transparent", border: "1px solid var(--borderg)", color: "var(--chalk)", fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
        onFocus={e => (e.currentTarget.style.borderColor = "var(--gold)")}
        onBlur={e => (e.currentTarget.style.borderColor = "var(--borderg)")}
        {...props}
      />
      {error && <p style={{ fontSize: 11, color: "var(--crimson)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

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
      toast.success(t("deleteSuccess"));
    } catch {
      toast.error(t("deleteError"));
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 700, color: "var(--chalk)", marginBottom: 4 }}>{t("title")}</h1>
        <p style={{ fontSize: 12, color: "var(--chalk3)" }}>{t("subtitle")}</p>
      </div>

      <div style={{ border: "1px solid var(--border)", padding: 24, maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 }}>
        <KInput id="name" label={t("fullName")} value={name} onChange={e => setName(e.target.value)} />
        <KInput id="email" label={t("email")} value={session?.user?.email ?? ""} disabled style={{ width: "100%", padding: "11px 14px", background: "transparent", border: "1px solid var(--borderg)", color: "var(--chalk3)", fontSize: 13, outline: "none", opacity: 0.6, cursor: "not-allowed" }} />
        <KInput id="phone" label={t("phone")} value={phone} onChange={e => setPhone(e.target.value)} placeholder={t("phonePlaceholder")} />
        <button
          onClick={saveProfile} disabled={loading}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, alignSelf: "flex-start" }}
        >
          <Save size={13} /> {loading ? "…" : t("saveChanges")}
        </button>
      </div>

      <div style={{ maxWidth: 480 }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, color: "var(--chalk)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{t("dangerZone")}</h2>
        <p style={{ fontSize: 12, color: "var(--chalk3)", marginBottom: 16 }}>{t("dangerZoneDesc")}</p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--crimson)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <Trash2 size={13} /> {t("deleteAccount")}
          </button>
        ) : (
          <div style={{ border: "1px solid var(--crimson)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 13, color: "var(--crimson)" }}>{t("deleteConfirmTitle")}</p>
            <KInput
              id="delete-confirm"
              label=""
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder={t("deleteConfirmPlaceholder")}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={deleteAccount}
                disabled={deleting || deleteConfirmText !== "DELETE"}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "var(--crimson)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: (deleting || deleteConfirmText !== "DELETE") ? "not-allowed" : "pointer", opacity: deleteConfirmText !== "DELETE" ? 0.4 : 1 }}
              >
                <Trash2 size={13} /> {t("deleteConfirmBtn")}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                style={{ padding: "10px 18px", background: "transparent", color: "var(--chalk2)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid var(--borderg)", cursor: "pointer" }}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
