"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="error-container" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      padding: "2rem",
      textAlign: "center",
      background: "var(--color-bg)",
      color: "var(--color-text-primary)"
    }}>
      <h1 style={{
        fontSize: "4rem",
        marginBottom: "1rem",
        color: "var(--color-error, #ef4444)"
      }}>
        500
      </h1>
      <h2 style={{
        fontSize: "2rem",
        marginBottom: "1rem",
        fontWeight: "600"
      }}>
        عذراً، حدث خطأ في الاتصال بالخادم.
      </h2>
      <p style={{
        color: "var(--color-text-muted)",
        marginBottom: "2rem",
        maxWidth: "500px",
        lineHeight: "1.6"
      }}>
        نواجه حالياً مشكلة تقنية في الخادم. يرجى المحاولة لاحقاً أو العودة إلى الصفحة الرئيسية.
      </p>
      
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={() => reset()}
          className="btn btn-primary"
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1.1rem",
            fontWeight: "600",
            borderRadius: "var(--radius-md)",
            border: "none",
            cursor: "pointer",
            background: "var(--color-primary)",
            color: "var(--color-bg)"
          }}
        >
          إعادة المحاولة
        </button>
        <Link 
          href="/"
          className="btn btn-outline"
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1.1rem",
            fontWeight: "600",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            display: "inline-block",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)"
          }}
        >
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
