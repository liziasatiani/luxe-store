import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { Truck, Clock, Globe, Package } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("pages.shipping"), getLocale()]);
  return buildMetadata({ title: t("title"), locale });
}

export default async function ShippingPage() {
  const t = await getTranslations("pages.shipping");
  const cards = [
    { icon: Truck,   label: t("freeShipping"),  desc: t("freeShippingDesc") },
    { icon: Clock,   label: t("standard"),       desc: t("standardDesc")     },
    { icon: Package, label: t("express"),        desc: t("expressDesc")      },
    { icon: Globe,   label: t("international"),  desc: t("internationalDesc")},
  ];
  const sections = [
    { title: t("domesticTitle"),      content: t("domesticContent")      },
    { title: t("internationalTitle"), content: t("internationalContent") },
    { title: t("dutiesTitle"),        content: t("dutiesContent")        },
    { title: t("trackingTitle"),      content: t("trackingContent")      },
    { title: t("lostTitle"),          content: t("lostContent")          },
  ];
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">{t("title")}</h1>
          <p className="text-surface-500">{t("subtitle")}</p>
        </Container>
      </div>
      <Container className="py-16 max-w-3xl space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(item => (
            <div key={item.label} className="p-5 rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 text-center">
              <item.icon size={22} className="text-brand-500 mx-auto mb-3" />
              <p className="font-semibold text-sm text-surface-900 dark:text-white">{item.label}</p>
              <p className="text-xs text-surface-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
        {sections.map(section => (
          <div key={section.title}>
            <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-3">{section.title}</h2>
            <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
          </div>
        ))}
      </Container>
    </>
  );
}
