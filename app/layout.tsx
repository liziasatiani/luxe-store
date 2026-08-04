import type { Metadata } from "next";
import { Playfair_Display, Outfit, Noto_Serif_Georgian } from "next/font/google";
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
import { MusicPlayer } from "@/components/ui/MusicPlayer";
import { WishlistSync } from "@/components/WishlistSync";
import { CookieConsent } from "@/components/CookieConsent";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { PWAInit } from "@/components/PWAInit";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { buildMetadata, buildOrganizationSchema } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { jsonLdSafe } from "@/lib/utils";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const notoSerifGeorgian = Noto_Serif_Georgian({
  subsets: ["georgian"],
  weight: ["400", "700"],
  variable: "--font-georgian",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    ...buildMetadata({ locale }),
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/favicon.svg",
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.json",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Everything Street" },
  };
}


export function generateViewport() {
  return { width: "device-width", initialScale: 1, viewportFit: "cover" };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${playfair.variable} ${outfit.variable} ${notoSerifGeorgian.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSafe(buildOrganizationSchema()) }} />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preload" as="image" href="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80&auto=format" fetchPriority="high" />
        <link rel="preconnect" href="https://fjdatrmbijswdhbtiigm.supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fjdatrmbijswdhbtiigm.supabase.co" />
      </head>
      <body className="bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              <MotionProvider>
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
              <MusicPlayer />
              <WishlistSync />
              <Toaster position="bottom-right" />
              <CookieConsent />
              <PWAInit />
              <ScrollToTop />
              <SplashScreen />
              <GoogleAnalytics />
              <Analytics />
              </MotionProvider>
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
