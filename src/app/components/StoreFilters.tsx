'use client';

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface TermNode {
  id: string;
  name: string;
  slug: string;
}

interface StoreFiltersProps {
  availableNicotine: TermNode[];
  availableFlavors: TermNode[];
}

export default function StoreFilters({ availableNicotine, availableFlavors }: StoreFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // State for mobile drawer visibility
  const [isOpen, setIsOpen] = useState(false);

  // Parse current active states from URL
  const activeSort = searchParams?.get("sort") || "latest";
  const activeNicotine = searchParams?.get("nicotine")?.split(",").filter(Boolean) || [];
  const activeFlavor = searchParams?.get("flavor")?.split(",").filter(Boolean) || [];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const currentParams = searchParams ? searchParams.toString() : "";
    const params = new URLSearchParams(currentParams);

    // Pagination Reset: remove pagination parameters so the user starts at page 1
    params.delete("cursor");
    params.delete("page");
    params.delete("before");
    params.delete("after");

    if (val && val !== "latest") {
      params.set("sort", val);
    } else {
      params.delete("sort");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(nextUrl, { scroll: false });
  };

  const handleCheckboxChange = (attrName: string, slug: string, checked: boolean) => {
    const currentParams = searchParams ? searchParams.toString() : "";
    const params = new URLSearchParams(currentParams);

    // Pagination Reset: remove pagination parameters
    params.delete("cursor");
    params.delete("page");
    params.delete("before");
    params.delete("after");

    const queryKey = (attrName === "pa_nic" || attrName === "pa_nicotine") ? "nicotine" : "flavor";
    const currentList = queryKey === "nicotine" ? [...activeNicotine] : [...activeFlavor];

    let newList;
    if (checked) {
      newList = [...currentList, slug];
    } else {
      newList = currentList.filter(s => s !== slug);
    }

    if (newList.length > 0) {
      params.set(queryKey, newList.join(","));
    } else {
      params.delete(queryKey);
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(nextUrl, { scroll: false });
  };

  const handleClearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="mobile-filter-toggle-container">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mobile-filter-toggle-btn"
        >
          ⚙️ تصفية وترتيب المنتجات
        </button>
      </div>

      {/* Desktop Sidebar & Mobile Drawer Wrapper */}
      <aside className={`store-filters-aside ${isOpen ? "open" : ""}`}>
        <div className="store-filters-header">
          <h3>تصفية المنتجات</h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mobile-close-filters-btn"
            aria-label="إغلاق التصفية"
          >
            ✕
          </button>
        </div>

        {/* Sorting Group */}
        <div className="filter-group">
          <label htmlFor="sort-select" className="filter-group-title">ترتيب حسب</label>
          <select
            id="sort-select"
            value={activeSort}
            onChange={handleSortChange}
            className="sort-select-input"
          >
            <option value="latest">الأحدث</option>
            <option value="price_asc">السعر: من الأقل للأعلى</option>
            <option value="price_desc">السعر: من الأعلى للأقل</option>
          </select>
        </div>

        {/* Nicotine Filter Group */}
        {availableNicotine && availableNicotine.length > 0 ? (
          <div className="filter-group">
            <span className="filter-group-title">قوة النيكوتين</span>
            <div className="filter-checkbox-list">
              {availableNicotine.map((term) => {
                const isChecked = activeNicotine.includes(term.slug);
                return (
                  <label key={term.id} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleCheckboxChange("pa_nic", term.slug, e.target.checked)}
                    />
                    <span>{term.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Flavor Filter Group */}
        {availableFlavors && availableFlavors.length > 0 ? (
          <div className="filter-group">
            <span className="filter-group-title">النكهة</span>
            <div className="filter-checkbox-list">
              {availableFlavors.map((term) => {
                const isChecked = activeFlavor.includes(term.slug);
                return (
                  <label key={term.id} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleCheckboxChange("pa_flavours", term.slug, e.target.checked)}
                    />
                    <span>{term.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleClearFilters}
          className="clear-filters-btn"
        >
          مسح الفلاتر
        </button>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="mobile-filters-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
