import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/app/components/Header";

export const metadata: Metadata = {
  title: "سحبة فيب – متجر فيب إلكتروني | الكويت",
  description:
    "أفضل متجر فيب إلكتروني في الكويت. سحبات جاهزة، بودات، نكهات سولت ونكهات فيب بأسعار منافسة وتوصيل سريع.",
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
          <div className="page-wrapper">
            {/* ─── Header ─── */}
            <Header />

            {/* ─── Main Content ─── */}
            <main>{children}</main>

            {/* ─── Footer ─── */}
            <footer className="site-footer">
              <div className="container">
                <p>© {new Date().getFullYear()} سحبة فيب – جميع الحقوق محفوظة</p>
              </div>
            </footer>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
