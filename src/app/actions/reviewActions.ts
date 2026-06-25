"use server";

import { cookies } from "next/headers";
import { SUBMIT_PRODUCT_REVIEW } from "@/lib/graphql";

export interface ReviewResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitProductReview(data: {
  productId: number;
  rating: number;
  content: string;
  author: string;
  authorEmail: string;
}): Promise<ReviewResponse> {
  // 1. Basic validation in Arabic
  if (!data.productId) {
    return { success: false, error: "معرّف المنتج غير صالح." };
  }
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    return { success: false, error: "يرجى تحديد التقييم من 1 إلى 5 نجوم." };
  }
  if (!data.content || data.content.trim().length < 5) {
    return { success: false, error: "يجب أن يكون نص التقييم 5 أحرف على الأقل." };
  }
  if (!data.author || data.author.trim().length < 2) {
    return { success: false, error: "يرجى كتابة الاسم." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.authorEmail || !emailRegex.test(data.authorEmail)) {
    return { success: false, error: "يرجى إدخال بريد إلكتروني صحيح." };
  }

  const GRAPHQL_ENDPOINT = process.env.WORDPRESS_API_URL || "https://lightgrey-flamingo-522119.hostingersite.com/graphql";

  const variables = {
    input: {
      commentOn: data.productId,
      rating: data.rating,
      content: data.content.trim(),
      author: data.author.trim(),
      authorEmail: data.authorEmail.trim(),
      clientMutationId: "vapecart-review"
    },
  };

  // Helper fetch function to reuse for retry
  const executeFetch = async (token?: string) => {
    return fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "woocommerce-session": `Session ${token}` } : {})
      },
      body: JSON.stringify({
        query: SUBMIT_PRODUCT_REVIEW,
        variables,
      }),
      cache: "no-store",
    });
  };

  try {
    // Get session token from cookies
    const cookieStore = await cookies();
    let sessionToken = cookieStore.get("woocommerce-session")?.value;

    console.log("[submitProductReview] ➤ Sending review input to:", GRAPHQL_ENDPOINT, "with token?", !!sessionToken);

    let res = await executeFetch(sessionToken);

    if (!res.ok) {
      console.error("[submitProductReview] ✖ HTTP Error:", res.status, res.statusText);
      return { 
        success: false, 
        error: `فشل الاتصال بالخادم لإرسال التقييم (رمز الاستجابة: ${res.status}).` 
      };
    }

    let json = await res.json();

    // Check for token errors to trigger retry auto-recovery
    const isExpiredToken = json.errors && json.errors.some((err: any) => 
      err.message?.includes("invalid_token") || 
      err.message?.includes("Expired token") ||
      err.message?.includes("jwt")
    );

    if (isExpiredToken && sessionToken) {
      console.warn("submitProductReview: Token expired/invalid. Clearing cookies and retrying as guest...");
      try {
        cookieStore.delete("woocommerce-session");
        cookieStore.delete("wp_jwt");
        cookieStore.delete("woo-session");
      } catch (cookieErr) {
        console.error("Error clearing cookies:", cookieErr);
      }

      // Retry fetch without token
      res = await executeFetch(undefined);
      if (!res.ok) {
        return { 
          success: false, 
          error: `فشل الاتصال بالخادم بعد إعادة محاولة الجلسة (رمز الاستجابة: ${res.status}).` 
        };
      }
      json = await res.json();
    }

    if (json.errors && json.errors.length > 0) {
      console.error("[submitProductReview] ✖ GraphQL Errors:", JSON.stringify(json.errors, null, 2));
      
      // Moderation error check (Internal server error for writeReview path)
      const isModerationError = json.errors.some((err: any) => 
        (err.message?.includes("Internal server error") || err.message?.includes("internal server error")) &&
        err.path && 
        err.path.includes("writeReview")
      );

      if (isModerationError) {
        console.log("[submitProductReview] ➤ Intercepted internal server error for unapproved comment. Treating as PENDING_MODERATION success.");
        return { success: true, message: "PENDING_MODERATION" };
      }

      const firstError = json.errors[0]?.message || "";
      
      // Look for specific WordPress comment submission rejection triggers
      if (firstError.toLowerCase().includes("duplicate")) {
        return { 
          success: false, 
          error: "لقد أرسلت هذا التقييم بالفعل سابقاً. التقييمات المكررة غير مسموح بها." 
        };
      }
      if (firstError.toLowerCase().includes("quickly")) {
        return { 
          success: false, 
          error: "أنت ترسل التقييمات بسرعة كبيرة. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى." 
        };
      }
      
      return { 
        success: false, 
        error: "فشل الخادم في قبول التقييم. يرجى التأكد من ملء الحقول بشكل صحيح والمحاولة لاحقاً." 
      };
    }

    const reviewPayload = json.data?.writeReview;
    console.log("[submitProductReview] ➤ Response received:", JSON.stringify(reviewPayload));

    if (reviewPayload) {
      return { success: true, message: "PENDING_MODERATION" };
    }

    return { success: false, error: "حدث خطأ غير متوقع أثناء معالجة تقييمك. يرجى المحاولة لاحقاً." };
  } catch (error: any) {
    console.error("[submitProductReview] ✖ Connection Error:", error);
    return { 
      success: false, 
      error: "فشل الاتصال بالخادم لإرسال التقييم. يرجى التحقق من اتصال شبكتك والمحاولة لاحقاً." 
    };
  }
}
