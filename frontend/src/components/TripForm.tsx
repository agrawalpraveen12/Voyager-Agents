'use client';

import React, { useState } from 'react';
import { Plane, Sparkles, AlertCircle, CheckCircle2, Phone, Calendar, Users, DollarSign, MapPin, Train, Bus, Globe } from 'lucide-react';
import { TripFormData, INTEREST_OPTIONS } from '@/types';

const INDIAN_CITIES = [
    'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India',
    'Ahmedabad, India', 'Chennai, India', 'Kolkata, India', 'Surat, India',
    'Pune, India', 'Jaipur, India', 'Lucknow, India', 'Kanpur, India',
    'Nagpur, India', 'Indore, India', 'Thane, India', 'Bhopal, India',
    'Visakhapatnam, India', 'Pimpri-Chinchwad, India', 'Patna, India', 'Vadodara, India',
    'Ghaziabad, India', 'Ludhiana, India', 'Agra, India', 'Nashik, India',
    'Faridabad, India', 'Meerut, India', 'Rajkot, India', 'Kalyan-Dombivli, India',
    'Vasai-Virar, India', 'Varanasi, India', 'Srinagar, India', 'Aurangabad, India',
    'Dhanbad, India', 'Amritsar, India', 'Navi Mumbai, India', 'Allahabad, India',
    'Ranchi, India', 'Howrah, India', 'Coimbatore, India', 'Jabalpur, India',
    'Gwalior, India', 'Vijayawada, India', 'Jodhpur, India', 'Madurai, India',
    'Raipur, India', 'Kota, India', 'Guwahati, India', 'Chandigarh, India',
    'Solapur, India', 'Hubli-Dharwad, India'
];

interface TripFormProps {
    onSubmit: (formData: TripFormData) => void;
    isLoading: boolean;
}

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
    const [formData, setFormData] = useState<TripFormData>({
        origin: '',
        destination: '',
        start_date: '',
        end_date: '',
        budget: 5000,
        num_travelers: 2,
        interests: ['Culture', 'Food', 'Local Experiences'],
        email: '',
        phone: '+91 ',
        enablePhoneConfirmation: true,
        preferred_transport: 'any',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};

        if (!formData.origin.trim()) {
            newErrors.origin = 'Origin is required';
        }

        if (!formData.destination.trim()) {
            newErrors.destination = 'Destination is required';
        }

        if (!formData.start_date) {
            newErrors.start_date = 'Start date is required';
        }

        if (!formData.end_date) {
            newErrors.end_date = 'End date is required';
        }

        if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
            newErrors.end_date = 'End date must be after start date';
        }

        if (formData.interests.length === 0) {
            newErrors.interests = 'Please select at least one interest';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSubmit(formData);
    };

    const toggleInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest],
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        Origin
                    </label>
                    <input
                        type="text"
                        list="indian-cities"
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="e.g., London, UK"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                    />
                    {errors.origin && <p className="text-red-500 text-sm">{errors.origin}</p>}
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        Destination
                    </label>
                    <input
                        type="text"
                        list="indian-cities"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        placeholder="e.g., Tokyo, Japan"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                    />
                    {errors.destination && <p className="text-red-500 text-sm">{errors.destination}</p>}
                </div>

                <datalist id="indian-cities">
                    {INDIAN_CITIES.map(city => (
                        <option key={city} value={city} />
                    ))}
                </datalist>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                    />
                    {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        End Date
                    </label>
                    <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                    />
                    {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
                </div>
            </div>

            {/* Budget and Travelers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <DollarSign className="w-4 h-4 text-primary-600" />
                        Budget (₹ INR)
                    </label>
                    <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                        min={100}
                        max={1000000}
                        step={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                        placeholder="Min ₹100"
                    />
                    <p className="text-xs text-gray-500">Budget-friendly trips from ₹100</p>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Users className="w-4 h-4 text-primary-600" />
                        Number of Travelers
                    </label>
                    <input
                        type="number"
                        value={formData.num_travelers}
                        onChange={(e) => setFormData({ ...formData, num_travelers: parseInt(e.target.value) || 1 })}
                        min={1}
                        max={20}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Globe className="w-4 h-4 text-primary-600" />
                        Transport Preference
                    </label>
                    <select
                        value={formData.preferred_transport}
                        onChange={(e) => setFormData({ ...formData, preferred_transport: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                        disabled={isLoading}
                    >
                        <option value="any">Any (Flights, Trains, Buses)</option>
                        <option value="flight">Flights Only</option>
                        <option value="train">Trains Only</option>
                        <option value="bus">Buses Only</option>
                    </select>
                </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Sparkles className="w-4 h-4 text-primary-600" />
                    Your Interests
                </label>
                <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((interest) => (
                        <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${formData.interests.includes(interest)
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {interest}
                        </button>
                    ))}
                </div>
                {errors.interests && <p className="text-red-500 text-sm">{errors.interests}</p>}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary-600" /> WhatsApp Number
                        </label>
                        <input
                            type="tel"
                            placeholder="+91 82799 29101"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'} transition-all`}
                            value={formData.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={isLoading}
                        />
                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer group w-full">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={formData.enablePhoneConfirmation}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, enablePhoneConfirmation: e.target.checked })}
                                    disabled={isLoading}
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${formData.enablePhoneConfirmation ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.enablePhoneConfirmation ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                                Enable WhatsApp confirmation
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Planning Your Amazing Trip...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Plan My Amazing Trip!
                    </>
                )}
            </button>
        </form>
    );
}
