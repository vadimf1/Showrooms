export type CarTrimImage = { id: string; is_default: boolean; color_name: string; color_hex: string; image: string; order: number };
export type Dealer = { id: string; name: string };
export type ShowroomAddress = { city: string; street: string; state?: string };
export type Showroom = { id: string; name: string; address: ShowroomAddress | null };

export type CarInitialConfig = {
  body?: string | null;
  hp?: number | null;
  fuel?: string | null;
  trans?: string | null;
  drive?: string | null;
  colorHex?: string;
  colorName?: string;
};

export type Car = {
  id: string;
  car_id: string;
  make: string;
  model: string;
  price_from: string;
  dealer: { name: string } | null;
  showroom: { city: string; street: string } | null;
  images: CarTrimImage[];
  _initialConfig?: CarInitialConfig;
};

export type StockCar = {
  id: string;
  color_name: string;
  color_hex: string;
  sale_price: string;
  mileage: number;
  vin: string;
};

export type CarPublicDetail = {
  id: string;
  vin: string;
  color_name: string;
  color_hex: string;
  sale_price: string;
  mileage: number;
  make: string;
  model: string;
  showroom: { id: string; name: string; city: string | null; street: string | null } | null;
};

export type CarModelDetail = {
  id: string;
  make: string;
  model: string;
  year_range: string;
  images: CarTrimImage[];
  price_from: string | null;
  total_stock: number;
};

export type ConfigureResponse = {
  available_bodies: { style: string; count: number }[];
  available_engines: { hp: number; fuel: string; count: number }[];
  available_trans: { trans: string; count: number }[];
  available_drives: { drive: string; count: number }[];
  available_colors: { hex: string; name: string; count: number }[];
  matching: { price_from: string | null; stock_count: number; years: number[] };
  specs: { hp: number; fuel: string; trans: string; drive: string; doors: number; highway_mpg: number; city_mpg: number } | null;
  stock_groups: { showroom: string; city: string; address: string; cars: StockCar[] }[];
  gallery_images: CarTrimImage[];
};

export type ConfiguratorOption = {
  body: string;
  hp: number;
  fuel: string;
  trans: string;
  drive: string;
  stock_count: number;
  price_from: string | null;
  specs: { doors: number; highway_mpg: number; city_mpg: number };
};
export type ConfigurationsResponse = {
  available_bodies: { style: string; count: number }[];
  configurator_options: ConfiguratorOption[];
};

export type StockGroup = {
  showroom_id: string | null;
  showroom: string;
  city: string;
  address: string;
  price_from: string | null;
  cars: StockCar[];
};
export type StockResponse = {
  colors: { hex: string; name: string; count: number }[];
  matching: { price_from: string | null; stock_count: number; years: number[] };
  groups: StockGroup[];
  gallery_images: CarTrimImage[];
};

export type CarsResponse = { cars: Car[]; count: number };

export type CarFilters = {
  search?: string;
  make?: string;
  city?: string;
  price_min?: number;
  price_max?: number;
  year_min?: number;
  year_max?: number;
  vehicle_style?: string;
  engine_fuel_type?: string;
  transmission_type?: string;
  driven_wheels?: string;
  ordering?: string;
};

export type CarReview = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  description: string;
  created_at: string;
};

export type CarReviewsResponse = {
  count: number;
  avg_rating: number;
  results: CarReview[];
};
