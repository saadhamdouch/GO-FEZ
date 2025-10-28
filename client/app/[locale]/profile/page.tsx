// client/app/[locale]/profile/page.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useGetGamificationProfileQuery } from '@/services/api/GamificationApi';
import { useGetUserProfileQuery } from '@/services/api/UserApi'; // Assuming this exists based on UserApi.js

// Import Components (based on README and achievements page)
import PointsDisplay from '@/components/gamification/PointsDisplay';
import LevelProgress from '@/components/gamification/LevelProgress';
import BadgeGrid from '@/components/gamification/BadgeGrid';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Using shadcn Avatar
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react'; // Icon for edit button

interface ProfilePageProps {
	// Change params type to Promise
	params: Promise<{
		locale: string;
	}>;
}

export default function ProfilePage({ params}: ProfilePageProps) {
    const resolvedParams = React.use(params);
	const { locale } = resolvedParams;
	const t = useTranslations('GamificationProfile'); // Using GamificationProfile translations for now

	// Fetch Gamification Data
	const {
		data: gamificationData,
		isLoading: isLoadingGamification,
		isError: isGamificationError,
		error: gamificationError,
	} = useGetGamificationProfileQuery();

	// Fetch User Profile Data (Assuming useGetUserProfileQuery exists)
	// You might need to adjust this based on your actual UserApi implementation
	const {
		data: userData,
		isLoading: isLoadingUser,
		isError: isUserError,
		error: userError,
	} = useGetUserProfileQuery(); // Replace with your actual hook if different

	// Handle Loading States
	if (isLoadingGamification || isLoadingUser) {
		return <LoadingState text={t('loading')} />;
	}

	// Handle Error States
	if (isGamificationError || !gamificationData?.data) {
		console.error('Erreur chargement profil gamification:', gamificationError);
		return <ErrorState message={t('error')} onRetry={() => {}} />; // Add retry logic if possible
	}
	if (isUserError || !userData?.user) {
		console.error('Erreur chargement profil utilisateur:', userError);
		return <ErrorState message={'Error loading user profile'} onRetry={() => {}} />; // Add retry logic if possible
	}

	const { points, badges } = gamificationData.data;
	const user = userData.user;

	// Prepare user display info
	const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';
	const userInitials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` || 'U';

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			{/* User Header */}
			<header className="mb-8 flex flex-col items-center gap-4 border-b pb-6 sm:flex-row">
				<Avatar className="h-24 w-24 border-2 border-primary sm:h-32 sm:w-32">
					<AvatarImage src={user.profileImage} alt={userName} />
					<AvatarFallback className="text-3xl sm:text-4xl">
						{userInitials}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 text-center sm:text-left">
					<h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
						{userName}
					</h1>
					{/* Add email or phone if available */}
					{user.email && (
						<p className="mt-1 text-lg text-gray-600">{user.email}</p>
					)}
					{/* Placeholder for Edit Profile Button */}
					<Button variant="outline" size="sm" className="mt-4 gap-2">
						<Pencil className="h-4 w-4" /> Modifier le profil
					</Button>
				</div>
				{/* Quick links */}
				<nav className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-0 sm:flex-col sm:items-end">
					<Link href={`/${locale}/profile/achievements`} passHref legacyBehavior>
						<Button variant="link">{t('myBadges')}</Button>
					</Link>
					<Link href={`/${locale}/profile/leaderboard`} passHref legacyBehavior>
						<Button variant="link">{t('Leaderboard.title')}</Button>
					</Link>
					{/* Add link to history if available */}
					{/* <Link href={`/${locale}/profile/history`} passHref legacyBehavior>
            <Button variant="link">Historique</Button>
          </Link> */}
				</nav>
			</header>

			{/* Gamification Section */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Column 1: Points */}
				<div className="lg:col-span-1">
					<PointsDisplay totalPoints={points?.totalPoints || 0} />
				</div>

				{/* Column 2: Level */}
				<div className="lg:col-span-2">
					<LevelProgress
						level={points?.level || 1}
						totalPoints={points?.totalPoints || 0}
					/>
				</div>
			</div>

			{/* Section Badges */}
			<div className="mt-8">
				<BadgeGrid badges={badges || []} locale={locale} />
			</div>

			{/* Placeholder for Activity History */}
			{/* <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Historique Récent</h2>
        <div className="rounded-lg border bg-white p-6 shadow-sm text-center text-gray-500">
          (ActivityHistoryList.tsx) - Afficher les dernières actions gamifiées.
        </div>
      </section> */}
		</div>
	);
}