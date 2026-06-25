import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { preconnect, prefetchDNS } from "react-dom";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://lightgrey-flamingo-522119.hostingersite.com");
  prefetchDNS("https://lightgrey-flamingo-522119.hostingersite.com");

  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
