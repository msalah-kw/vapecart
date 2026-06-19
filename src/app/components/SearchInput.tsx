'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read initial query value from URL (?q=)
  const initialQuery = searchParams?.get("q") || "";
  const [value, setValue] = useState(initialQuery);

  // Sync state if URL query changes externally
  useEffect(() => {
    setValue(searchParams?.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const currentParams = searchParams ? searchParams.toString() : "";
      const params = new URLSearchParams(currentParams);
      const trimmedVal = value.trim();

      if (trimmedVal) {
        params.set("q", trimmedVal);
      } else {
        params.delete("q");
      }

      const queryStr = params.toString();
      const nextUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      
      // Update router without hard page reload
      router.push(nextUrl, { scroll: false });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="search-bar-wrapper">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ابحث عن نكهات، سحبات، كويلات..."
        className="search-bar-input"
        aria-label="حقل البحث"
        autoFocus
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            const currentParams = searchParams ? searchParams.toString() : "";
            const params = new URLSearchParams(currentParams);
            params.delete("q");
            const queryStr = params.toString();
            const nextUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
            router.push(nextUrl, { scroll: false });
          }}
          className="search-bar-clear-btn"
          aria-label="مسح البحث"
        >
          ✕
        </button>
      )}
      <span className="search-bar-icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </span>
    </div>
  );
}
