import apiClient from '../../../shared/api/apiClient';
import { ShowroomFull, ShowroomAddress } from '../model/showroom.types';
import { PaginatedResponse } from '../../cars/model/car.types';

export interface ShowroomPayload {
  name: string;
  address: Omit<ShowroomAddress, 'id'>;
}

export const getShowrooms = (params: { page?: number; search?: string } = {}) =>
  apiClient.get<PaginatedResponse<ShowroomFull>>('/showrooms/', { params }).then(r => r.data);

export const getShowroom = (id: string) =>
  apiClient.get<ShowroomFull>(`/showrooms/${id}/`).then(r => r.data);

export const createShowroom = (data: ShowroomPayload) =>
  apiClient.post<ShowroomFull>('/showrooms/', data).then(r => r.data);

export const updateShowroom = (id: string, data: ShowroomPayload) =>
  apiClient.patch<ShowroomFull>(`/showrooms/${id}/`, data).then(r => r.data);

export const deleteShowroom = (id: string) =>
  apiClient.delete(`/showrooms/${id}/`);
