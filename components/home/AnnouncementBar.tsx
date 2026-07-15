"use client";
import { useTranslations } from "next-intl";

export function AnnouncementBar() {
  const t = useTranslations("nav");
  return (
    <div className="bg-black dark:bg-white text-white dark:text-black text-center py-2 text-[10px] tracking-[0.18em] uppercase font-medium">
      {t("announcement")}
    </div>
  );
}
