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
        <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-fade-in">
            {/* Animated Loader */}
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-indigo-900 border-t-indigo-500 animate-spin shadow-[0_0_20px_rgba(99,102,241,0.2)]"></div>
                <Loader2 className="w-12 h-12 text-indigo-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>

            {/* Message */}
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">{message}</h3>
                <p className="text-slate-400 text-sm">Specialized agents are gathering data for your trip...</p>
            </div>

            {/* Progress Steps */}
            <div className="w-full max-w-md space-y-3">
                {steps.map((step, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${idx <= currentStep
                                ? 'bg-indigo-500/10 border border-indigo-500/20'
                                : 'bg-slate-900/30 border border-slate-800/50'
                            }`}
                    >
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${idx < currentStep
                                    ? 'bg-indigo-500 text-white'
                                    : idx === currentStep
                                        ? 'bg-indigo-400 text-white animate-pulse ring-4 ring-indigo-500/20'
                                        : 'bg-slate-800 text-slate-500'
                                }`}
                        >
                            {idx + 1}
                        </div>
                        <span
                            className={`text-sm font-medium ${idx <= currentStep ? 'text-indigo-300' : 'text-slate-500'
                                }`}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            {progress !== undefined && (
                <div className="w-full max-w-md bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
