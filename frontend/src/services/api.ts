/**
 * API client for trip planner backend
 */

import axios from 'axios';
import { TripFormData, TripPlanResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Create a new trip plan with confirmation
 */
export const createTripPlan = async (formData: TripFormData): Promise<TripPlanResponse> => {
    // If email and phone are provided, use the confirmation endpoint
    if (formData.email && formData.phone) {
        const response = await api.post('/trip/plan-with-confirmation', formData);
        const { trip_id } = response.data;

        // Fetch the full trip data
        const tripResponse = await api.get(`/trip/${trip_id}`);
        return tripResponse.data;
    }

    const response = await api.post('/trip/plan', formData);
    return response.data;
};

/**
 * Get confirmation status
 */
export const getConfirmationStatus = async (tripId: string): Promise<{
    trip_id: string;
    status: string;
    method?: string;
    timestamp: string;
}> => {
    const response = await api.get(`/booking/status/${tripId}`);
    return response.data;
};

/**
 * Confirm trip from web page
 */
export const confirmTrip = async (tripId: string, action: 'confirm' | 'cancel' | 'modify'): Promise<any> => {
    const response = await api.post(`/booking/email-confirm/${tripId}?action=${action}`);
    return response.data;
};

/**
 * Get trip plan status
 */
export const getTripStatus = async (tripId: string): Promise<TripPlanResponse> => {
    const response = await api.get(`/trip/${tripId}`);
    return response.data;
};

/**
 * Download trip PDF
 */
export const downloadTripPDF = async (tripId: string, destination: string): Promise<void> => {
    const response = await api.get(`/trip/${tripId}/pdf`, {
        responseType: 'blob',
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${destination.replace(/ /g, '_')}_itinerary.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

/**
 * Health check
 */
export const healthCheck = async (): Promise<{ status: string; version: string }> => {
    const response = await api.get('/trip/health');
    return response.data;
};
