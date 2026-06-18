import apiClient from '../../../shared/api/apiClient';
import { Car, CarModel, CarStatus, CarTrim, PaginatedResponse, TrimImage } from '../model/car.types';

export interface CarsFilters {
  page?: number;
  status?: CarStatus;
  search?: string;
  showroom?: string;
  ordering?: string;
}

export const getCars = (params: CarsFilters = {}) =>
  apiClient.get<PaginatedResponse<Car>>('/cars/', { params }).then(r => r.data);

export const getCar = (id: string) =>
  apiClient.get<Car>(`/cars/${id}/`).then(r => r.data);

export const createCar = (data: {
  trim_id: string;
  vin: string;
  color_name: string;
  color_hex: string;
  mileage: number;
  purchase_price: number;
  sale_price: number;
  status: CarStatus;
  showroom_id: string | null;
  dealer_id: string | null;
}) => apiClient.post<Car>('/cars/', data).then(r => r.data);

export const updateCarStatus = (id: string, status: CarStatus) =>
  apiClient.patch<Car>(`/cars/${id}/`, { status }).then(r => r.data);

export const updateCar = (id: string, data: Partial<{
  trim_id: string;
  status: CarStatus;
  vin: string;
  color_name: string;
  color_hex: string;
  mileage: number;
  purchase_price: number;
  sale_price: number;
  showroom_id: string | null;
  dealer_id: string | null;
}>) => apiClient.patch<Car>(`/cars/${id}/`, data).then(r => r.data);

export const deleteCar = (id: string) =>
  apiClient.delete(`/cars/${id}/`);

export const getAllCarModels = () =>
  apiClient.get<PaginatedResponse<CarModel>>('/car-models/', { params: { page_size: 500 } }).then(r => r.data.results);

export const createCarModel = (data: { make: string; model: string }) =>
  apiClient.post<CarModel>('/car-models/', data).then(r => r.data);

export const getCarTrimsForModel = (carModelId: string) =>
  apiClient.get<PaginatedResponse<CarTrim>>('/car-trims/', { params: { car_model_id: carModelId, page_size: 200 } }).then(r => r.data.results);

export const createCarTrim = (data: {
  car_model_id: string;
  name: string;
  year: number;
  engine_fuel_type: string;
  engine_hp: number | null;
  engine_cylinders: number | null;
  transmission_type: string;
  driven_wheels: string;
  number_of_doors: number;
  vehicle_style: string;
  highway_mpg: number;
  city_mpg: number;
}) => apiClient.post<CarTrim>('/car-trims/', data).then(r => r.data);

export const uploadTrimImage = async (data: {
  trim: string;
  image: File;
  color_name?: string;
  color_hex?: string;
  is_default?: boolean;
  order?: number;
}): Promise<TrimImage> => {
  const ext = data.image.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeFile = new File([data.image], `upload.${ext}`, { type: data.image.type });

  const fd = new FormData();
  fd.append('trim', data.trim);
  fd.append('image', safeFile);
  if (data.color_name) fd.append('color_name', data.color_name);
  if (data.color_hex)  fd.append('color_hex', data.color_hex);
  fd.append('is_default', String(data.is_default ?? false));
  fd.append('order', String(data.order ?? 0));

  const token = localStorage.getItem('access_token');
  const res = await fetch(`${apiClient.defaults.baseURL}/images/`, {
    method: 'POST',
    body: fd,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteTrimImage = (id: string) =>
  apiClient.delete(`/images/${id}/`);
