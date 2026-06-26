import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إتمام الطلب | سحبة فيب",
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="checkout-layout">
      {/* ─── Minimal Checkout Header ─── */}
      <header className="checkout-header">
        <div className="checkout-header-container">
          {/* Right side: Return to Cart (in RTL, points right for back) */}
          <div className="checkout-header-right">
            <Link href="/cart" className="checkout-back-link">
              <span className="back-arrow">→</span>
              <span>العودة للسلة</span>
            </Link>
          </div>

          {/* Center: Logo */}
          <div className="checkout-header-center">
            <Link href="/">
              <img 
                src="https://lightgrey-flamingo-522119.hostingersite.com/wp-content/uploads/2026/02/sahbavape.webp" 
                alt="سحبة فيب" 
                className="checkout-logo"
              />
            </Link>
          </div>

          {/* Left side: Secure Checkout Trust Badge */}
          <div className="checkout-header-left">
            <div className="checkout-secure-badge" title="تسوق آمن ومحمي">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="secure-icon"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>تسوق آمن</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Checkout Content ─── */}
      <div className="checkout-main">{children}</div>
    </div>
  );
}
