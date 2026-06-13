'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { checkoutAction } from "@/app/actions/cart";
import { cleanPrice } from "@/lib/graphql";

const REGIONS = [
  { id: "hawally", name: "حولي", fee: 1.000 },
  { id: "salmiya", name: "السالمية", fee: 1.000 },
  { id: "kuwait-city", name: "العاصمة", fee: 1.000 },
  { id: "farwaniya", name: "الفروانية", fee: 1.500 },
  { id: "ahmadi", name: "الأحمدي", fee: 1.500 },
  { id: "mubarak", name: "مبارك الكبير", fee: 1.500 },
  { id: "jahra", name: "الجهراء", fee: 2.000 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading, clearCart } = useCart();

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" or "online"
  
  // Submit State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const items = cart?.contents?.nodes || [];
  const hasItems = items.length > 0;

  // Find selected shipping fee
  const selectedRegion = REGIONS.find(r => r.id === selectedRegionId);
  const shippingFee = selectedRegion ? selectedRegion.fee : 0;

  const getCleanAmount = (priceHtml: string | null) => {
    const cleaned = cleanPrice(priceHtml);
    return cleaned ? parseFloat(cleaned) : 0;
  };

  const cartSubtotal = getCleanAmount(cart?.subtotal || "0.000");
  const grandTotal = cartSubtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate Name
    if (!fullName.trim()) {
      setErrorMsg("الرجاء إدخال الاسم الكامل.");
      return;
    }

    // Validate Phone
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setErrorMsg("الرجاء إدخال رقم الهاتف.");
      return;
    }
    if (!/^\d{8}$/.test(cleanPhone)) {
      setErrorMsg("الرجاء إدخال رقم هاتف كويتي صالح مكون من 8 أرقام.");
      return;
    }

    // Validate Region
    if (!selectedRegionId) {
      setErrorMsg("الرجاء اختيار منطقة التوصيل.");
      return;
    }

    // Validate Address
    if (!addressDetail.trim()) {
      setErrorMsg("الرجاء إدخال تفاصيل العنوان (المنطقة، الشارع، المنزل...).");
      return;
    }

    setSubmitting(true);

    try {
      // Split Name
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || ".";

      // Session token
      const sessionToken = localStorage.getItem("vapecart_woocommerce_session") || undefined;

      // Submit mutation
      const res = await checkoutAction(
        firstName,
        lastName,
        cleanPhone,
        addressDetail,
        selectedRegion?.name || "",
        sessionToken
      );

      if (res.success && res.order) {
        const orderId = res.order.databaseId;
        const total = grandTotal.toFixed(3);

        // Clear cart globally
        clearCart();

        if (paymentMethod === "cod") {
          // COD redirect to success page
          router.push(`/checkout/success?orderId=${orderId}&total=${total}`);
        } else {
          // Pay Online redirect to WhatsApp
          const waUrl = `https://wa.me/96550293740?text=${encodeURIComponent(
            `مرحباً، أرغب بالدفع للطلب رقم: ${orderId} بقيمة: ${total} د.ك`
          )}`;
          window.location.href = waUrl;
        }
      } else {
        setErrorMsg(res.error || "حدث خطأ أثناء إتمام الطلب، يرجى المحاولة مرة أخرى.");
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى.");
      setSubmitting(false);
    }
  };

  if (loading && !hasItems) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>جاري تحميل صفحة الدفع...</p>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="checkout-empty container">
        <div className="cart-empty-card">
          <div className="cart-empty-icon" aria-hidden="true">🛒</div>
          <h2>سلة المشتريات فارغة</h2>
          <p>لا يمكنك إتمام الطلب لأن سلتك فارغة حالياً. هل ترغب بتصفح النكهات أو سحبات الفيب؟</p>
          <Link href="/shop" className="cart-empty-cta">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="checkout-page-container container">
      <h1 className="checkout-page-title">إتمام الطلب</h1>

      <form onSubmit={handleSubmit} className="checkout-grid">
        {/* Left Side: Billing Fields */}
        <div className="checkout-form-section">
          <div className="checkout-card">
            <h2>تفاصيل الشحن والتوصيل</h2>

            {errorMsg && (
              <div className="checkout-error-banner" role="alert">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="fullName">الاسم الكامل *</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم الأول واسم العائلة"
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">رقم الهاتف الكويتي (8 أرقام) *</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="مثال: 50293740"
                maxLength={8}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="region">المنطقة في الكويت *</label>
              <select
                id="region"
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                disabled={submitting}
                required
              >
                <option value="">-- اختر المنطقة --</option>
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (رسوم التوصيل: {r.fee.toFixed(3)} د.ك)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="address">العنوان بالتفصيل *</label>
              <textarea
                id="address"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="المنطقة، القطعة، الشارع، الجادة، المنزل/الشقة..."
                rows={3}
                disabled={submitting}
                required
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="checkout-card payment-methods-card">
            <h2>طريقة الدفع</h2>
            <div className="payment-options">
              <label className={`payment-option-label ${paymentMethod === "cod" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  disabled={submitting}
                />
                <div className="payment-option-details">
                  <span className="payment-option-title">الدفع كاش عند الاستلام</span>
                  <span className="payment-option-desc">ادفع نقداً لعامل التوصيل فور استلام طلبك.</span>
                </div>
              </label>

              <label className={`payment-option-label ${paymentMethod === "online" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  disabled={submitting}
                />
                <div className="payment-option-details">
                  <span className="payment-option-title">الدفع اونلاين</span>
                  <span className="payment-option-desc">الدفع آمن ومباشر عبر واتساب لتأكيد الشحن فوراً.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary Card */}
        <div className="checkout-summary-section">
          <div className="checkout-card summary-card">
            <h2>ملخص الطلب</h2>

            <div className="checkout-items-list">
              {items.map((item) => {
                const product = item.product.node;
                const variation = item.variation?.node;
                const name = variation ? variation.name : product.name;
                const qty = item.quantity;
                const price = cleanPrice(variation ? variation.price : product.price) || "0.000";

                return (
                  <div key={item.key} className="checkout-item-row">
                    <span className="checkout-item-name-qty">
                      {name} <strong className="qty">× {qty}</strong>
                    </span>
                    <span className="checkout-item-price">
                      {(parseFloat(price) * qty).toFixed(3)} د.ك
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>المجموع الفرعي</span>
              <span>{cartSubtotal.toFixed(3)} د.ك</span>
            </div>

            <div className="summary-row">
              <span>رسوم التوصيل</span>
              <span>
                {selectedRegion ? `${shippingFee.toFixed(3)} د.ك` : "يحدد بعد اختيار المنطقة"}
              </span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>الإجمالي الكلي</span>
              <span className="total-val">{grandTotal.toFixed(3)} د.ك</span>
            </div>

            <button type="submit" className="submit-order-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="mini-spinner"></div>
                  جاري إرسال الطلب...
                </>
              ) : (
                <>
                  تاكيد الطلب
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
