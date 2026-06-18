export interface ShowroomAddress {
  id?: string;
  country: string;
  city: string;
  state?: string | null;
  street: string;
  postal_code: string;
}

export interface ShowroomFull {
  id: string;
  name: string;
  address: ShowroomAddress;
  dealer_count?: number;
  car_count?: number;
}
