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
    'Solapur, India', 'Hubli-Dharwad, India', 'Bareilly, India', 'Moradabad, India',
    'Mysore, India', 'Gurgaon, India', 'Aligarh, India', 'Jalandhar, India',
    'Tiruchirappalli, India', 'Bhubaneswar, India', 'Salem, India', 'Mira-Bhayandar, India',
    'Warangal, India', 'Guntur, India', 'Bhiwandi, India', 'Saharanpur, India',
    'Gorakhpur, India', 'Bikaner, India', 'Amravati, India', 'Noida, India',
    'Jamshedpur, India', 'Bhilai, India', 'Cuttack, India', 'Firozabad, India',
    'Kochi, India', 'Nellore, India', 'Bhavnagar, India', 'Dehradun, India',
    'Durgapur, India', 'Asansol, India', 'Rourkela, India', 'Nanded, India',
    'Kolhapur, India', 'Ajmer, India', 'Akola, India', 'Gulbarga, India',
    'Jamnagar, India', 'Ujjain, India', 'Loni, India', 'Siliguri, India',
    'Jhansi, India', 'Ulhasnagar, India', 'Jammu, India', 'Sangli-Miraj & Kupwad, India',
    'Mangalore, India', 'Erode, India', 'Belgaum, India', 'Kurnool, India',
    'Ambattur, India', 'Rajahmundry, India', 'Tirunelveli, India', 'Malegaon, India',
    'Gaya, India', 'Tirupur, India', 'Udaipur, India', 'Kakinada, India',
    'Davanagere, India', 'Kozhikode, India', 'Maheshtala, India', 'Rajpur Sonarpur, India',
    'Bokaro, India', 'South Dumdum, India', 'Bellary, India', 'Patiala, India',
    'Gopalpur, India', 'Agartala, India', 'Bhagalpur, India', 'Muzaffarnagar, India',
    'Bhatpara, India', 'Panihati, India', 'Latur, India', 'Dhule, India',
    'Rohtak, India', 'Sagar, India', 'Korba, India', 'Bhilwara, India',
    'Berhampur, India', 'Muzaffarpur, India', 'Ahmednagar, India', 'Mathura, India',
    'Kollam, India', 'Avadi, India', 'Kadapa, India', 'Kamarhati, India',
    'Sambalpur, India', 'Bilaspur, India', 'Shahjahanpur, India', 'Satara, India',
    'Bijapur, India', 'Rampur, India', 'Shimoga, India', 'Chandrapur, India',
    'Junagadh, India', 'Thrissur, India', 'Alwar, India', 'Bardhaman, India',
    'Kulti, India', 'Nizamabad, India', 'Parbhani, India', 'Tumkur, India',
    'Khammam, India', 'Uzhavarkarai, India', 'Bihar Sharif, India', 'Panipat, India',
    'Darbhanga, India', 'Bally, India', 'Aizawl, India', 'Dewas, India',
    'Ichalkaranji, India', 'Karnal, India', 'Bathinda, India', 'Jalna, India',
    'Eluru, India', 'Barasat, India', 'Kirari Suleman Nagar, India', 'Purnia, India',
    'Satna, India', 'Mau, India', 'Sonipat, India', 'Farrukhabad, India',
    'Durg, India', 'Imphal, India', 'Ratlam, India', 'Hapur, India',
    'Arrah, India', 'Anantapur, India', 'Karimnagar, India', 'Etawah, India',
    'Ambernath, India', 'North Dumdum, India', 'Bharatpur, India', 'Begusarai, India',
    'New Delhi, India', 'Gandhidham, India', 'Baranagar, India', 'Tiruvottiyur, India',
    'Pondicherry, India', 'Katni, India', 'Sambhal, India', 'Rewa, India',
    'Loni, India', 'Yamunanagar, India', 'Pallavaram, India', 'Karar, India',
    'Secunderabad, India', 'Bidar, India', 'Burhanpur, India', 'Gandhinagar, India',
    'Hospet, India', 'Nangloi Jat, India', 'Malad, India', 'Deoghar, India',
    'Chapra, India', 'Puri, India', 'Haldia, India', 'Khandwa, India',
    'Morena, India', 'Amroha, India', 'Raichur, India', 'Bhalswa Jahangir Pur, India',
    'Rishra, India', 'Nadiad, India', 'Panchkula, India', 'Kurichi, India',
    'Khowai, India', 'Ambikapur, India', 'Alandur, India', 'Thanjavur, India',
    'Nawada, India', 'Bulandshahr, India', 'Baharampur, India', 'Morbi, India'
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
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in bg-slate-900/50 p-6 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        Origin
                    </label>
                    <input
                        type="text"
                        list="indian-cities"
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="e.g., Delhi, India"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
                        disabled={isLoading}
                    />
                    {errors.origin && <p className="text-rose-400 text-sm">{errors.origin}</p>}
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        Destination
                    </label>
                    <input
                        type="text"
                        list="indian-cities"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        placeholder="e.g., Jaipur, India"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
                        disabled={isLoading}
                    />
                    {errors.destination && <p className="text-rose-400 text-sm">{errors.destination}</p>}
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
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [color-scheme:dark]"
                        disabled={isLoading}
                    />
                    {errors.start_date && <p className="text-rose-400 text-sm">{errors.start_date}</p>}
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        End Date
                    </label>
                    <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [color-scheme:dark]"
                        disabled={isLoading}
                    />
                    {errors.end_date && <p className="text-rose-400 text-sm">{errors.end_date}</p>}
                </div>
            </div>

            {/* Budget and Travelers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <DollarSign className="w-4 h-4 text-indigo-400" />
                        Budget (₹ INR)
                    </label>
                    <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                        min={100}
                        max={1000000}
                        step={100}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
                        disabled={isLoading}
                        placeholder="Min ₹100"
                    />
                    <p className="text-xs text-slate-500">Budget-friendly trips from ₹100</p>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Users className="w-4 h-4 text-indigo-400" />
                        Number of Travelers
                    </label>
                    <input
                        type="number"
                        value={formData.num_travelers}
                        onChange={(e) => setFormData({ ...formData, num_travelers: parseInt(e.target.value) || 1 })}
                        min={1}
                        max={20}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Globe className="w-4 h-4 text-indigo-400" />
                        Transport Preference
                    </label>
                    <select
                        value={formData.preferred_transport}
                        onChange={(e) => setFormData({ ...formData, preferred_transport: e.target.value as any })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
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
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {interest}
                        </button>
                    ))}
                </div>
                {errors.interests && <p className="text-rose-400 text-sm">{errors.interests}</p>}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
                        disabled={isLoading}
                    />
                    {errors.email && <p className="text-rose-400 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-indigo-400" /> WhatsApp Number
                        </label>
                        <input
                            type="tel"
                            placeholder="+91 82799 29101"
                            className={`w-full px-4 py-3 bg-slate-800 rounded-xl border ${errors.phone ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900/50'} text-slate-100 transition-all placeholder:text-slate-500`}
                            value={formData.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={isLoading}
                        />
                        {errors.phone && <p className="text-rose-400 text-sm">{errors.phone}</p>}
                    </div>

                    <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <label className="flex items-center gap-3 cursor-pointer group w-full">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={formData.enablePhoneConfirmation}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, enablePhoneConfirmation: e.target.checked })}
                                    disabled={isLoading}
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${formData.enablePhoneConfirmation ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
                                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.enablePhoneConfirmation ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-indigo-400 transition-colors">
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
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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
