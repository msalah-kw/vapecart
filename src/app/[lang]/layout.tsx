import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { preconnect, prefetchDNS } from "react-dom";
import { CartProvider } from "@/context/CartContext";
import { locales, type Locale } from "@/lib/i18n";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com"),
  title: "سحبة فيب – متجر فيب إلكتروني | الكويت",
  description:
    "أفضل متجر فيب إلكتروني في الكويت. سحبات جاهزة، بودات، نكهات سولت ونكهات فيب بأسعار منافسة وتوصيل سريع.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape-icon.png",
    apple: "https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape-icon.png",
  },
};

/**
 * Pre-render all supported locale segments at build time.
 */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;

  preconnect("https://lightgrey-flamingo-522119.hostingersite.com");
  prefetchDNS("https://lightgrey-flamingo-522119.hostingersite.com");

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className={tajawal.variable}>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
