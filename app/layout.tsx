import type { Metadata } from "next";
import { Inter, Cinzel, Lora } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/search/SearchModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ExitIntentCapture } from "@/components/ui/ExitIntentCapture";
import { WishlistSync } from "@/components/WishlistSync";
import { CookieConsent } from "@/components/CookieConsent";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { PWAInit } from "@/components/PWAInit";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  ...buildMetadata(),
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Everything Street" },
};


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${cinzel.variable} ${lora.variable}`}>
      <head>
        <link rel="preconnect" href="https://fjdatrmbijswdhbtiigm.supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fjdatrmbijswdhbtiigm.supabase.co" />
      </head>
      <body className="bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-surface-900 focus:rounded-xl focus:shadow-luxury-md focus:outline-none">
                Skip to content
              </a>
              <Navbar />
              <main id="main-content" className="min-h-screen pb-14 md:pb-0">{children}</main>
              <Footer />
              <BottomTabBar />
              <SearchModal />
              <CartDrawer />
              <ExitIntentCapture />
              <WishlistSync />
              <Toaster position="bottom-right" />
              <CookieConsent />
              <PWAInit />
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
