"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Instagram, Facebook } from "lucide-react";
import { Container, Input, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) { toast.error("Please fill in all required fields"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      toast.success("Message sent! We'll reply within 24 hours.");
    } catch { toast.error("Failed to send message. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">Contact Us</h1>
          <p className="text-surface-500 max-w-md mx-auto">We're here to help. Reach out and we'll respond within 24 hours.</p>
        </Container>
      </div>

      <Container className="py-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-5">Get In Touch</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail,  label: "Email",   value: "hello@luxestore.com",   href: "mailto:hello@luxestore.com" },
                  { icon: Phone, label: "Phone",   value: "+1 (555) 000-0000",     href: "tel:+15550000000" },
                  { icon: MapPin,label: "Address", value: "123 Luxury Lane, Beverly Hills, CA 90210", href: "#" },
                ].map(item => (
                  <a key={item.label} href={item.href} className="flex items-start gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-400 mb-0.5">{item.label}</p>
                      <p className="text-sm text-surface-700 dark:text-surface-300 group-hover:text-brand-500 transition-colors">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Chat With Us</h3>
              <div className="space-y-2">
                {[
                  { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}`, color: "text-green-500" },
                  { icon: Instagram,    label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#",                 color: "text-pink-500"  },
                  { icon: Facebook,     label: "Facebook",  href: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "#",                  color: "text-blue-500"  },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-100 dark:border-surface-800 hover:border-brand-200 dark:hover:border-brand-700 transition-colors group">
                    <s.icon size={18} className={s.color} />
                    <span className="text-sm text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-white">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-white mb-3">Business Hours</h3>
              <div className="space-y-1.5 text-sm text-surface-500">
                <div className="flex justify-between"><span>Monday – Friday</span><span>9AM – 6PM EST</span></div>
                <div className="flex justify-between"><span>Saturday</span><span>10AM – 4PM EST</span></div>
                <div className="flex justify-between"><span>Sunday</span><span>Closed</span></div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <Mail size={28} className="text-green-500" />
                </div>
                <h3 className="font-display text-2xl text-surface-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-surface-500">We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="mt-6 text-sm text-brand-500 hover:text-brand-600">Send another message</button>
              </div>
            ) : (
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-8 space-y-5">
                <h2 className="font-display text-2xl text-surface-900 dark:text-white">Send a Message</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input id="name" label="Your Name *" placeholder="Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  <Input id="email" label="Email *" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <Input id="subject" label="Subject" placeholder="Order inquiry, product question…" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                <Textarea id="message" label="Message *" placeholder="How can we help you?" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                <Button onClick={handleSubmit} loading={loading} variant="gold" size="lg" leftIcon={<Mail size={16} />}>Send Message</Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
