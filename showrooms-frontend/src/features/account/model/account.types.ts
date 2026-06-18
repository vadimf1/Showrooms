export interface FavoriteItem {
  car_model_id: string;
  make: string;
  model: string;
  price_from: string | null;
  images: { id: string; image: string; order: number }[];
}

export interface TestDriveItem {
  id: string;
  car_model_id: string | null;
  car_model_info: string;
  color_name: string;
  color_hex: string;
  body_style: string | null;
  engine_hp: number | null;
  fuel_type: string | null;
  transmission_type: string | null;
  drive_type: string | null;
  showroom_name: string;
  city: string;
  preferred_date: string | null;
  created_at: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export interface PurchaseItem {
  id: string;
  car_model_id: string | null;
  car_name: string;
  year: number | null;
  color_name: string;
  vin: string;
  sale_date: string;
  final_price: string;
  showroom_name: string;
  city: string;
  dealer_name: string;
}
