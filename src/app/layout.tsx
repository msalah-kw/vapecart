import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com"),
  title: "سحبة فيب – متجر فيب إلكتروني | الكويت",
  description:
    "أفضل متجر فيب إلكتروني في الكويت. سحبات جاهزة، بودات، نكهات سولت ونكهات فيب بأسعار منافسة وتوصيل سريع.",
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
  return (
    <html lang="ar" dir="rtl">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
