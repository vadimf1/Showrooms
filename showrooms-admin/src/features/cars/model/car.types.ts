export type CarStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED';

export interface CarImage {
  id: string;
  image: string;
  is_main: boolean;
}

export interface CarModel {
  id: string;
  make: string;
  model: string;
}

export interface CarTrim {
  id: string;
  year: number;
  engine_fuel_type: string;
  engine_hp: number;
  engine_cylinders: number;
  transmission_type: string;
  driven_wheels: string;
  number_of_doors: number;
  vehicle_style: string;
  highway_mpg: number;
  city_mpg: number;
  name: string;
  car_model: CarModel;
}

export interface Showroom {
  id: string;
  name: string;
  address: {
    id: number;
    city: string;
    street: string;
    building?: string;
    zip_code?: string;
  };
}

export interface Dealer {
  id: string;
  name: string;
  showroom: Showroom;
}

export interface Car {
  id: string;
  trim: CarTrim;
  showroom: Showroom | null;
  dealer: Dealer | null;
  color_name: string;
  color_hex: string;
  sale_price: number;
  purchase_price: number;
  mileage: number;
  vin: string;
  status: CarStatus;
}

export interface TrimImage {
  id: string;
  image: string;
  is_default: boolean;
  color_name: string;
  color_hex: string;
  order: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
