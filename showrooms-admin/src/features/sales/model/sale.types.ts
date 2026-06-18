export type PaymentMethod = 'cash' | 'credit' | 'tradein';

export interface SaleList {
  id: string;
  client_name: string;
  car_name: string;
  car_trim: string;
  car_year: number;
  car_color: string;
  car_hex: string;
  car_vin: string;
  showroom_name: string;
  showroom_city: string;
  employee_name: string | null;
  employee_initials: string;
  employee_grad: string;
  sale_date: string;
  final_price: string;
  payment_method: PaymentMethod;
}

export interface SaleCreatePayload {
  car_id: string;
  client_id: string;
  showroom_id: string;
  employee_id?: string | null;
  sale_date: string;
  final_price: number | string;
  discount?: number | string;
  payment_method: PaymentMethod;
  warranty_period: number;
  configuration?: string;
}
