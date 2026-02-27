'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
    progress?: number;
}

export default function LoadingState({ message = 'Planning your trip...', progress }: LoadingStateProps) {
    const steps = [
        { label: 'Researching destination', value: 20 },
        { label: 'Finding top attractions', value: 40 },
        { label: 'Searching flights & hotels', value: 60 },
        { label: 'Discovering activities', value: 80 },
        { label: 'Creating itinerary', value: 100 },
    ];

    const currentStep = progress
        ? steps.findIndex(step => step.value >= progress)
        : 0;

    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-fade-in">
            {/* Animated Loader */}
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
                <Loader2 className="w-12 h-12 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>

            {/* Message */}
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">{message}</h3>
                <p className="text-gray-600">This may take 30-60 seconds...</p>
            </div>

            {/* Progress Steps */}
            <div className="w-full max-w-md space-y-3">
                {steps.map((step, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${idx <= currentStep
                                ? 'bg-primary-50 border border-primary-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${idx < currentStep
                                    ? 'bg-primary-600 text-white'
                                    : idx === currentStep
                                        ? 'bg-primary-400 text-white animate-pulse'
                                        : 'bg-gray-300 text-gray-600'
                                }`}
                        >
                            {idx + 1}
                        </div>
                        <span
                            className={`text-sm font-medium ${idx <= currentStep ? 'text-primary-800' : 'text-gray-600'
                                }`}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            {progress !== undefined && (
                <div className="w-full max-w-md bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
