import { Container } from "@/components/ui";
import { getLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { ShieldCheck, Globe, Lock } from "lucide-react";

export async function generateMetadata() {
  const locale = await getLocale();
  return buildMetadata({ title: "About Us", description: "Everything Street — where luxury beauty and premium technology share the same address.", locale });
}

export default async function AboutPage() {
  const t = await getTranslations("pages.about");
  return (
    <div>
      {/* Hero */}
      <div className="bg-black text-white py-28">
        <Container className="text-center max-w-3xl">
          <p className="text-[10px] tracking-[0.24em] uppercase text-white/40 mb-6">{t("ourStory")}</p>
          <h1 className="font-display text-5xl md:text-6xl font-normal mb-8 leading-tight whitespace-pre-line">{t("heroTitle")}</h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-xl mx-auto">{t("heroDesc")}</p>
        </Container>
      </div>

      <Container className="py-24 max-w-4xl">
        {/* Mission / Promise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-black/30 dark:text-white/30 mb-4">{t("missionLabel")}</p>
            <h2 className="font-display text-2xl text-black dark:text-white font-normal mb-4">{t("missionTitle")}</h2>
            <p className="text-black/50 dark:text-white/50 leading-relaxed">{t("missionDesc")}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-black/30 dark:text-white/30 mb-4">{t("promiseLabel")}</p>
            <h2 className="font-display text-2xl text-black dark:text-white font-normal mb-4">{t("promiseTitle")}</h2>
            <p className="text-black/50 dark:text-white/50 leading-relaxed">{t("promiseDesc")}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-0 border border-black/8 dark:border-white/8 mb-24">
          {[
            { value: "186+", label: t("statsProducts") },
            { value: "31",   label: t("statsBrands")   },
          ].map((s, i) => (
            <div key={s.label} className={`text-center py-10 px-6 ${i === 0 ? "border-r border-black/8 dark:border-white/8" : ""}`}>
              <p className="font-display text-4xl text-black dark:text-white font-normal">{s.value}</p>
              <p className="text-[10px] tracking-[0.12em] uppercase text-black/30 dark:text-white/30 mt-2">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-black/30 dark:text-white/30 text-center mb-12">{t("whatWeStandFor")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black/8 dark:border-white/8">
            {[
              { icon: <ShieldCheck size={20} strokeWidth={1.5} />, title: t("authenticityTitle"), desc: t("authenticityDesc") },
              { icon: <Lock size={20} strokeWidth={1.5} />,        title: t("securityTitle"),     desc: t("securityDesc")     },
              { icon: <Globe size={20} strokeWidth={1.5} />,       title: t("globalTitle"),       desc: t("globalDesc")       },
            ].map((v, i) => (
              <div key={v.title} className={`p-10 ${i < 2 ? "border-r border-black/8 dark:border-white/8" : ""}`}>
                <span className="text-black/30 dark:text-white/30">{v.icon}</span>
                <h3 className="font-display text-lg text-black dark:text-white font-normal mt-5 mb-3">{v.title}</h3>
                <p className="text-sm text-black/40 dark:text-white/40 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
