export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserProfile extends AuthUser {
  phone: string;
  birth_date: string | null;
  city: string;
  telegram_linked: boolean;
  telegram_username: string | null;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
}
