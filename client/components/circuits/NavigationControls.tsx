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
	Navigation2,
} from 'lucide-react';

interface NavigationControlsProps {
	locale: string;
	currentPoi: POI;
	currentStep: number;
	totalSteps: number;
	isCompleted: boolean;
	isLoading: boolean;
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
		(currentPoi[locale as 'fr' | 'en' | 'ar'] as any)?.name || 
		currentPoi.frLocalization?.name ||
		'POI sans nom';
	
	const address =
		(currentPoi[locale as 'fr' | 'en' | 'ar'] as any)?.address ||
		currentPoi.frLocalization?.address;
	
	// Calculer le pourcentage de progression
	const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-white via-white/95 to-transparent pb-safe">
			<div className="container mx-auto max-w-7xl px-4 pb-4">
				{/* Barre de progression futuriste avec gradient animé */}
				<div className="mb-4 overflow-hidden rounded-full bg-gradient-to-r from-gray-100 to-gray-200 p-1 shadow-inner">
					<div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
						<div 
							className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out relative"
							style={{ width: `${progressPercentage}%` }}
						>
							{/* Effet de brillance animé */}
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
						</div>
					</div>
					{/* Indicateur de progression en texte */}
					<div className="mt-1 text-center">
						<span className="text-xs font-semibold text-gray-600">
							{currentStep + 1} / {totalSteps} étapes ({Math.round(progressPercentage)}%)
						</span>
					</div>
				</div>

				{/* Carte d'information POI avec design moderne */}
				<div className="rounded-2xl bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl border border-gray-100/50">
					{/* Badge d'étape et statut */}
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg ring-4 ring-blue-100">
								{currentStep + 1}
							</div>
							<div className="flex flex-col">
								<span className="text-xs font-medium text-gray-500">
									Étape actuelle
								</span>
								<span className="text-sm font-bold text-gray-900">
									{currentStep + 1} sur {totalSteps}
								</span>
							</div>
						</div>
						{isCompleted && (
							<div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 text-sm font-bold text-green-700 shadow-sm ring-1 ring-green-200">
								<Check className="h-4 w-4" />
								<span>Visité ✓</span>
							</div>
						)}
					</div>

					{/* Titre et adresse avec icône */}
					<div className="mb-5">
						<div className="flex items-start gap-2 mb-2">
							<Navigation2 className="h-5 w-5 flex-shrink-0 mt-1 text-purple-500" />
							<h3 className="text-xl font-bold text-gray-900 leading-tight flex-1">
								{name}
							</h3>
						</div>
						{address && (
							<div className="flex items-start gap-2 text-sm text-gray-600 ml-7">
								<MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-500" />
								<p className="line-clamp-2">{address}</p>
							</div>
						)}
					</div>

					{/* Boutons d'action avec design amélioré */}
					<div className="grid grid-cols-7 gap-3">
						{/* Bouton Précédent */}
						<Button
							variant="outline"
							size="lg"
							onClick={onPrev}
							disabled={currentStep === 0}
							className="col-span-2 rounded-xl border-2 border-gray-300 font-semibold transition-all hover:scale-105 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent"
						>
							<ChevronLeft className="h-5 w-5" />
							<span className="ml-1 hidden sm:inline">{t('prev') || 'Préc.'}</span>
						</Button>

						{/* Bouton principal - Marquer comme visité */}
						<Button
							size="lg"
							onClick={onMarkAsVisited}
							disabled={isCompleted || isLoading}
							className={`col-span-3 rounded-xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 ${
								isCompleted
									? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/50'
									: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-purple-500/50'
							}`}
						>
							{isLoading ? (
								<>
									<Loader2 className="h-5 w-5 animate-spin" />
									<span className="ml-2">Chargement...</span>
								</>
							) : (
								<>
									<Check className="h-5 w-5" />
									<span className="ml-2">
										{isCompleted ? (t('visited') || 'Visité') : (t('markAsVisited') || 'Marquer visité')}
									</span>
								</>
							)}
						</Button>

						{/* Bouton Suivant */}
						<Button
							variant="outline"
							size="lg"
							onClick={onNext}
							disabled={currentStep === totalSteps - 1}
							className="col-span-2 rounded-xl border-2 border-gray-300 font-semibold transition-all hover:scale-105 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent"
						>
							<span className="mr-1 hidden sm:inline">{t('next') || 'Suiv.'}</span>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>
			
			{/* CSS pour l'animation de brillance */}
			<style jsx>{`
				@keyframes shimmer {
					0% {
						transform: translateX(-100%);
					}
					100% {
						transform: translateX(100%);
					}
				}
				.animate-shimmer {
					animation: shimmer 2s infinite;
				}
			`}</style>
		</div>
	);
};

export default NavigationControls;