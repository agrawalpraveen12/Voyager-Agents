'use client';

import React, { useState } from 'react';
import { Plane, Sparkles, Globe } from 'lucide-react';
import TripForm from '@/components/TripForm';
import ItineraryDisplay from '@/components/ItineraryDisplay';
import LoadingState from '@/components/LoadingState';
import { TripFormData, TripPlanResponse } from '@/types';
import { createTripPlan } from '@/services/api';

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [trip, setTrip] = useState<TripPlanResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePlanTrip = async (formData: TripFormData) => {
        setIsLoading(true);
        setError(null);
        setTrip(null);

        try {
            const result = await createTripPlan(formData);
            setTrip(result);
        } catch (err: any) {
            console.error('Error planning trip:', err);
            setError(
                err.response?.data?.detail ||
                err.message ||
                'Failed to plan trip. Please ensure the backend is running and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlanAnother = () => {
        setTrip(null);
        setError(null);
    };

    return (
        <main className="min-h-screen text-slate-100">
            {/* Header */}
            <header className="bg-slate-950/50 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                                <Plane className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                    Voyager Agents
                                </h1>
                                <p className="text-xs text-slate-400">AI-Powered Travel Intelligence</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-2 text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                                <Globe className="w-3 h-3 text-indigo-400" />
                                <span>Multi-Agent System</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                {!trip && !isLoading && (
                    <>
                        {/* Hero Section */}
                        <div className="text-center mb-12 space-y-6 animate-fade-in">
                            <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
                                Where to <span className="text-indigo-500">Next?</span>
                            </h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                                Let our specialized AI agents orchestrate your perfect journey. Researching flights, hotels, and unique experiences in seconds.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800 text-slate-300">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-medium">Smart Planning</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800 text-slate-300">
                                    <Globe className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm font-medium">Global Reach</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800 text-slate-300">
                                    <Plane className="w-4 h-4 text-violet-400" />
                                    <span className="text-sm font-medium">Instant Itineraries</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="max-w-4xl mx-auto">
                            <TripForm onSubmit={handlePlanTrip} isLoading={isLoading} />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="max-w-4xl mx-auto mt-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 animate-slide-up backdrop-blur-sm">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-rose-500/20 rounded-lg">
                                        <Globe className="w-6 h-6 text-rose-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-rose-400 font-bold mb-1">Planning Encountered a Hiccup</h3>
                                        <p className="text-rose-300/80">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Loading State */}
                {isLoading && !trip && (
                    <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl p-12">
                        <LoadingState message="Agents are collaborating on your itinerary..." progress={undefined} />
                    </div>
                )}

                {/* Trip Results */}
                {trip && !isLoading && (
                    <div className="max-w-6xl mx-auto space-y-10">
                        {/* Success Header */}
                        <div className="text-center space-y-4 animate-fade-in">
                            <div className="inline-block p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 mb-2">
                                <Sparkles className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h2 className="text-4xl font-bold text-white tracking-tight">
                                Your Adventure Awaits!
                            </h2>
                            <p className="text-slate-400 text-lg">
                                Expertly crafted itinerary for your {Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))}-day 
                                getaway to <span className="text-indigo-400 font-semibold">{trip.destination}</span>
                            </p>
                        </div>

                        {/* Itinerary */}
                        <ItineraryDisplay trip={trip} />

                        {/* Plan Another Button */}
                        <div className="text-center pt-8">
                            <button
                                onClick={handlePlanAnother}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-4 px-10 rounded-2xl border border-slate-700 shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Start New Planning
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-slate-950/80 border-t border-slate-900 mt-20 py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-8 h-px bg-slate-800"></div>
                        <Plane className="w-5 h-5 text-indigo-500/50" />
                        <div className="w-8 h-px bg-slate-800"></div>
                    </div>
                    <p className="text-slate-400 font-medium">
                        Voyager Agents Intelligence Platform
                    </p>
                    <p className="text-slate-600 text-sm mt-3 flex items-center justify-center gap-4">
                        <span>LangGraph Orchestration</span>
                        <span>•</span>
                        <span>Multi-Model AI</span>
                        <span>•</span>
                        <span>Real-time Travel Data</span>
                    </p>
                </div>
            </footer>
        </main>
    );
}
