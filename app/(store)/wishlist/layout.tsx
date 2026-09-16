import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.wishlist");
  return { title: t("title"), robots: { index: false, follow: false } };
}
export default function WishlistLayout({ children }: { children: React.ReactNode }) { return children; }
