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
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-600 rounded-lg">
                                <Plane className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                                    AI Trip Planner
                                </h1>
                                <p className="text-sm text-gray-600">Plan your perfect journey with AI</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="w-4 h-4" />
                            <span>Powered by Multi-Agent AI</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                {!trip && !isLoading && (
                    <>
                        {/* Hero Section */}
                        <div className="text-center mb-12 space-y-4 animate-fade-in">
                            <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                                Where would you like to go?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Let our AI agents research, plan, and create your perfect itinerary with
                                flights, hotels, activities, and more!
                            </p>
                            <div className="flex items-center justify-center gap-6 pt-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Sparkles className="w-5 h-5 text-yellow-500" />
                                    <span className="text-sm">Smart Recommendations</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Globe className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm">Real-time Search</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Plane className="w-5 h-5 text-purple-500" />
                                    <span className="text-sm">Complete Itineraries</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                            <TripForm onSubmit={handlePlanTrip} isLoading={isLoading} />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="max-w-4xl mx-auto mt-6 bg-red-50 border border-red-200 rounded-lg p-6 animate-slide-up">
                                <h3 className="text-red-800 font-semibold mb-2">Error Planning Trip</h3>
                                <p className="text-red-600">{error}</p>
                                <p className="text-sm text-red-500 mt-2">
                                    Make sure the backend server is running on port 8000.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Loading State */}
                {isLoading && !trip && (
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-12">
                        <LoadingState message="Planning your amazing trip..." progress={undefined} />
                    </div>
                )}

                {/* Trip Results */}
                {trip && !isLoading && (
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Success Header */}
                        <div className="text-center space-y-4 animate-fade-in">
                            <div className="inline-block p-3 bg-green-100 rounded-full">
                                <Sparkles className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900">
                                Your Trip is Ready!
                            </h2>
                            <p className="text-gray-600">
                                We've planned an amazing {Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))}-day
                                adventure to {trip.destination}
                            </p>
                        </div>

                        {/* Itinerary */}
                        <ItineraryDisplay trip={trip} />

                        {/* Plan Another Button */}
                        <div className="text-center pt-8">
                            <button
                                onClick={handlePlanAnother}
                                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                            >
                                Plan Another Trip
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white mt-20 py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        🤖 Powered by LangGraph Multi-Agent System | Built with FastAPI & Next.js
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Uses: Gemini LLM • Tavily Search • Wikipedia
                    </p>
                </div>
            </footer>
        </main>
    );
}
