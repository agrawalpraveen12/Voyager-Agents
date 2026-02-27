'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, MapPin, Plane, Hotel, Calendar, IndianRupee, Sparkles, Phone, PhoneCall, Train, Bus } from 'lucide-react';
import { TripPlanResponse } from '@/types';
import { downloadTripPDF, initiateCall } from '@/services/api';

interface ItineraryDisplayProps {
    trip: TripPlanResponse;
}

export default function ItineraryDisplay({ trip }: ItineraryDisplayProps) {
    const [isCalling, setIsCalling] = React.useState(false);
    const [callStatus, setCallStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

    const handleDownloadPDF = async () => {
        try {
            await downloadTripPDF(trip.trip_id, trip.destination);
        } catch (error) {
            console.error('Failed to download PDF:', error);
            alert('Failed to download PDF. Please try again.');
        }
    };

    const handleInitiateCall = async () => {
        setIsCalling(true);
        setCallStatus('idle');
        try {
            await initiateCall(trip.trip_id);
            setCallStatus('success');
        } catch (error) {
            console.error('Failed to initiate call:', error);
            setCallStatus('error');
        } finally {
            setIsCalling(false);
        }
    };

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Header with Image */}
            {trip.destination_image && (
                <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
                    <img
                        src={trip.destination_image}
                        alt={trip.destination}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <h2 className="text-4xl font-bold text-white p-8">{trip.destination}</h2>
                    </div>
                </div>
            )}

            {/* Trip Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <h3 className="font-semibold text-gray-800">Duration</h3>
                    </div>
                    <p className="text-gray-600">{trip.start_date || 'TBD'} to {trip.end_date || 'TBD'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {trip.start_date && trip.end_date ? (
                            `${Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                        ) : (
                            'Duration TBD'
                        )}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <IndianRupee className="w-6 h-6 text-green-600" />
                        <h3 className="font-semibold text-gray-800">Budget</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-700">₹{trip.budget || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">For {trip.num_travelers || 1} traveler(s)</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                        <h3 className="font-semibold text-gray-800">Interests</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(trip.interests || []).slice(0, 3).map((interest, idx) => (
                            <span key={idx} className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                                {interest}
                            </span>
                        ))}
                        {(!trip.interests || trip.interests.length === 0) && (
                            <span className="text-xs text-gray-500 italic">No specific interests specified</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <button
                    onClick={handleDownloadPDF}
                    className="w-full md:w-auto bg-white text-primary-600 border-2 border-primary-600 font-bold py-3 px-8 rounded-lg shadow hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download PDF
                </button>
            </div>

            {/* Main Itinerary */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                    <ReactMarkdown>{trip.final_itinerary}</ReactMarkdown>
                </div>
            </div>

            {/* Additional Details Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Places */}
                {trip.places_info && trip.places_info.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-6 h-6 text-primary-600" />
                            <h3 className="text-xl font-bold text-gray-800">Top Places</h3>
                        </div>
                        <div className="space-y-4">
                            {trip.places_info.slice(0, 5).map((place, idx) => (
                                <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                                    <h4 className="font-semibold text-gray-800">{place.name}</h4>
                                    {place.rating && <p className="text-sm text-yellow-600">⭐ {place.rating}</p>}
                                    {place.address && <p className="text-sm text-gray-600">{place.address}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Flights */}
                {trip.flight_options && trip.flight_options.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Plane className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-bold text-gray-800">Flight Options</h3>
                        </div>
                        <div className="space-y-4">
                            {trip.flight_options.slice(0, 3).map((flight, idx) => (
                                <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                                    <h4 className="font-semibold text-gray-800">{flight.airline}</h4>
                                    <p className="text-sm text-gray-600">💰 {flight.price}</p>
                                    <p className="text-sm text-gray-600">⏱️ {flight.duration}</p>
                                    <p className="text-sm text-gray-600">🔄 {flight.stops}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trains */}
                {trip.train_options && trip.train_options.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 shadow-sm border border-orange-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Train className="w-6 h-6 text-orange-600" />
                            <h3 className="text-xl font-bold text-gray-800">Train Options</h3>
                        </div>
                        <div className="space-y-4">
                            {trip.train_options.slice(0, 3).map((train, idx) => (
                                <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                                    <h4 className="font-semibold text-gray-800">{train.train_name}</h4>
                                    <p className="text-xs text-orange-700 font-medium">{train.class}</p>
                                    <p className="text-sm text-gray-600">💰 {train.price}</p>
                                    <p className="text-sm text-gray-600">⏱️ {train.duration}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Buses */}
                {trip.bus_options && trip.bus_options.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 shadow-sm border border-red-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Bus className="w-6 h-6 text-red-600" />
                            <h3 className="text-xl font-bold text-gray-800">Bus Options</h3>
                        </div>
                        <div className="space-y-4">
                            {trip.bus_options.slice(0, 3).map((bus, idx) => (
                                <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                                    <h4 className="font-semibold text-gray-800">{bus.operator}</h4>
                                    <p className="text-xs text-red-700 font-medium">{bus.type}</p>
                                    <p className="text-sm text-gray-600">💰 {bus.price}</p>
                                    <p className="text-sm text-gray-600">⏱️ {bus.duration}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hotels */}
                {trip.hotel_options && trip.hotel_options.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Hotel className="w-6 h-6 text-primary-600" />
                            <h3 className="text-xl font-bold text-gray-800">Hotel Options</h3>
                        </div>
                        <div className="space-y-4">
                            {trip.hotel_options.slice(0, 3).map((hotel, idx) => (
                                <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                                    <h4 className="font-semibold text-gray-800">{hotel.name}</h4>
                                    <p className="text-sm text-gray-600">💰 {hotel.price_per_night}/night</p>
                                    <p className="text-sm text-gray-600">⭐ {hotel.rating}</p>
                                    <p className="text-sm text-gray-600">📍 {hotel.location}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Activities */}
                {trip.activities && trip.activities.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                            <h3 className="text-xl font-bold text-gray-800">Recommended Activities</h3>
                        </div>
                        <div className="space-y-4">
                            {trip.activities.slice(0, 4).map((activity, idx) => (
                                <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                                    <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                                    <p className="text-xs text-primary-600 mb-1">{activity.category}</p>
                                    <p className="text-sm text-gray-600">{activity.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
