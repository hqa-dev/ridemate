export type UserRole = 'passenger' | 'driver' | 'both'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type RideStatus = 'active' | 'full' | 'completed' | 'cancelled'
export type RequestStatus = 'pending' | 'approved' | 'declined'
export type PriceType = 'coffee' | 'iqd'
export type City = 'erbil' | 'suli' | 'duhok'

export interface User {
  id: string
  full_name: string
  phone: string
  email?: string
  role: UserRole
  verification_status: VerificationStatus
  id_photo_url?: string
  selfie_url?: string
  created_at: string
}

export interface DriverProfile {
  id: string
  user_id: string
  car_make: string
  car_model: string
  car_color: string
  plate_number: string
  license_url?: string
  verified: boolean
}

export interface Ride {
  id: string
  driver_id: string
  driver?: User
  driver_profile?: DriverProfile
  from_city: City
  to_city: City
  departure_time: string
  available_seats: number
  taken_seats: number
  price_type: PriceType
  price_iqd?: number
  notes?: string
  status: RideStatus
  created_at: string
}

export interface RideRequest {
  id: string
  ride_id: string
  passenger_id: string
  passenger?: User
  status: RequestStatus
  passenger_note?: string
  created_at: string
}

export const CITIES: Record<City, string> = {
  erbil: '[Erbil]',
  suli: '[Suli]',
  duhok: '[Duhok]',
}
