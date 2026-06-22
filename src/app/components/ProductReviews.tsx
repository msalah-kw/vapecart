"use client";

import { useState, useTransition } from "react";
import { submitProductReview } from "@/app/actions/reviewActions";

interface ReviewNode {
  id: string;
  databaseId: number;
  content: string;
  date: string;
  status?: string | null;
  approved?: boolean | null;
  author?: {
    node?: {
      name?: string | null;
    } | null;
  } | null;
}

interface ReviewEdge {
  rating: number | null;
  node: ReviewNode;
}

interface ProductReviewsProps {
  productId: number;
  initialReviews: ReviewEdge[];
  averageRating: number | null;
  reviewCount: number | null;
}

// Sub-component to render static stars
export function StarStars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const roundedRating = Math.round(rating || 0);
  return (
    <div className={`rating-stars star-${size}`} aria-label={`تقييم ${roundedRating} من 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="star-icon">
          {star <= roundedRating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function ProductReviews({
  productId,
  initialReviews = [],
  averageRating = 0,
  reviewCount = 0,
}: ProductReviewsProps) {
  // Local states for form inputs
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");

  // States for submission results
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Format date to Kuwait Arabic locale (e.g. 22 يونيو 2026)
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-KW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Form validation
    if (rating < 1 || rating > 5) {
      setErrorMessage("يرجى تحديد التقييم من 1 إلى 5 نجوم.");
      return;
    }
    if (!content.trim() || content.trim().length < 5) {
      setErrorMessage("يجب أن يكون نص التقييم 5 أحرف على الأقل.");
      return;
    }
    if (!author.trim()) {
      setErrorMessage("يرجى إدخال اسمك.");
      return;
    }
    if (!authorEmail.trim()) {
      setErrorMessage("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }

    startTransition(async () => {
      const result = await submitProductReview({
        productId,
        rating,
        content,
        author,
        authorEmail,
      });

      if (result.success) {
        if (result.message === "PENDING_MODERATION") {
          setSuccessMessage(
            "شكراً لك! تم إرسال تقييمك بنجاح وهو في انتظار موافقة الإدارة."
          );
          // Clear all form fields upon successful submission
          setContent("");
          setRating(5);
          setAuthor("");
          setAuthorEmail("");
        }
      } else {
        setErrorMessage(result.error || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  if (!productId) {
    console.warn("[ProductReviews] ⚠ productId is missing. Rendering nothing.");
    return null;
  }

  // Defensively ensure initialReviews is an array and filter out null items
  const safeReviews = Array.isArray(initialReviews)
    ? initialReviews.filter((edge) => edge && edge.node)
    : [];

  return (
    <section className="product-reviews-section">
      <h2 className="description-tab-header">تقييمات العملاء ({reviewCount || 0})</h2>

      <div className="reviews-grid">
        {/* Left Column: Review list */}
        <div className="reviews-list-column">
          {/* Summary Card */}
          {reviewCount && reviewCount > 0 ? (
            <div className="reviews-summary-card">
              <div className="summary-rating-wrapper">
                <span className="summary-rating-number">
                  {averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="summary-count-text">من 5 نقاط</span>
              </div>
              <div className="summary-stars-wrapper">
                <StarStars rating={averageRating || 0} size="md" />
                <span className="summary-count-text">
                  بناءً على {reviewCount} تقييم
                </span>
              </div>
            </div>
          ) : null}

          {safeReviews.length === 0 ? (
            <div className="reviews-empty-state">
              <span className="empty-state-icon" aria-hidden="true">✍️</span>
              <p>لا توجد تقييمات لهذا المنتج بعد. كن أول من يضيف تقييماً!</p>
            </div>
          ) : (
            <div className="reviews-list-container">
              {safeReviews.map((edge, index) => {
                if (!edge || !edge.node) return null;
                const { rating: reviewRating, node } = edge;
                const authorName = node.author?.node?.name || "زائر مجهول";
                const reviewContent = node.content || "";
                return (
                  <article key={node.id || index} className="review-card">
                    <div className="review-header">
                      <div className="review-author-info">
                        <span className="review-author-name">{authorName}</span>
                        {node.date && (
                          <time className="review-date" dateTime={node.date}>
                            {formatDate(node.date)}
                          </time>
                        )}
                      </div>
                      <StarStars rating={reviewRating || 0} size="sm" />
                    </div>
                    <div 
                      className="review-body"
                      dangerouslySetInnerHTML={{ __html: reviewContent }}
                    />
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Write a review form */}
        <div className="review-form-column">
          <div className="review-form-card">
            <h3 className="review-form-title">إضافة تقييم</h3>
            
            {successMessage && (
              <div className="review-success-message" role="alert">
                <span className="success-icon" aria-hidden="true">✓</span>
                <div>{successMessage}</div>
              </div>
            )}

            {errorMessage && (
              <div className="review-error-message" role="alert">
                <span className="error-icon" aria-hidden="true">⚠</span>
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="review-form">
              {/* Star Rating Picker */}
              <div className="form-group">
                <span className="form-label">
                  تقييمك بالنجوم <span className="required">*</span>
                </span>
                <div className="star-rating-picker" role="radiogroup" aria-label="اختر التقييم بالنجوم">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const isActive = hoverRating !== null ? star <= hoverRating : star <= rating;
                    return (
                      <button
                        type="button"
                        key={star}
                        className={`star-picker-btn ${isActive ? "active" : ""}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        aria-label={`تقييم ${star} نجوم`}
                        aria-checked={rating === star}
                        role="radio"
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Text */}
              <div className="form-group">
                <label htmlFor="review-content" className="form-label">
                  تفاصيل التقييم <span className="required">*</span>
                </label>
                <textarea
                  id="review-content"
                  className="review-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب تفاصيل تجربتك ورأيك بالمنتج هنا..."
                  required
                />
              </div>

              {/* Name */}
              <div className="form-group">
                <label htmlFor="review-author" className="form-label">
                  الاسم <span className="required">*</span>
                </label>
                <input
                  id="review-author"
                  type="text"
                  className="review-input"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="الاسم الكامل"
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="review-email" className="form-label">
                  البريد الإلكتروني <span className="required">*</span>
                </label>
                <input
                  id="review-email"
                  type="email"
                  className="review-input"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="review-submit-btn"
                disabled={isPending}
              >
                {isPending ? "جاري إرسال التقييم..." : "إرسال التقييم"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
