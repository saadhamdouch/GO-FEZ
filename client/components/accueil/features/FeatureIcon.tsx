"use client";
import React from 'react';

interface FeatureIconProps {
    icon: string;
    color: string;
}

export default function FeatureIcon({ icon }: FeatureIconProps) {
    const iconMap: Record<string, JSX.Element> = {
        route: (
            <img 
                src="/images/InteractiveRoutes.png" 
                alt="Interactive Routes" 
                // Using w-10/h-10 to make the icon size more prominent, similar to the image
                className="w-10 h-10 md:w-12 md:h-12 object-contain" 
            />
        ),
        audio: (
            <img 
                src="/images/Audio&360° Guides.png" 
                alt="Audio & 360° Guides" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain" 
            />
        ),
        key: (
            <img 
                src="/images/Play&Earn Rewards.png" 
                alt="Play & Earn Rewards" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain" 
            />
        ),
        offline: (
            <img 
                src="/images/Offline Access.png" 
                alt="Offline Access" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain" 
            />
        ),
    };

    // REMOVED: all styling from the wrapper div (w-12 h-16..., border-4..., shadow-lg)
    return (
        <div className="flex items-center justify-center">
            {iconMap[icon]}
        </div>
    );
}