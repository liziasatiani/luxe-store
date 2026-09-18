import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title"), robots: { index: false, follow: false } };
}
export default function LoginLayout({ children }: { children: React.ReactNode }) { return children; }
