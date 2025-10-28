"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { MapPin, Clock, Sprout, AlertTriangle } from "lucide-react";
import { useGetOneThemeQuery } from "@/services/api/ThemeApi";
import { useGetAllCircuitsQuery } from "@/services/api/CircuitApi";
import { Link, useRouter } from "@/i18n/navigation";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { getLocalizedField } from "@/lib/utils";
import { POI, Circuit } from "@/lib/types"; // Make sure this path is correct

// A new, attractive POI card for this page
const POIGridCard = ({
  poi,
  locale,
}: {
  poi: POI;
  locale: "en" | "fr" | "ar";
}) => {
  const t = useTranslations("POICard");
  const dir = locale === "ar" ? "rtl" : "ltr";

  const name = getLocalizedField(poi, "name", locale);
  const description = getLocalizedField(poi, "description", locale);
  const primaryImage =
    poi.files?.find((f) => f.type === "image")?.fileUrl ||
    "https/via.placeholder.com/400x300";

  return (
    <Link
      href={`/pois/${poi.id}`}
      className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
    >
      <div className="relative">
        <Image
          src={primaryImage}
          alt={name || "POI Image"}
          width={400}
          height={300}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {poi.isPremium && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {t("premium")}
            </span>
          )}
          {poi.categoryPOI && (
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {getLocalizedField(poi.categoryPOI, "name", locale)}
            </span>
          )}
        </div>
      </div>
      <div className="p-4" dir={dir}>
        <h3 className="text-lg font-bold text-gray-900 truncate" title={name}>
          {name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
          {description}
        </p>
      </div>
    </Link>
  );
};

// Main Page Component
export default function ThemeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale() as "en" | "fr" | "ar";
  const router = useRouter();
  const t = useTranslations("ThemePage");
  const dir = locale === "ar" ? "rtl" : "ltr";

  const {
    data: themeData,
    isLoading: isLoadingTheme,
    error: themeError,
  } = useGetOneThemeQuery(id);
  const {
    data: circuitsData,
    isLoading: isLoadingCircuits,
    error: circuitsError,
  } = useGetAllCircuitsQuery();

  const theme = themeData?.data;

  // Filter circuits that belong to this theme
  const relevantCircuits = useMemo(() => {
    if (!circuitsData?.data || !id) return [];
    return circuitsData.data.filter(
      (circuit) =>
        circuit.isActive && circuit.themes?.some((t) => t.id === id)
    );
  }, [circuitsData, id]);

  // Loading state
  if (isLoadingTheme || isLoadingCircuits) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  // Error state
  if (themeError || circuitsError || !theme) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          {t("errorTitle")}
        </h1>
        <p className="mt-2 text-gray-600">{t("errorMessage")}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
        >
          {t("goBack")}
        </button>
      </div>
    );
  }

  const themeName = getLocalizedField(theme, "name", locale);
  const themeDescription = getLocalizedField(theme, "description", locale);
  const themeImage = theme.imageUrl || "https/via.placeholder.com/1600x600";

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <Header
        locale={locale}
        isRTL={dir === "rtl"}
        onLanguageChange={(newLocale) =>
          router.replace(`/themes/${id}`, { locale: newLocale })
        }
      />

      {/* 1. Theme Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <Image
          src={themeImage}
          alt={themeName || "Theme"}
          layout="fill"
          objectFit="cover"
          className="brightness-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <span className="text-lg font-semibold bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm">
            {t("themeTitle")}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-4 shadow-text">
            {themeName}
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-3xl shadow-text">
            {themeDescription}
          </p>
        </div>
      </div>

      {/* 2. Main Content - POIs grouped by Circuit */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {relevantCircuits.length > 0 ? (
          <div className="space-y-16">
            {relevantCircuits.map((circuit) => (
              <section key={circuit.id}>
                {/* Circuit Header */}
                <div
                  className={`border-b-2 border-emerald-600 pb-4 mb-8 ${
                    dir === "rtl" ? "text-right" : "text-left"
                  }`}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {getLocalizedField(circuit, "name", locale)}
                  </h2>
                  <p className="text-gray-600 mt-2 text-lg">
                    {getLocalizedField(circuit, "description", locale)}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-700 mt-4">
                    <span className="flex items-center gap-2">
                      <Clock size={18} className="text-emerald-600" />
                      {t("duration", { minutes: circuit.durationMinutes })}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={18} className="text-emerald-600" />
                      {t("pois", { count: circuit.pois?.length || 0 })}
                    </span>
                    <span className="flex items-center gap-2">
                      <Sprout size={18} className="text-emerald-600" />
                      {t("difficulty", {
                        value: getLocalizedField(
                          circuit,
                          "difficulty",
                          locale
                        ),
                      })}
                    </span>
                  </div>
                  <Link
                    href={`/circuits/${circuit.id}`}
                    className="inline-block mt-4 text-emerald-600 font-semibold hover:text-emerald-800 transition"
                  >
                    {t("viewCircuitDetails")} &rarr;
                  </Link>
                </div>

                {/* POI Grid for this Circuit */}
                {circuit.pois && circuit.pois.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {circuit.pois.map((poi) => (
                      <POIGridCard key={poi.id} poi={poi} locale={locale} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">
                      {t("noPoisForCircuit")}
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t("noCircuitsTitle")}
            </h2>
            <p className="mt-2 text-gray-600">{t("noCircuitsMessage")}</p>
          </div>
        )}
      </main>

      <Footer
        locale={locale}
        isRTL={dir === "rtl"}
        onLanguageChange={(newLocale) =>
          router.replace(`/themes/${id}`, { locale: newLocale })
        }
      />
    </div>
  );
}