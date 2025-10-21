'use client';

import React from 'react';

export default function GoFezLogo() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8 flex flex-col items-center">
      {/* Frame Label */}
      <div className="w-full max-w-xs mb-4">
        <p className="text-zinc-500 text-sm"></p>
      </div>

      {/* Top Image Section */}
      <div className="w-full max-w-xs mb-8">
        <div className="w-full h-32 bg-gradient-to-b from-blue-800 to-blue-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Placeholder for top image */}
          <img src="" alt="Top Image" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 opacity-30">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 relative">
          {/* Placeholder for logo image */}
          <img src="" alt="Logo" className="w-full h-full object-contain rounded-full" />
          <span className="text-zinc-900 font-bold text-2xl absolute">G</span>
        </div>
        <h1 className="text-2xl font-bold tracking-wide">GO FEZ</h1>
      </div>

      {/* Media Controls Section */}
      <div className="flex items-center gap-4 mb-8">
        {/* Thumbnail */}
        <div className="w-16 h-16 bg-gradient-to-br from-amber-800 to-amber-950 rounded overflow-hidden flex items-center justify-center relative">
          {/* Placeholder for thumbnail image */}
          <img src="" alt="Thumbnail" className="w-full h-full object-cover absolute inset-0" />
          <div className="w-12 h-12 bg-amber-700 rounded"></div>
        </div>

        {/* Play Controls */}
        <div className="flex gap-3">
          <button className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M6 6h4v12H6V6zm8 0h4v12h-4V6z" />
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pattern Section */}
      <div className="flex gap-4">
        {/* Dark Pattern */}
        <div className="w-24 h-24 bg-zinc-800 rounded flex items-center justify-center relative overflow-hidden">
          {/* Placeholder for dark pattern image */}
          <img src="" alt="Dark Pattern" className="absolute inset-0 w-full h-full object-cover" />
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-zinc-700 rounded-full"
              style={{
                left: `${(i % 4) * 25 + 10}%`,
                top: `${Math.floor(i / 4) * 25 + 10}%`,
              }}
            />
          ))}
        </div>

        {/* Blue Pattern */}
        <div className="w-24 h-24 bg-blue-900 rounded flex items-center justify-center relative overflow-hidden">
          {/* Placeholder for blue pattern image */}
          <img src="" alt="Blue Pattern" className="absolute inset-0 w-full h-full object-cover" />
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-blue-700 rounded-full"
              style={{
                left: `${(i % 4) * 25 + 10}%`,
                top: `${Math.floor(i / 4) * 25 + 10}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
