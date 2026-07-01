import Link from "next/link";

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string; total?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId, total } = await searchParams;

  return (
    <main className="success-page-container container">
      <div className="success-card">
        <div className="success-icon" aria-hidden="true">✓</div>
        <h1>تمت عملية الشراء بنجاح!</h1>
        <p className="success-subtitle">شكرًا لك على تسوقك من سحبة فيب. تم استلام طلبك بنجاح وجاري تجهيزه للشحن.</p>
        
        <div className="order-details-box">
          <div className="order-details-row">
            <span>رقم الطلب:</span>
            <strong>#{orderId || "غير متوفر"}</strong>
          </div>
          <div className="order-details-row">
            <span>المبلغ الإجمالي الكلي:</span>
            <strong>{total || "0.000"} د.ك</strong>
          </div>
          <div className="order-details-row">
            <span>طريقة الدفع:</span>
            <strong>الدفع نقداً عند الاستلام (COD)</strong>
          </div>
        </div>

        <div className="success-info-notice">
          <span className="notice-icon">⚡️</span>
          <p>سيتصل بك مندوب التوصيل خلال ساعات قليلة لتأكيد العنوان وتسليم الطلب.</p>
        </div>

        <div className="success-actions">
          <Link href="/shop" className="btn-continue">
            مواصلة التسوق
          </Link>
          <Link href="/" className="btn-home">
            الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
