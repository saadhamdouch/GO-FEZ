"use client"

import React, { useState } from 'react';
import { MapPin, Clock, Star, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ExploreCardProps } from '@/lib/types';

export default function ExploreCard({ item, selected, onSelect, currentLocale }: ExploreCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations();
  const isSelected = selected === item.id;

  // Extract title based on locale
  let title = '';
  try {
    if (item[currentLocale]) {
      const localization = typeof item[currentLocale] === 'string' ? JSON.parse(item[currentLocale]) : item[currentLocale];
      title = localization.name || localization.title || '';
    }
  } catch (e) {
    title = 'Untitled';
  }

  // Calculate stops (POIs)
  const stops = item.pois?.length || 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(item.id)}
      className={`relative rounded-none overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 ${
        isHovered || isSelected ? 'w-80 md:w-[474px]' : 'w-64 md:w-[291px]'
      } h-80 md:h-[388px] group shadow-xl`}
    >
      <div className="absolute inset-0">
        <img 
          src={item.image || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800'} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,33,59,0.5)] via-[rgba(0,33,59,0)] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white">
        <h3 className="text-lg md:text-2xl font-bold mb-2 tracking-tight">{title}</h3>
        {(isHovered || isSelected) && (
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="flex items-center gap-1">
              <MapPin size={16} />
              {stops} {t('card.stops')}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {item.duration ? `${item.duration}h` : '2-3h'}
            </span>
            <span className="flex items-center gap-1">
              <Star size={16} fill="currentColor" />
              {item.rating || 4.7}
            </span>
          </div>
        )}
      </div>
      <div className="absolute top-4 md:top-7 right-4 md:right-7 bg-white rounded-full px-3 md:px-4 py-1 md:py-1.5 text-black text-xs md:text-base font-medium flex items-center gap-2">
        <span>{t('card.viewRoutes')}</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
}