"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGetAllCircuitsQuery } from '@/services/api/CircuitApi';
import ExploreCard from './ExploreCard';

interface CircuitsProps {
  locale: string;
  isRTL: boolean;
}

export default function Circuits({ locale, isRTL }: CircuitsProps) {
  const t = useTranslations();
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null);
  const { data: circuitsData, isLoading: circuitsLoading, error: circuitsError } = useGetAllCircuitsQuery();

  const circuits = circuitsData?.data || [];

  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between mb-8 md:mb-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-2xl md:text-[40px] font-semibold text-black leading-tight">
            {t('exploreCircuit.title')}
          </h2>
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button className="p-2 md:p-4 bg-white border border-[#D9D9D9] rounded-full hover:bg-gray-50 transition" aria-label="Previous">
              <ChevronLeft size={24} className={isRTL ? 'rotate-180' : ''} />
            </button>
            <button className="p-2 md:p-4 bg-white border border-[#D9D9D9] rounded-full hover:bg-gray-50 transition" aria-label="Next">
              <ChevronRight size={24} className={isRTL ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
        {circuitsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="text-gray-500 mt-4">Loading circuits...</p>
          </div>
        ) : circuitsError ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading circuits</p>
          </div>
        ) : circuits.length > 0 ? (
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className={`flex gap-5 min-w-max ${isRTL ? 'flex-row-reverse' : ''}`}>
              {circuits.filter(c => c.isActive).map((item) => (
                <ExploreCard
                  key={item.id}
                  item={item}
                  selected={selectedCircuit}
                  onSelect={setSelectedCircuit}
                  currentLocale={locale}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No circuits available</p>
          </div>
        )}
      </div>
    </div>
  );
}