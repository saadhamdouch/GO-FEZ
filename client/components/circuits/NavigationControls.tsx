// client/components/circuits/NavigationControls.tsx
'use client';

import React from 'react';
import { POI } from '@/lib/types';
import { useTranslations } from 'next-intl';

// Icônes et composants UI
import { Button } from '@/components/ui/button';
import {
	ChevronLeft,
	ChevronRight,
	Check,
	MapPin,
	Loader2,
} from 'lucide-react';

interface NavigationControlsProps {
	locale: string;
	currentPoi: POI;
	currentStep: number;
	totalSteps: number;
	isCompleted: boolean;
	isLoading: boolean; // Pour le chargement de la mutation
	onNext: () => void;
	onPrev: () => void;
	onMarkAsVisited: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
	locale,
	currentPoi,
	currentStep,
	totalSteps,
	isCompleted,
	isLoading,
	onNext,
	onPrev,
	onMarkAsVisited,
}) => {
	const t = useTranslations('CircuitNavigation');
	const name =
		currentPoi[locale as 'fr' | 'en' | 'ar']?.name ||
		currentPoi.frLocalization?.name;
	const address =
		currentPoi[locale as 'fr' | 'en' | 'ar']?.address ||
		currentPoi.frLocalization?.address;

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t-2 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
			<div className="container mx-auto max-w-7xl">
				{/* Info POI */}
				<div className="text-center">
					<p className="text-sm font-semibold text-blue-600">
						{t('step')} {currentStep + 1} / {totalSteps}
					</p>
					<h3 className="truncate text-lg font-bold">{name}</h3>
					<div className="mt-1 flex items-center justify-center gap-1.5">
						<MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
						<p className="truncate text-sm text-gray-600">{address}</p>
					</div>
				</div>

				{/* Boutons d'action */}
				<div className="mt-4 grid grid-cols-3 gap-3">
					<Button
						variant="outline"
						size="lg"
						onClick={onPrev}
						disabled={currentStep === 0}
					>
						<ChevronLeft className="h-5 w-5" />
						<span className="ml-2 hidden sm:inline">{t('prev')}</span>
					</Button>

					<Button
						size="lg"
						onClick={onMarkAsVisited}
						disabled={isCompleted || isLoading}
						className={
							isCompleted
								? 'bg-green-600 hover:bg-green-700'
								: 'bg-blue-600 hover:bg-blue-700'
						}
					>
						{isLoading ? (
							<Loader2 className="h-5 w-5 animate-spin" />
						) : isCompleted ? (
							<Check className="h-5 w-5" />
						) : (
							<Check className="h-5 w-5" />
						)}
						<span className="ml-2">
							{isCompleted ? t('visited') : t('markAsVisited')}
						</span>
					</Button>

					<Button
						variant="outline"
						size="lg"
						onClick={onNext}
						disabled={currentStep === totalSteps - 1}
					>
						<span className="mr-2 hidden sm:inline">{t('next')}</span>
						<ChevronRight className="h-5 w-5" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NavigationControls;