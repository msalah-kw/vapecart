import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/app/components/Header";
import CartToast from "@/app/components/CartToast";

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

            {/* ─── Cart Toast Popup ─── */}
            <CartToast />

            {/* ─── Main Content ─── */}
            <main>{children}</main>

            {/* ─── Footer ─── */}
            <footer className="site-footer">
              <div className="container footer-container">
                <div className="footer-brand">
                  <Link href="/" className="footer-logo">
                    <img 
                      src="https://sahbavape.com/wp-content/uploads/2026/02/sahbavape.webp" 
                      alt="سحبة فيب" 
                    />
                  </Link>
                  <p className="footer-desc">متجر سحبة فيب الأول لجميع سحبات وبودات ونكهات الفيب في الكويت.</p>
                </div>
                <div className="footer-links-grid">
                  <div className="footer-links-col">
                    <h3>معلومات إضافية</h3>
                    <ul>
                      <li><a href="https://sahbavape.com/about-us/" target="_blank" rel="noopener noreferrer">من نحن</a></li>
                      <li><a href="https://sahbavape.com/faq/" target="_blank" rel="noopener noreferrer">الأسئلة المتكررة</a></li>
                      <li><a href="https://sahbavape.com/disclaimer/" target="_blank" rel="noopener noreferrer">إخلاء المسؤولية</a></li>
                    </ul>
                  </div>
                  <div className="footer-links-col">
                    <h3>السياسات والقوانين</h3>
                    <ul>
                      <li><a href="https://sahbavape.com/privacy-policy/" target="_blank" rel="noopener noreferrer">سياسة الخصوصية</a></li>
                      <li><a href="https://sahbavape.com/refund_returns/" target="_blank" rel="noopener noreferrer">سياسة الاستبدال والاسترجاع</a></li>
                      <li><a href="https://sahbavape.com/terms-conditions/" target="_blank" rel="noopener noreferrer">الشروط والأحكام</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="footer-bottom">
                <div className="container">
                  <p>© {new Date().getFullYear()} سحبة فيب – جميع الحقوق محفوظة</p>
                </div>
              </div>
            </footer>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
