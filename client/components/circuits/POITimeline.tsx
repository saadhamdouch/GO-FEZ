// client/components/circuits/POITimeline.tsx
'use client';

import React from 'react';
import { POI } from '@/lib/types';
import Link from 'next/link';
import { CheckCircle, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface POITimelineProps {
	pois: POI[];
	locale: string;
	// Optionnel: pour marquer les POIs comme complétés
	completedPoiIds?: string[];
}

const POITimeline: React.FC<POITimelineProps> = ({
	pois = [],
	locale,
	completedPoiIds = [],
}) => {
	const t = useTranslations('CircuitDetailPage');

	// Trier les POIs en fonction de l'attribut 'order' de la table de liaison
	const sortedPois = [...pois].sort(
		(a, b) => (a.CircuitPOI?.order || 0) - (b.CircuitPOI?.order || 0)
	);

	return (
		<div className="relative">
			{/* La ligne verticale de la timeline */}
			<div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200" />

			<div className="space-y-8">
				{sortedPois.map((poi, index) => {
					const isCompleted = completedPoiIds.includes(poi.id);
					const name =
						poi[locale as 'fr' | 'en' | 'ar']?.name || poi.frLocalization?.name;
					const address =
						poi[locale as 'fr' | 'en' | 'ar']?.address ||
						poi.frLocalization?.address;

					return (
						<div key={poi.id} className="relative flex items-center">
							{/* Le point sur la timeline */}
							<div
								className={`z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
									isCompleted
										? 'bg-green-500 text-white'
										: 'bg-white text-blue-600 ring-8 ring-white'
								}`}
							>
								{isCompleted ? (
									<CheckCircle className="h-5 w-5" />
								) : (
									<span className="font-bold">{index + 1}</span>
								)}
							</div>

							{/* Le contenu de l'étape */}
							<div className="ml-6 w-full rounded-lg border bg-white p-4 shadow-sm">
								<Link href={`/${locale}/pois/${poi.id}`} legacyBehavior>
									<a className="font-semibold text-gray-900 hover:text-blue-600">
										{name}
									</a>
								</Link>
								{address && (
									<div className="mt-1 flex items-center gap-1.5">
										<MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
										<p className="text-sm text-gray-600">{address}</p>
									</div>
								)}
								{/* TODO: Ajouter 'estimatedTime' s'il est disponible */}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default POITimeline;