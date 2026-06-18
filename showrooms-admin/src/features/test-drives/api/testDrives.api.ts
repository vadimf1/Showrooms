import apiClient from '../../../shared/api/apiClient';
import { AvailableEmployee, TestDriveRequest, TestDriveStatus } from '../model/testDrive.types';
import { PaginatedResponse } from '../../cars/model/car.types';

export const getTestDrives = (params: { page?: number; status?: TestDriveStatus; search?: string } = {}) =>
  apiClient.get<PaginatedResponse<TestDriveRequest>>('/test-drive-requests/', { params }).then(r => r.data);

export const updateTestDriveStatus = (id: string, status: TestDriveStatus) =>
  apiClient.patch<TestDriveRequest>(`/test-drive-requests/${id}/`, { status }).then(r => r.data);

export const confirmTestDrive = (
  id: string,
  payload: { preferred_date: string; preferred_time: string; employee_id: string },
) =>
  apiClient
    .patch<TestDriveRequest>(`/test-drive-requests/${id}/`, { status: 'CONFIRMED', ...payload })
    .then(r => r.data);

export const getAvailableDates = (showroomId: string): Promise<string[]> =>
  apiClient.get('/availability/', { params: { showroom_id: showroomId } }).then(r => r.data);

export const getAvailableSlots = (showroomId: string, date: string): Promise<string[]> =>
  apiClient.get('/availability/', { params: { showroom_id: showroomId, date } }).then(r => r.data);

export const getAvailableEmployees = (
  showroomId: string,
  date: string,
  time: string,
): Promise<AvailableEmployee[]> =>
  apiClient.get('/availability/', { params: { showroom_id: showroomId, date, time } }).then(r => r.data);
