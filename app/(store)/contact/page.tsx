"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Instagram, Facebook } from "lucide-react";
import { Container, Input, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";
const ADDRESS = process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "";
const MAPS_URL = process.env.NEXT_PUBLIC_CONTACT_MAPS_URL ?? "";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!form.name.trim()) { toast.error(t("errors.name")); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { toast.error(t("errors.email")); return; }
    if (!form.message.trim() || form.message.trim().length < 10) { toast.error(t("errors.message")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      toast.success(t("success"));
    } catch { toast.error(t("errors.failed")); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">{t("title")}</h1>
          <p className="text-surface-500 max-w-md mx-auto">{t("subtitle")}</p>
        </Container>
      </div>

      <Container className="py-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-5">{t("howToReach")}</h2>
              <div className="space-y-4">
                <a href="mailto:hello@everythingstreet.ge" className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-400 mb-0.5">{t("email")}</p>
                    <p className="text-sm text-surface-700 dark:text-surface-300 group-hover:text-brand-500 transition-colors">hello@everythingstreet.ge</p>
                  </div>
                </a>

                {PHONE && (
                  <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="flex items-start gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-400 mb-0.5">{t("phone")}</p>
                      <p className="text-sm text-surface-700 dark:text-surface-300 group-hover:text-brand-500 transition-colors">{PHONE}</p>
                    </div>
                  </a>
                )}

                {ADDRESS && (
                  <a href={MAPS_URL || undefined} target={MAPS_URL ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-start gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-400 mb-0.5">{t("address")}</p>
                      <p className="text-sm text-surface-700 dark:text-surface-300 group-hover:text-brand-500 transition-colors">{ADDRESS}</p>
                      {MAPS_URL && <p className="text-xs text-brand-400 mt-0.5">{t("openMaps")}</p>}
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4">{t("chatWithUs")}</h3>
              <div className="space-y-2">
                {[
                  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
                    ? { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`, color: "text-green-500" }
                    : null,
                  process.env.NEXT_PUBLIC_INSTAGRAM_URL
                    ? { icon: Instagram, label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, color: "text-pink-500" }
                    : null,
                  process.env.NEXT_PUBLIC_FACEBOOK_URL
                    ? { icon: Facebook, label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL, color: "text-blue-500" }
                    : null,
                ].filter((s): s is NonNullable<typeof s> => s !== null).map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-brand-200 dark:hover:border-brand-700 transition-colors group">
                    <s.icon size={18} className={s.color} />
                    <span className="text-sm text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-white">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-surface-900 dark:text-white mb-3">{t("businessHours")}</h3>
              <div className="space-y-1.5 text-sm text-surface-500">
                <div className="flex justify-between"><span>{t("monFri")}</span><span>9AM – 6PM GET</span></div>
                <div className="flex justify-between"><span>{t("saturday")}</span><span>10AM – 4PM GET</span></div>
                <div className="flex justify-between"><span>{t("sunday")}</span><span>{t("closed")}</span></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <Mail size={28} className="text-green-500" />
                </div>
                <h3 className="font-display text-2xl text-surface-900 dark:text-white mb-2">{t("messageSent")}</h3>
                <p className="text-surface-500">{t("sentDesc")}</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="mt-6 text-sm text-brand-500 hover:text-brand-600">{t("sendAnother")}</button>
              </div>
            ) : (
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-8 space-y-5">
                <h2 className="font-display text-2xl text-surface-900 dark:text-white">{t("writeTo")}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input id="name" label={t("yourName")} placeholder={t("namePlaceholder")} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  <Input id="email" label={t("yourEmail")} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <Input id="subject" label={t("subject")} placeholder={t("subjectPlaceholder")} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                <Textarea id="message" label={t("message")} placeholder={t("messagePlaceholder")} rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                <Button onClick={sendMessage} loading={loading} variant="gold" size="lg" leftIcon={<Mail size={16} />}>{t("sendMessage")}</Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
