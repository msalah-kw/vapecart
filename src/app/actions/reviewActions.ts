"use server";

import { fetchGraphQL } from "@/lib/graphql";

const SUBMIT_PRODUCT_REVIEW = `
  mutation SubmitProductReview($input: WriteReviewInput!) {
    writeReview(input: $input) {
      rating
      review {
        id
        databaseId
        approved
        status
        content
        date
      }
    }
  }
`;

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

  try {
    const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "https://lightgrey-flamingo-522119.hostingersite.com/graphql";

    const variables = {
      input: {
        commentOn: data.productId,
        rating: data.rating,
        content: data.content.trim(),
        author: data.author.trim(),
        authorEmail: data.authorEmail.trim(),
      },
    };

    console.log("[submitProductReview] ➤ Sending review input to:", GRAPHQL_ENDPOINT);

    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: SUBMIT_PRODUCT_REVIEW,
        variables,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[submitProductReview] ✖ HTTP Error:", res.status, res.statusText);
      return { 
        success: false, 
        error: `فشل الاتصال بالخادم لإرسال التقييم (رمز الاستجابة: ${res.status}).` 
      };
    }

    const json = await res.json();

    if (json.errors && json.errors.length > 0) {
      console.error("[submitProductReview] ✖ GraphQL Errors:", JSON.stringify(json.errors, null, 2));
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
