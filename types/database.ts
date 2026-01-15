export interface Experience {
  id: string;
  title: string;
  slug: string;
  description: string;
  price_cop: number;
  price_usd: number;
  location_name: string;
  location_coords: { lat: number; lng: number }; // PostGIS point handling can be complex, keeping as any for now or { lat: number, lng: number } if we parse it
  includes: string[];
  excludes: string[];
  recommendations: string;
  max_capacity: number;
  image: string | null;
  gallery?: string[];
  created_at: string;
}

export interface ExperienceMedia {
  id: string;
  experience_id: string;
  url: string;
  type: 'image' | 'video';
  order: number;
  created_at: string;
}

export interface Booking {
  id: string;
  experience_id: string;
  customer_name: string;
  customer_email: string;
  travel_date: string;
  guests_count: number;
  total_amount: number;
  currency: 'COP' | 'USD';
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  gateway: 'wompi' | 'stripe';
  transaction_id: string;
  payment_status: string;
  created_at: string;
}
