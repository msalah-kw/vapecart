# متجر فيب سحبة - Vapecart Headless Store 🌬️🛒

موقع تجارة إلكترونية حديث وسريع للغاية لبيع منتجات الفيب (Vape) في دولة الكويت، مبني كـ Headless Store باستخدام واجهة برمجية منفصلة.

---

## 📌 نبذة عن المشروع (Project Overview)
المشروع عبارة عن واجهة أمامية (Frontend) متطورة مبنية بإطار العمل **Next.js 16+ (App Router)**، متصلة بنظام إدارة المحتوى **WordPress** ولوحة التحكم **WooCommerce** عبر واجهة **WPGraphQL** و **WooGraphQL**. تم تحسين الموقع ليلائم متطلبات السوق الكويتي ومحركات البحث (SEO).

* **السوق المستهدف:** دولة الكويت 🇰🇼
* **العملة المستخدمة:** الدينار الكويتي (KWD)
* **قاعدة البيانات والتحكم:** WordPress + WooCommerce
* **الواجهة الأمامية:** Next.js (App Router)

---

## 🚀 التقنيات المستخدمة (Tech Stack)
* **Next.js 16+ (React 19):** لتقديم تجربة تصفح فائقة السرعة وتوليد صفحات ديناميكية مع إعادة التحقق الموقت (ISR/SSR).
* **GraphQL (WPGraphQL):** للتواصل الفعال والآمن مع backend لجلب المنتجات والأصناف بدقة.
* **Vanilla CSS variables:** لتصميم عصري، متجاوب، وسريع التحميل دون استخدام أي إطارات عمل خارجية (مثل Tailwind CSS) لضمان DOM نظيف بنسبة 100%.
* **CSS Logical Properties:** لدعم تصميم RTL باللغة العربية بشكل افتراضي دون الحاجة لتكرار التنسيقات.
* **JSON-LD & SEO:** مدمج لضمان فهرسة ممتازة للمنتجات والأقسام في محركات البحث.

---

## ✨ المميزات الرئيسية (Core Features)

### 1. تصميم أحادي اللغة (Arabic Single-Language)
* **تراجع كامل عن i18n/Polylang:** تم إلغاء نظام اللغات المتعددة بشكل نهائي وتبسيط نظام التوجيه (Routing) ليكون مسطحاً وخالياً من الرموز اللغوية مثل `/[lang]`. يركز المتجر 100% على اللغة العربية لرفع الأداء وتحسين نتائج الأرشفة المحلية.

### 2. تحسينات محركات البحث (SEO & Metadata)
* توليد تلقائي للبيانات الوصفية (Metadata) لكل منتج وقسم.
* دعم البيانات المنظمة (JSON-LD Structured Data Schema) لعرض الأسعار، التوفر، والصور بشكل مميز في نتائج بحث جوجل.

### 3. مطابقة المصطلحات ومعالجة النصوص (Terminology & Safety)
* يحتوي المتجر على نظام فحص وتعديل تلقائي للمصطلحات ليتناسب مع السوق الكويتي (على سبيل المثال: استبدال "تبريد" بـ "ايس"، و"موشة" بـ "سحبة"، و"السائل الالكتروني" بـ "النكهة").
* حماية كاملة ضد الأخطاء البرمجية الناتجة عن القيم الفارغة (`null` أو `undefined`) في تفاصيل المنتجات والأسعار.

### 4. متوافق مع خيارات الشحن المحلية
* دعم كامل لمناطق الكويت المختلفة (مثل: حولي، السالمية، الأحمدي، وغيرها) لحساب تكاليف الشحن الدقيقة وإتمام الطلبات بسلاسة.

---

## 🔄 تخصيص المتجر لأي موقع أو علامة تجارية أخرى (White-Labeling & Branding)
تم تصميم هذا المشروع وتجهيزه برمجياً ليتم استنساخه وإعادة تخصيصه لعلامات تجارية ونطاقات أخرى بسهولة. تم إدراج تعليقات بحثية واضحة بالبادئة `// BRANDING_TODO:` (أو `/* BRANDING_TODO: */` في ملفات التنسيق) لتشير بدقة إلى الأكواد التي تتطلب التخصيص:

### 1. ملف المتغيرات البيئية (`.env.local`)
يحتوي على الروابط الأساسية للموقع والـ API:
* `NEXT_PUBLIC_WORDPRESS_API_URL`: قم بتعديله ليشير إلى رابط GraphQL لمتجرك الجديد (مثال: `https://your-new-wp-backend.com/graphql`).
* `NEXT_PUBLIC_SITE_URL`: رابط الواجهة الأمامية للموقع الجديد (مثال: `https://your-new-domain.com`).

### 2. إعدادات Next.js (`next.config.mjs`)
* **السماح بالصور الخارحية (`remotePatterns`)**: قم بتغيير الـ `hostname` ليتوافق مع رابط نطاق WordPress الجديد لكي تظهر صور المنتجات بشكل صحيح.
* **إعادة توجيه الـ www لـ Non-www**: في دالة `redirects()`، قم بتحديث اسم النطاق المستهدف ليكون النطاق الجديد بدلاً من `sahbavape.com`.

### 3. إعدادات الواجهة والروابط الافتراضية (`src/lib/graphql.ts`)
* `GRAPHQL_ENDPOINT`: قم بتعديل الرابط الاحتياطي (Fallback URL) في السطر الأول ليتماشى مع خادم الـ WordPress الافتراضي الجديد في حال لم يتم قراءته من البيئة المحيطة.

### 4. التنسيق والبيانات العامة للموقع (`src/app/layout.tsx`)
* **البيانات الوصفية الافتراضية (`metadata`)**: قم بتحديث العناوين الوصفية الافتراضية للموقع، الأيقونات (`icons`)، ورابط الـ `apple` المرجعي.
* **تزييل الصفحة (Footer)**:
  * الشعار (Logo) وأيقونات الموقع.
  * النصوص التعريفية وروابط الصفحات التعريفية كـ "من نحن" وغيرها.
  * رابط واتساب الدعم الفني ورقم الهاتف (`wa.me/965xxxxxxx`).

### 5. تصحيح المصطلحات وتطهير النصوص (`src/app/product/[slug]/page.tsx` و `src/app/[slug]/page.tsx`)
* **دالة `sanitizeTerminology`**: إذا كنت لا ترغب باستبدال المصطلحات تلقائياً، يمكنك إرجاع النص كما هو أو تخصيص الكلمات البديلة بما يتلاءم مع لهجة بلدك أو طبيعة منتجاتك.
* **روابط JSON-LD**: تحديث الروابط الافتراضية للنطاق المرجع ليكون النطاق الجديد.

---

## ⚙️ إعدادات خادم الووردبريس (WordPress Setup & Snippets)
لضمان عمل متجر Next.js (Headless) بشكل صحيح مع ووكوميرس (WooCommerce) وWPGraphQL، يجب إضافة الكودين البرمجيين التاليين في الووردبريس عن طريق إضافة **WPCode (Code Snippets)** كـ PHP Snippets وتفعيلها:

### 1. حل مشكلة CORS في GraphQL (GraphQL CORS)
يسمح هذا الكود للواجهة الأمامية (Next.js) بالاتصال بخادم الووردبريس بأمان ودون حظر طلبات المتصفح:
```php
add_filter( 'graphql_response_headers_to_send', function( $headers ) {
    $headers['Access-Control-Allow-Origin']  = '*'; 
    $headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS, PUT, DELETE';
    $headers['Access-Control-Allow-Credentials'] = 'true';
    return $headers;
} );
```

### 2. احتساب وإضافة رسوم الشحن للطلب يدوياً (Add Shipping Fees forcefully)
نظراً لأن عملية الدفع للزوار (Guest Checkout) لا تدعم إضافة رسوم الشحن مباشرة من جانب العميل لأسباب أمنية، فإن هذا الكود يقوم بقراءة رسوم الشحن والمنطقة المحددة من الميتا داتا المرسلة من Next.js وتطبيقها وحسابها كرسوم شحن رسمية في الطلب عند إتمامه:
```php
add_action( 'woocommerce_checkout_order_processed', 'apply_headless_shipping_forcefully', 10, 1 );

function apply_headless_shipping_forcefully( $order_id ) {
    $order = wc_get_order( $order_id );
    if ( ! $order ) return;

    $shipping_fee = '';
    $shipping_area = 'غير محدد';

    // 1. قراءة الطلب الخام القادم من Next.js
    $raw_post = file_get_contents( 'php://input' );
    if ( ! empty( $raw_post ) ) {
        $json = json_decode( $raw_post, true );
        
        // استخراج بيانات التوصيل من الميتا داتا
        if ( isset( $json['variables']['input']['metaData'] ) && is_array( $json['variables']['input']['metaData'] ) ) {
            foreach ( $json['variables']['input']['metaData'] as $meta ) {
                if ( isset($meta['key']) && $meta['key'] === 'shipping_fee' ) {
                    $shipping_fee = $meta['value'];
                }
                if ( isset($meta['key']) && $meta['key'] === 'shipping_area' ) {
                    $shipping_area = $meta['value'];
                }
            }
        }
    }

    // 2. التنفيذ الصارم إذا وجدنا رسوم توصيل من الواجهة
    if ( $shipping_fee !== '' ) {
        
        // أ. مسح أي طرق شحن افتراضية أضافها ووكوميرس (مثل Free Shipping)
        $existing_shipping = $order->get_shipping_methods();
        if ( ! empty( $existing_shipping ) ) {
            foreach ( $existing_shipping as $item_id => $shipping_item ) {
                $order->remove_item( $item_id );
            }
        }

        // ب. إضافة رسوم التوصيل الصحيحة الخاصة بنا
        $item = new WC_Order_Item_Shipping();
        $item->set_method_title( 'توصيل إلى: ' . $shipping_area );
        $item->set_method_id( 'flat_rate:headless' );
        $item->set_total( floatval( $shipping_fee ) );
        
        $order->add_item( $item );
        
        // ج. حفظ الميتا داتا يدوياً لضمان توثيقها
        $order->update_meta_data( 'shipping_fee', $shipping_fee );
        $order->update_meta_data( 'shipping_area', $shipping_area );
        
        // د. إعادة حساب الإجمالي (المنتجات + الشحن) وحفظ الفاتورة
        $order->calculate_totals();
        $order->save();
    }
}
```

---

## 🛠️ كيفية التشغيل محلياً (Local Development)

### المتطلبات الأساسية
* وجود **Node.js** مثبت على جهازك.

### خطوات التشغيل
1. قم بتثبيت الحزم البرمجية:
   ```bash
   npm install
   ```

2. قم بتعديل ملف المتغيرات البيئية `.env.local` للتأكد من إشارتها لرابط الـ API الصحيح.

3. تشغيل خادم التطوير:
   ```bash
   npm run dev
   ```
   افتح [http://localhost:3000](http://localhost:3000) في متصفحك لمشاهدة المتجر.

4. لفحص توافق أنواع TypeScript البرمجية للتأكد من خلو المشروع من أي مشاكل:
   ```bash
   npx.cmd tsc --noEmit
   ```

---

## 📦 بناء المشروع للإنتاج (Production Build)
لبناء المشروع وتجهيزه للنشر:
```bash
npm run build
```
ولتشغيل النسخة المبنية محلياً:
```bash
npm run start
```
