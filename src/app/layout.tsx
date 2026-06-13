import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartBadge from "@/app/components/CartBadge";

export const metadata: Metadata = {
  title: "VapeCart – متجر فيب إلكتروني | الكويت",
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
            <header className="site-header">
              <div className="header-inner">
                <Link href="/" className="site-logo">
                  Vape<span>Cart</span>
                </Link>
                <nav className="nav-links">
                  <Link href="/">الرئيسية</Link>
                  <Link href="/shop">المتجر</Link>
                  <Link href="/category/disposable">سحبات جاهزة</Link>
                  <Link href="/category/pods">بودات</Link>
                  <Link href="/cart" className="header-cart-link">
                    السلة
                    <CartBadge />
                  </Link>
                </nav>
              </div>
            </header>

            {/* ─── Main Content ─── */}
            <main>{children}</main>

            {/* ─── Footer ─── */}
            <footer className="site-footer">
              <div className="container">
                <p>© {new Date().getFullYear()} VapeCart – جميع الحقوق محفوظة</p>
              </div>
            </footer>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
