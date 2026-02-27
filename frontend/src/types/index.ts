/**
 * TypeScript types for the application
 */

export interface TripFormData {
    origin: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget: number;
    num_travelers: number;
    interests: string[];
    email: string;
    phone: string;
    enablePhoneConfirmation: boolean;
    preferred_transport?: 'any' | 'flight' | 'train' | 'bus';
}

export interface PlaceInfo {
    name: string;
    rating?: number;
    address: string;
    types: string[];
    place_id?: string;
    image_url?: string;
}

export interface FlightOption {
    airline: string;
    price: string;
    duration: string;
    stops: string;
    departure?: string;
    booking_tip?: string;
}

export interface TrainOption {
    train_name: string;
    class: string;
    price: string;
    duration: string;
    departure?: string;
    booking_tip?: string;
}

export interface BusOption {
    operator: string;
    type: string;
    price: string;
    duration: string;
    departure?: string;
    booking_tip?: string;
}

export interface HotelOption {
    name: string;
    price_per_night: string;
    rating: string;
    location: string;
    amenities: string;
    booking_platform?: string;
}

export interface ActivityInfo {
    title: string;
    description: string;
    category: string;
    url?: string;
    image_url?: string;
}

export interface WeatherInfo {
    forecast: string;
    temperature?: string;
    conditions?: string;
}

export interface TripPlanResponse {
    trip_id: string;
    status: 'processing' | 'completed' | 'failed' | 'PENDING_CONFIRMATION';
    origin: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget: number;
    num_travelers: number;
    interests: string[];
    destination_info: Record<string, any>;
    destination_image?: string;
    places_info: PlaceInfo[];
    flight_options: FlightOption[];
    train_options: TrainOption[];
    bus_options: BusOption[];
    hotel_options: HotelOption[];
    activities: ActivityInfo[];
    weather_info?: WeatherInfo;
    final_itinerary: string;
    created_at: string;
    progress: number;
    error_messages: string[];
}

export const INTEREST_OPTIONS = [
    'Culture',
    'Food',
    'Adventure',
    'Museums',
    'Nature',
    'Shopping',
    'Nightlife',
    'History',
    'Art',
    'Music',
    'Architecture',
    'Local Experiences',
    'Beach',
    'Sports',
    'Photography'
];
