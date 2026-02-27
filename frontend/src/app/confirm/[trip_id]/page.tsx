'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, X, AlertTriangle, Plane, Hotel, Calendar, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { getTripStatus, confirmTrip, getConfirmationStatus } from '@/services/api';
import { TripPlanResponse } from '@/types';

export default function ConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const tripId = params.trip_id as string;

    const [trip, setTrip] = useState<TripPlanResponse | null>(null);
    const [status, setStatus] = useState<'loading' | 'pending' | 'confirmed' | 'cancelled' | 'error'>('loading');
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        if (tripId) {
            fetchTripStatus();
        }
    }, [tripId]);

    const fetchTripStatus = async () => {
        try {
            const data = await getTripStatus(tripId);
            setTrip(data);

            // Check actual confirmation status from Redis
            const confStatus = await getConfirmationStatus(tripId);
            if (confStatus.status === 'CONFIRMED') setStatus('confirmed');
            else if (confStatus.status === 'CANCELLED') setStatus('cancelled');
            else setStatus('pending');

        } catch (error) {
            console.error('Error fetching trip status:', error);
            setStatus('error');
            setMessage('Could not find your trip details. It may have expired.');
        }
    };

    const handleAction = async (action: 'confirm' | 'cancel') => {
        setActionLoading(true);
        try {
            const result = await confirmTrip(tripId, action);
            if (result.status === 'CONFIRMED') {
                setStatus('confirmed');
                setMessage('Your trip has been successfully booked!');
            } else if (result.status === 'CANCELLED') {
                setStatus('cancelled');
                setMessage('Your trip has been cancelled. No charges were made.');
            }
        } catch (error) {
            console.error(`Error ${action}ing trip:`, error);
            setMessage(`Failed to ${action} trip. Please try again.`);
        } finally {
            setActionLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                    <p className="text-gray-600 font-medium">Loading your trip details...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-all"
                    >
                        Back to Planner
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Status Header */}
                <div className={`mb-8 p-6 rounded-2xl shadow-sm text-center ${status === 'confirmed' ? 'bg-green-50 border border-green-200' :
                        status === 'cancelled' ? 'bg-red-50 border border-red-200' :
                            'bg-white border border-primary-100'
                    }`}>
                    {status === 'confirmed' ? (
                        <>
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-green-900">Booking Confirmed!</h1>
                            <p className="text-green-700 mt-2">{message}</p>
                        </>
                    ) : status === 'cancelled' ? (
                        <>
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-red-900">Trip Cancelled</h1>
                            <p className="text-red-700 mt-2">{message}</p>
                        </>
                    ) : (
                        <>
                            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                                <Plane className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Ready to Book Your Trip?</h1>
                            <p className="text-gray-600 mt-2 italic">Please review your itinerary below</p>
                        </>
                    )}
                </div>

                {/* Trip Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="relative h-48 bg-primary-900">
                        {trip?.destination_image ? (
                            <img
                                src={trip.destination_image}
                                alt={trip.destination}
                                className="w-full h-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Sparkles className="w-12 h-12 text-primary-200 opacity-20" />
                            </div>
                        )}
                        <div className="absolute bottom-6 left-8 text-white">
                            <h2 className="text-3xl font-bold">{trip?.destination}</h2>
                            <div className="flex items-center gap-4 mt-2 text-primary-100">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> {trip?.start_date} - {trip?.end_date}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Hotel className="w-5 h-5 text-primary-600" /> Accommodation
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="font-medium text-gray-800">{trip?.hotel_options[0]?.name || 'Luxury Stay'}</p>
                                    <p className="text-sm text-gray-600 mt-1">{trip?.hotel_options[0]?.location || 'Central Location'}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Plane className="w-5 h-5 text-primary-600" /> Flight Options
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="font-medium text-gray-800">{trip?.flight_options[0]?.airline || 'Top Carrier'}</p>
                                    <p className="text-sm text-gray-600 mt-1">{trip?.flight_options[0]?.price || 'Starting at $XXX'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {status === 'pending' && (
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleAction('confirm')}
                                    disabled={actionLoading}
                                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" /> : <Check />}
                                    Confirm and Book Now
                                </button>
                                <button
                                    onClick={() => handleAction('cancel')}
                                    disabled={actionLoading}
                                    className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <X /> Cancel Trip
                                </button>
                            </div>
                        )}

                        {(status === 'confirmed' || status === 'cancelled') && (
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                Plan Another Trip
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
