import apiClient from '../../../shared/api/apiClient';
import { EmployeeFull, EmployeePayload } from '../model/employee.types';
import { PaginatedResponse } from '../../cars/model/car.types';

export const getEmployees = (params: { page?: number; search?: string } = {}) =>
  apiClient.get<PaginatedResponse<EmployeeFull>>('/employees/', { params }).then(r => r.data);

export const createEmployee = (data: EmployeePayload) =>
  apiClient.post<EmployeeFull>('/employees/', data).then(r => r.data);

export const updateEmployee = (id: string, data: EmployeePayload) =>
  apiClient.patch<EmployeeFull>(`/employees/${id}/`, data).then(r => r.data);

export const deleteEmployee = (id: string) =>
  apiClient.delete(`/employees/${id}/`);
