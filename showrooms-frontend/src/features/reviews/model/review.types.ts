export interface ReviewData {
  id: string;
  rating: number;
  description: string;
  created_at: string;
}

export interface MyReviews {
  car_model: Record<string, ReviewData>;
  test_drive: Record<string, ReviewData>;
}
