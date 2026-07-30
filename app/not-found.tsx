import Link from "next/link";
import { Container } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Home, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("pages.notFound");
  return (
    <Container className="py-32 text-center max-w-lg">
      <p className="font-display text-9xl text-surface-100 dark:text-surface-800 font-bold select-none">404</p>
      <h1 className="font-display text-4xl text-surface-900 dark:text-white -mt-4 mb-4">{t("title")}</h1>
      <p className="text-surface-500 mb-10">{t("subtitle")}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="gold" size="lg" leftIcon={<Home size={18} />} asChild>
          <Link href="/">{t("back")}</Link>
        </Button>
        <Button variant="outline" size="lg" leftIcon={<Search size={18} />} asChild>
          <Link href="/search">Search</Link>
        </Button>
      </div>
    </Container>
  );
}
