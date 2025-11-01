"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useGetReviewsForPOIQuery } from "@/services/api/ReviewApi";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewListProps {
  poiId: string;
}

const ReviewList = ({ poiId }: ReviewListProps) => {
  const t = useTranslations("ReviewList");
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading, isError } = useGetReviewsForPOIQuery({
    poiId,
    page,
    limit,
  });

  if (isLoading) {
    return <div className="text-center py-8">{t("loading")}</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">{t("error") || "Erreur lors du chargement des avis"}</div>;
  }

  const reviews = data?.data?.reviews || [];
  const totalPages = data?.data?.totalPages || 1;

  if (reviews.length === 0) {
    return <div className="text-gray-500 text-center py-8">{t("noReviews")}</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold border-b pb-2">{t("title")}</h3>
      {reviews.map((review) => (
        <article key={review.id} className="p-4 border rounded-lg shadow-sm bg-white">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-800">
              {review.user?.firstName && review.user?.lastName 
                ? `${review.user.firstName} ${review.user.lastName}`
                : review.user?.email 
                ? review.user.email.split('@')[0]
                : 'Utilisateur anonyme'}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(review.created_at || review.createdAt).toLocaleDateString()}
            </span>
          </div>
          {/* A simple star rating display */}
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < review.rating ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.445a1 1 0 00-.364 1.118l1.287 3.965c.3.921-.755 1.688-1.54 1.118l-3.368-2.445a1 1 0 00-1.175 0l-3.368 2.445c-.784.57-1.838-.197-1.54-1.118l1.287-3.965a1 1 0 00-.364-1.118L2.05 9.392c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.965z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </article>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            {t("previous") || "Précédent"}
          </Button>
          <span className="text-sm text-gray-600">
            {t("page") || "Page"} {page} / {totalPages}
          </span>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
          >
            {t("next") || "Suivant"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;