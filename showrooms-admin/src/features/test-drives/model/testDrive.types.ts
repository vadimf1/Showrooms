export type TestDriveStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface TestDriveRequest {
  id: string;
  car_model_info: string;
  color_name: string;
  color_hex: string;
  customer_name: string;
  customer_phone: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: TestDriveStatus;
  created_at: string;
  showroom_name: string;
  showroom_id: string;
  employee_id: string | null;
}

export interface AvailableEmployee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
}
