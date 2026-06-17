import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/app/components/Header";
import CartToast from "@/app/components/CartToast";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com"),
  title: "سحبة فيب – متجر فيب إلكتروني | الكويت",
  description:
    "أفضل متجر فيب إلكتروني في الكويت. سحبات جاهزة، بودات، نكهات سولت ونكهات فيب بأسعار منافسة وتوصيل سريع.",
  icons: {
    icon: "https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape-icon.png",
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
          <div className="page-wrapper">
            {/* ─── Header ─── */}
            <Header />

            {/* ─── Cart Toast Popup ─── */}
            <CartToast />

            {/* ─── Main Content ─── */}
            <div className="main-content">{children}</div>

            {/* ─── Footer ─── */}
            <footer className="site-footer">
              <div className="container footer-container">
                {/* Column 1: Brand Info */}
                <div className="footer-col footer-brand-col">
                  <Link href="/" className="footer-logo">
                    <img 
                      src="https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape-icon.png" 
                      alt="سحبة فيب" 
                    />
                  </Link>
                  <p className="footer-desc">متجر سحبة فيب الأول لجميع سحبات وبودات ونكهات الفيب في الكويت.</p>
                </div>

                {/* Column 2: Additional Info */}
                <div className="footer-col">
                  <h3>معلومات إضافية</h3>
                  <ul>
                    <li><Link href="/about-us">من نحن</Link></li>
                    <li><Link href="/faq">الأسئلة المتكررة</Link></li>
                    <li><Link href="/disclaimer">إخلاء المسؤولية</Link></li>
                  </ul>
                </div>

                {/* Column 3: Policies */}
                <div className="footer-col">
                  <h3>السياسات والقوانين</h3>
                  <ul>
                    <li><Link href="/privacy-policy">سياسة الخصوصية</Link></li>
                    <li><Link href="/refund_returns">سياسة الاستبدال والاسترجاع</Link></li>
                    <li><Link href="/terms-conditions">الشروط والأحكام</Link></li>
                  </ul>
                </div>

                {/* Column 4: Contact/Support */}
                <div className="footer-col">
                  <h3>تواصل معنا</h3>
                  <ul>
                    <li>أوقات العمل: طوال أيام الأسبوع</li>
                    <li>ساعات الخدمة: 24 ساعة خدمة سريعة</li>
                    <li>
                      <a href="https://wa.me/96555727313" target="_blank" rel="noopener noreferrer" className="footer-whatsapp-link">
                        💬 دعم واتساب: 96555727313+
                      </a>
                    </li>
                  </ul>
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
