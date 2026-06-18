import apiClient from '../../../shared/api/apiClient';
import { SaleList, SaleCreatePayload } from '../model/sale.types';
import { PaginatedResponse } from '../../cars/model/car.types';

export interface SalesFilters {
  page?: number;
  page_size?: number;
  search?: string;
  showroom?: string;
  payment_method?: string;
}

export const getSales = (params: SalesFilters = {}) =>
  apiClient.get<PaginatedResponse<SaleList>>('/sales/', { params }).then(r => r.data);

export const createSale = (data: SaleCreatePayload) =>
  apiClient.post<SaleList>('/sales/', data).then(r => r.data);

export const deleteSale = (id: string) =>
  apiClient.delete(`/sales/${id}/`);
