import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import CartToast from "@/app/components/CartToast";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import { getLocalizedHref } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";

export default async function StorefrontLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="page-wrapper">
      {/* ─── Header ─── */}
      <Header lang={lang} dict={dict} />

      {/* ─── Cart Toast Popup ─── */}
      <CartToast />

      {/* ─── Main Content ─── */}
      <div className="main-content">{children}</div>

      {/* ─── Mobile Bottom Navigation ─── */}
      <MobileBottomNav lang={lang} />

      {/* ─── Footer ─── */}
      <footer className="site-footer">
        <div className="container footer-container">
          {/* Column 1: Brand Info */}
          <div className="footer-col footer-brand-col">
            <Link href={getLocalizedHref("/", lang)} className="footer-logo">
              <Image 
                src="https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape-icon.png" 
                alt="سحبة فيب" 
                width={512}
                height={512}
                unoptimized
              />
            </Link>
            <p className="footer-desc">متجر سحبة فيب الأول لجميع سحبات وبودات ونكهات الفيب في الكويت.</p>
          </div>

          {/* Column 2: Additional Info */}
          <div className="footer-col">
            <h3>معلومات إضافية</h3>
            <ul>
              <li><Link href={getLocalizedHref("/about-us", lang)}>من نحن</Link></li>
              <li><Link href={getLocalizedHref("/faq", lang)}>الأسئلة المتكررة</Link></li>
              <li><Link href={getLocalizedHref("/disclaimer", lang)}>إخلاء المسؤولية</Link></li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="footer-col">
            <h3>السياسات والقوانين</h3>
            <ul>
              <li><Link href={getLocalizedHref("/privacy-policy", lang)}>سياسة الخصوصية</Link></li>
              <li><Link href={getLocalizedHref("/refund_returns", lang)}>سياسة الاستبدال والاسترجاع</Link></li>
              <li><Link href={getLocalizedHref("/terms-conditions", lang)}>الشروط والأحكام</Link></li>
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
  );
}
