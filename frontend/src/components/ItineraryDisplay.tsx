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
            {trip.destination_image ? (
                <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50">
                    <img
                        src={trip.destination_image}
                        alt={trip.destination}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent flex items-end">
                        <div className="p-8 w-full flex justify-between items-end">
                            <div>
                                <p className="text-indigo-400 font-medium mb-1">Your journey to</p>
                                <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{trip.destination}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative h-48 rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 to-slate-900 flex items-center justify-center border border-slate-700">
                    <h2 className="text-4xl font-bold text-white p-8">{trip.destination}</h2>
                </div>
            )}

            {/* Trip Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-6 h-6 text-blue-400" />
                        <h3 className="font-semibold text-slate-200">Duration</h3>
                    </div>
                    <p className="text-slate-400 font-medium">{trip.start_date || 'TBD'} to {trip.end_date || 'TBD'}</p>
                    <p className="text-sm text-blue-400/80 mt-1">
                        {trip.start_date && trip.end_date ? (
                            `${Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                        ) : (
                            'Duration TBD'
                        )}
                    </p>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                    <div className="flex items-center gap-3 mb-2">
                        <IndianRupee className="w-6 h-6 text-emerald-400" />
                        <h3 className="font-semibold text-slate-200">Budget</h3>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">₹{trip.budget || 0}</p>
                    <p className="text-sm text-slate-500 mt-1">For {trip.num_travelers || 1} traveler(s)</p>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-purple-500/20 shadow-lg shadow-purple-500/5">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        <h3 className="font-semibold text-slate-200">Interests</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(trip.interests || []).slice(0, 3).map((interest, idx) => (
                            <span key={idx} className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full">
                                {interest}
                            </span>
                        ))}
                        {(!trip.interests || trip.interests.length === 0) && (
                            <span className="text-xs text-slate-500 italic">No specific interests</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <button
                    onClick={handleDownloadPDF}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 border border-indigo-400/30"
                >
                    <Download className="w-5 h-5" />
                    Download PDF
                </button>
            </div>

            {/* Main Itinerary */}
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl p-8 md:p-12">
                <div className="prose prose-invert prose-lg max-w-none prose-headings:text-indigo-400 prose-strong:text-white prose-p:text-slate-300 prose-li:text-slate-300">
                    <ReactMarkdown>{trip.final_itinerary}</ReactMarkdown>
                </div>
            </div>

            {/* Additional Details Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Places */}
                {trip.places_info && trip.places_info.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <MapPin className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Must-Visit Attractions</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {trip.places_info.slice(0, 6).map((place, idx) => (
                                <div key={idx} className="group bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-500/5">
                                    <div className="relative h-40 w-full bg-slate-800 overflow-hidden">
                                        {place.image_url ? (
                                            <img 
                                                src={place.image_url} 
                                                alt={place.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                                <MapPin className="w-8 h-8 text-slate-700" />
                                            </div>
                                        )}
                                        {place.rating && (
                                            <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-amber-400 border border-amber-500/20">
                                                ⭐ {place.rating}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{place.name}</h4>
                                        {place.address && <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">{place.address}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Activities */}
                {trip.activities && trip.activities.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Curated Experiences</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {trip.activities.slice(0, 6).map((activity, idx) => (
                                <div key={idx} className="group bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/5">
                                    <div className="relative h-40 w-full bg-slate-800 overflow-hidden">
                                        {activity.image_url ? (
                                            <img 
                                                src={activity.image_url} 
                                                alt={activity.title} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                                <Sparkles className="w-8 h-8 text-slate-700" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-purple-500/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                                            {activity.category}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-slate-100 group-hover:text-purple-400 transition-colors line-clamp-1">{activity.title}</h4>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{activity.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Travel & Stay */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Flights */}
                {trip.flight_options && trip.flight_options.length > 0 && (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Plane className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Flight Options</h3>
                        </div>
                        <div className="space-y-4">
                            {trip.flight_options.slice(0, 3).map((flight, idx) => (
                                <div key={idx} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-100 text-lg">{flight.airline}</h4>
                                        <span className="text-emerald-400 font-bold">₹{flight.price}</span>
                                    </div>
                                    <div className="flex gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {flight.duration}</span>
                                        <span className="flex items-center gap-1.5">🔄 {flight.stops}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hotels */}
                {trip.hotel_options && trip.hotel_options.length > 0 && (
                    <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-violet-500/20 rounded-xl">
                                <Hotel className="w-8 h-8 text-violet-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Hotel Options</h3>
                        </div>
                        <div className="space-y-4">
                            {trip.hotel_options.slice(0, 3).map((hotel, idx) => (
                                <div key={idx} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 hover:border-violet-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-100 text-lg">{hotel.name}</h4>
                                        <span className="text-emerald-400 font-bold">₹{hotel.price_per_night}/nt</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span className="text-amber-400 font-bold">⭐ {hotel.rating}</span>
                                        <span className="flex items-center gap-1.5 line-clamp-1"><MapPin className="w-3.5 h-3.5" /> {hotel.location}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
