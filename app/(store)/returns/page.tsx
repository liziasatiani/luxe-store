import { Container } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("pages.returns"), getLocale()]);
  return buildMetadata({ title: t("title"), locale });
}

export default async function ReturnsPage() {
  const t = await getTranslations("pages.returns");
  const sections = [
    { titleKey: "overviewTitle",       contentKey: "overviewContent"       },
    { titleKey: "eligibleTitle",       contentKey: "eligibleContent"       },
    { titleKey: "nonReturnableTitle",  contentKey: "nonReturnableContent"  },
    { titleKey: "howToTitle",          contentKey: "howToContent"          },
    { titleKey: "refundTitle",         contentKey: "refundContent"         },
    { titleKey: "damagedTitle",        contentKey: "damagedContent"        },
  ] as const;
  return (
    <>
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-800 py-14">
        <Container className="text-center">
          <h1 className="font-display text-5xl text-surface-900 dark:text-white mb-3">{t("title")}</h1>
          <p className="text-surface-500">{t("subtitle")}</p>
        </Container>
      </div>
      <Container className="py-16 max-w-3xl space-y-10">
        {sections.map(s => (
          <div key={s.titleKey}>
            <h2 className="font-display text-2xl text-surface-900 dark:text-white mb-3">{t(s.titleKey)}</h2>
            <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed whitespace-pre-line">{t(s.contentKey)}</p>
          </div>
        ))}
        <div className="p-6 rounded-2xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800">
          <p className="font-semibold text-brand-800 dark:text-brand-300 mb-1">{t("needHelp")}</p>
          <p className="text-sm text-brand-700 dark:text-brand-400">Contact <a href="mailto:returns@everythingstreet.com" className="underline">returns@everythingstreet.com</a></p>
        </div>
      </Container>
    </>
  );
}
