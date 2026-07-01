'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { checkoutAction } from "@/app/actions/cart";
import { cleanPrice } from "@/lib/formatters";

const KUWAIT_SHIPPING_ZONES = [
  { id: "area-1", name: "اشبيلية", fee: 2 },
  { id: "area-2", name: "الأحمدي", fee: 2 },
  { id: "area-3", name: "الأندلس", fee: 2 },
  { id: "area-4", name: "البدع", fee: 2 },
  { id: "area-5", name: "الجابرية", fee: 2 },
  { id: "area-6", name: "الجهراء", fee: 2 },
  { id: "area-7", name: "الحساوي", fee: 2 },
  { id: "area-8", name: "الخالدية", fee: 2 },
  { id: "area-9", name: "الدسمة", fee: 2 },
  { id: "area-10", name: "الدعية", fee: 2 },
  { id: "area-11", name: "الدوحة", fee: 2 },
  { id: "area-12", name: "الرابية", fee: 2 },
  { id: "area-13", name: "الرحاب", fee: 2 },
  { id: "area-14", name: "الرقة", fee: 2 },
  { id: "area-15", name: "الرقعي", fee: 2 },
  { id: "area-16", name: "الرميثية", fee: 2 },
  { id: "area-17", name: "الروضة", fee: 2 },
  { id: "area-18", name: "الري", fee: 2 },
  { id: "area-19", name: "الزهراء", fee: 2 },
  { id: "area-20", name: "السالمي", fee: 2 },
  { id: "area-21", name: "السالمية", fee: 1 },
  { id: "area-22", name: "السرة", fee: 2 },
  { id: "area-23", name: "السلام", fee: 2 },
  { id: "area-24", name: "الشامية", fee: 2 },
  { id: "area-25", name: "الشدادية", fee: 2 },
  { id: "area-26", name: "الشرق", fee: 2 },
  { id: "area-27", name: "الشعب", fee: 2 },
  { id: "area-28", name: "الشعيبة", fee: 2 },
  { id: "area-29", name: "الشهداء", fee: 2 },
  { id: "area-30", name: "الشويخ", fee: 2 },
  { id: "area-31", name: "الصالحية", fee: 2 },
  { id: "area-32", name: "الصباحية", fee: 2 },
  { id: "area-33", name: "الصبية", fee: 2 },
  { id: "area-34", name: "الصديق", fee: 2 },
  { id: "area-35", name: "الصليبية", fee: 2 },
  { id: "area-36", name: "الصليبيخات", fee: 2 },
  { id: "area-37", name: "الضجيج", fee: 2 },
  { id: "area-38", name: "الظهر", fee: 2 },
  { id: "area-39", name: "العارضية", fee: 2 },
  { id: "area-40", name: "العباسية", fee: 2 },
  { id: "area-41", name: "العبدلي", fee: 6 },
  { id: "area-42", name: "العدان", fee: 2 },
  { id: "area-43", name: "العديلية", fee: 2 },
  { id: "area-44", name: "العقيلة", fee: 2 },
  { id: "area-45", name: "العمرية", fee: 2 },
  { id: "area-46", name: "الفحيحيل", fee: 2 },
  { id: "area-47", name: "الفردوس", fee: 2 },
  { id: "area-48", name: "الفروانية", fee: 2 },
  { id: "area-49", name: "الفنطاس", fee: 2 },
  { id: "area-50", name: "الفنيطيس", fee: 2 },
  { id: "area-51", name: "الفيحاء", fee: 2 },
  { id: "area-52", name: "القادسية", fee: 2 },
  { id: "area-53", name: "القبلة", fee: 2 },
  { id: "area-54", name: "القرين", fee: 2 },
  { id: "area-55", name: "القصور", fee: 2 },
  { id: "area-56", name: "القيروان", fee: 2 },
  { id: "area-57", name: "الكويت", fee: 2 },
  { id: "area-58", name: "المرقاب", fee: 2 },
  { id: "area-59", name: "المسايل", fee: 2 },
  { id: "area-60", name: "المسيلة", fee: 2 },
  { id: "area-61", name: "المطلاع", fee: 6 },
  { id: "area-62", name: "المنصورية", fee: 2 },
  { id: "area-63", name: "المنقف", fee: 2 },
  { id: "area-64", name: "المهبولة", fee: 2 },
  { id: "area-65", name: "النزهة", fee: 2 },
  { id: "area-66", name: "النهضة", fee: 2 },
  { id: "area-67", name: "النويصيب", fee: 6 },
  { id: "area-68", name: "الوفرة", fee: 2 },
  { id: "area-69", name: "اليرموك", fee: 2 },
  { id: "area-70", name: "أبو الحصاني", fee: 2 },
  { id: "area-71", name: "أبو حليفة", fee: 2 },
  { id: "area-72", name: "أبو فطيرة", fee: 2 },
  { id: "area-73", name: "أمغرة", fee: 2 },
  { id: "area-74", name: "بنيد القار", fee: 2 },
  { id: "area-75", name: "بنيدر", fee: 6 },
  { id: "area-76", name: "بيان", fee: 2 },
  { id: "area-77", name: "جابر الأحمد", fee: 2 },
  { id: "area-78", name: "جليب الشيوخ", fee: 2 },
  { id: "area-79", name: "حطين", fee: 2 },
  { id: "area-80", name: "حولي", fee: 2 },
  { id: "area-81", name: "خيران", fee: 2 },
  { id: "area-82", name: "خيطان", fee: 2 },
  { id: "area-83", name: "دسمان", fee: 2 },
  { id: "area-84", name: "سعد العبدالله", fee: 2 },
  { id: "area-85", name: "سلوى", fee: 2 },
  { id: "area-86", name: "شمال غرب الصليبيخات", fee: 2 },
  { id: "area-87", name: "صباح الأحمد", fee: 2 },
  { id: "area-88", name: "صباح السالم", fee: 2 },
  { id: "area-89", name: "صبحان", fee: 2 },
  { id: "area-90", name: "ضاحية جابر العلي", fee: 2 },
  { id: "area-91", name: "ضاحية صباح الناصر", fee: 2 },
  { id: "area-92", name: "ضاحية عبدالله السالم", fee: 2 },
  { id: "area-93", name: "ضاحية مبارك العبدالله", fee: 2 },
  { id: "area-94", name: "عبد الله المبارك", fee: 2 },
  { id: "area-95", name: "علي صباح السالم - أم الهيمان", fee: 5 },
  { id: "area-96", name: "غرب عبدالله المبارك", fee: 2 },
  { id: "area-97", name: "غرناطة", fee: 2 },
  { id: "area-98", name: "فهد الأحمد", fee: 2 },
  { id: "area-99", name: "قرطبة", fee: 2 },
  { id: "area-100", name: "كبد", fee: 6 },
  { id: "area-101", name: "كيفان", fee: 2 },
  { id: "area-102", name: "مبارك الكبير", fee: 2 },
  { id: "area-103", name: "مشرف", fee: 2 },
  { id: "area-104", name: "ميدان حولي", fee: 2 },
  { id: "area-105", name: "ميناء الأحمدي", fee: 2 },
  { id: "area-106", name: "ميناء عبدالله", fee: 2 },
  { id: "area-107", name: "هدية", fee: 2 }
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading, clearCart } = useCart();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedShippingFee, setSelectedShippingFee] = useState<number>(0);
  const [addressDetail, setAddressDetail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" or "online"
  
  // Searchable Dropdown state
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Submit State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handle click outside searchable dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle shipping zone input typing
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setIsDropdownOpen(true);
    const matched = KUWAIT_SHIPPING_ZONES.find(
      (z) => z.name.trim() === val.trim()
    );
    if (matched) {
      setSelectedRegionId(matched.id);
      setSelectedShippingFee(matched.fee);
    } else {
      setSelectedRegionId("");
      setSelectedShippingFee(0);
    }
  };

  // Handle shipping zone selection from dropdown list
  const handleSelectZone = (zone: typeof KUWAIT_SHIPPING_ZONES[0]) => {
    setSelectedRegionId(zone.id);
    setSelectedShippingFee(zone.fee);
    setSearchQuery(zone.name);
    setIsDropdownOpen(false);
  };

  // Filter zones dynamically
  const filteredZones = KUWAIT_SHIPPING_ZONES.filter((zone) =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const items = cart?.contents?.nodes || [];
  const hasItems = items.length > 0;

  // Resolve selected region object for label display
  const selectedRegion = KUWAIT_SHIPPING_ZONES.find(r => r.id === selectedRegionId);
 
  const getCleanAmount = (priceHtml: string | null) => {
    const cleaned = cleanPrice(priceHtml);
    return cleaned ? parseFloat(cleaned) : 0;
  };
 
  const cartSubtotal = getCleanAmount(cart?.subtotal || "0.000");
  const grandTotal = cartSubtotal + selectedShippingFee;

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

    // Validate Email
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg("الرجاء إدخال البريد الإلكتروني.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg("الرجاء إدخال بريد إلكتروني صالح.");
      return;
    }

    // Validate Region and Fee
    if (!selectedRegionId || selectedShippingFee <= 0) {
      setErrorMsg("الرجاء اختيار منطقة توصيل صالحة.");
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
        sessionToken,
        cleanEmail,
        selectedRegion?.name || "",
        selectedShippingFee
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
              <label htmlFor="email">البريد الإلكتروني *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="region">المنطقة في الكويت *</label>
              <div
                ref={dropdownRef}
                className={`searchable-dropdown-wrapper ${isDropdownOpen ? "open" : ""}`}
              >
                <input
                  type="text"
                  id="region"
                  value={searchQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="ابحث واختر المنطقة..."
                  disabled={submitting}
                  required
                  autoComplete="off"
                />
                <span className="dropdown-indicator">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
                {isDropdownOpen && (
                  <ul className="dropdown-list">
                    {filteredZones.length > 0 ? (
                      filteredZones.map((r) => (
                        <li
                          key={r.id}
                          className={`dropdown-item ${selectedRegionId === r.id ? "active" : ""}`}
                          onMouseDown={() => handleSelectZone(r)}
                        >
                          {r.name}
                        </li>
                      ))
                    ) : (
                      <li className="dropdown-no-results">لا توجد نتائج مطابقة</li>
                    )}
                  </ul>
                )}
              </div>
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
                const product = item.product?.node;
                if (!product) return null;
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
              <span>رسوم التوصيل {selectedRegion ? `(${selectedRegion.name})` : ""}</span>
              <span>
                {selectedRegionId
                  ? `${selectedShippingFee.toFixed(3)} د.ك`
                  : "اختر المنطقة أولاً"}
              </span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>الإجمالي النهائي</span>
              <span className="total-val">{grandTotal.toFixed(3)} د.ك</span>
            </div>

            <button
              type="submit"
              className="submit-order-btn"
              disabled={submitting || !selectedRegionId}
            >
              {submitting ? (
                <>
                  <div className="mini-spinner"></div>
                  جاري إرسال الطلب...
                </>
              ) : (
                <>
                  تأكيد الطلب — {grandTotal.toFixed(3)} د.ك
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
