export interface EmployeeFull {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
  position: string;
  salary: string;
  showroom_id: string | null;
  showroom_name: string;
  city: string;
}

export interface EmployeePayload {
  first_name: string;
  last_name: string;
  username: string;
  password?: string;
  position: string;
  salary: number | string;
  showroom_id?: string | null;
}
