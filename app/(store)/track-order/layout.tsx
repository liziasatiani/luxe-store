import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.trackOrder");
  return { title: t("title") };
}
export default function TrackOrderLayout({ children }: { children: React.ReactNode }) { return children; }
