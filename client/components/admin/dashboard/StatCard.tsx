// client/components/admin/dashboard/StatCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Using shadcn Card

interface StatCardProps {
	title: string;
	value: number | string;
	icon: React.ReactNode;
	description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<div className="h-4 w-4 text-muted-foreground">{icon}</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{description && (
					<p className="text-xs text-muted-foreground">{description}</p>
				)}
			</CardContent>
		</Card>
	);
};

export default StatCard;