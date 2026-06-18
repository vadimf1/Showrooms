export interface DealerAddress {
  country: string;
  city: string;
  state?: string | null;
  street: string;
  postal_code: string;
}

export interface DealerFull {
  id: string;
  name: string;
  city: string;
  address?: DealerAddress | null;
  car_count?: number;
}
