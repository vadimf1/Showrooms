import apiClient from '../../../shared/api/apiClient';
import { DealerFull, DealerAddress } from '../model/dealer.types';
import { PaginatedResponse } from '../../cars/model/car.types';

export interface DealerPayload {
  name: string;
  address?: Omit<DealerAddress, never> | null;
}

export const getDealers = (params: { page?: number; search?: string } = {}) =>
  apiClient.get<PaginatedResponse<DealerFull>>('/dealers/', { params }).then(r => r.data);

export const createDealer = (data: DealerPayload) =>
  apiClient.post<DealerFull>('/dealers/', data).then(r => r.data);

export const updateDealer = (id: string, data: DealerPayload) =>
  apiClient.patch<DealerFull>(`/dealers/${id}/`, data).then(r => r.data);

export const deleteDealer = (id: string) =>
  apiClient.delete(`/dealers/${id}/`);
