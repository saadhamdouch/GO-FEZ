"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGetAllThemesQuery } from "@/services/api/ThemeApi";
import ExploreCard from "./ExploreCard";

interface ThemesProps {
  locale: string;
  isRTL: boolean;
}

export default function Themes({ locale, isRTL }: ThemesProps) {
  const t = useTranslations();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const { data: themesData, isLoading, error } = useGetAllThemesQuery();

  const themes = themesData?.data || [];

  // 🔹 Ref for horizontal scrolling
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🔹 Scroll logic
  const scrollAmount = 400; // adjust as needed
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;

    if (direction === "left") {
      scrollRef.current.scrollTo({
        left: isRTL ? scrollLeft + scrollAmount : scrollLeft - scrollAmount,
        behavior: "smooth",
      });
    } else {
      scrollRef.current.scrollTo({
        left: isRTL ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with title + buttons */}
        <div
          className={`flex items-center justify-between mb-8 md:mb-10 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <h2 className="text-2xl md:text-[40px] font-semibold text-black leading-tight">
            {t("exploreTheme.title")}
          </h2>

          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              onClick={() => handleScroll("left")}
              className="p-2 md:p-4 bg-white border border-[#D9D9D9] rounded-full hover:bg-gray-50 transition"
              aria-label="Previous"
            >
              <ChevronLeft size={24} className={isRTL ? "rotate-180" : ""} />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="p-2 md:p-4 bg-white border border-[#D9D9D9] rounded-full hover:bg-gray-50 transition"
              aria-label="Next"
            >
              <ChevronRight size={24} className={isRTL ? "rotate-180" : ""} />
            </button>
          </div>
        </div>

        {/* Themes list */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="text-gray-500 mt-4">Loading themes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading themes</p>
          </div>
        ) : themes.length > 0 ? (
          <div className="relative">
            <div
              ref={scrollRef}
              className={`flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              {themes
                .filter((t) => t.isActive)
                .map((item) => (
                  <ExploreCard
                    key={item.id}
                    item={item}
                    selected={selectedTheme}
                    onSelect={setSelectedTheme}
                    currentLocale={locale}
                  />
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No themes available</p>
          </div>
        )}
      </div>
    </div>
  );
}
