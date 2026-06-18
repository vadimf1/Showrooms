import apiClient from '../../../shared/api/apiClient';
import type { ReviewData, MyReviews } from '../model/review.types';

export async function createReview(
  type: 'car_model' | 'test_drive',
  objectId: string,
  rating: number,
  description: string,
): Promise<ReviewData> {
  const res = await apiClient.post<ReviewData>('/reviews/', { type, object_id: objectId, rating, description });
  return res.data;
}

export async function getMyReviews(): Promise<MyReviews> {
  const res = await apiClient.get<MyReviews>('/reviews/mine/');
  return res.data;
}
