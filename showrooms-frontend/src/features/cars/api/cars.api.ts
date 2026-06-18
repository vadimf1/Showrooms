import apiClient from "../../../shared/api/apiClient";
import {
  Car, CarsResponse, CarFilters, CarModelDetail, ConfigureResponse, CarPublicDetail,
  ConfigurationsResponse, StockResponse, CarReviewsResponse,
} from "../model/car.types";

export const getCarsCatalog = async (page: number, filters: CarFilters = {}): Promise<CarsResponse> => {
  const params: Record<string, string | number> = { page };
  if (filters.search)            params.search = filters.search;
  if (filters.make)              params.make = filters.make;
  if (filters.city)              params.city = filters.city;
  if (filters.price_min)         params.price_min = filters.price_min;
  if (filters.price_max)         params.price_max = filters.price_max;
  if (filters.year_min)          params.year_min = filters.year_min;
  if (filters.year_max)          params.year_max = filters.year_max;
  if (filters.vehicle_style)     params.vehicle_style = filters.vehicle_style;
  if (filters.engine_fuel_type)  params.engine_fuel_type = filters.engine_fuel_type;
  if (filters.transmission_type) params.transmission_type = filters.transmission_type;
  if (filters.driven_wheels)     params.driven_wheels = filters.driven_wheels;
  if (filters.ordering)          params.ordering = filters.ordering;

  const res = await apiClient.get("/catalog/", { params });
  return { cars: res.data.results, count: res.data.count };
};

export const getCarModelDetail = async (modelId: string): Promise<CarModelDetail> => {
  const res = await apiClient.get(`/car-models/${modelId}/`);
  return res.data;
};

export const getCarConfigure = async (
  modelId: string,
  params: { body?: string; hp?: number; fuel?: string; trans?: string; drive?: string; color?: string }
): Promise<ConfigureResponse> => {
  const p: Record<string, string | number> = {};
  if (params.body)  p.body  = params.body;
  if (params.hp)    p.hp    = params.hp;
  if (params.fuel)  p.fuel  = params.fuel;
  if (params.trans) p.trans = params.trans;
  if (params.drive) p.drive = params.drive;
  if (params.color) p.color = params.color;
  const res = await apiClient.get(`/car-models/${modelId}/configure/`, { params: p });
  return res.data;
};

export const getCarConfigurations = async (modelId: string): Promise<ConfigurationsResponse> => {
  const res = await apiClient.get(`/car-models/${modelId}/configurations/`);
  return res.data;
};

export const getCarStock = async (
  modelId: string,
  params: { body: string; hp: number; fuel: string; trans: string; drive: string; color?: string }
): Promise<StockResponse> => {
  const p: Record<string, string | number> = {
    body: params.body, hp: params.hp, fuel: params.fuel,
    trans: params.trans, drive: params.drive,
  };
  if (params.color) p.color = params.color;
  const res = await apiClient.get(`/car-models/${modelId}/stock/`, { params: p });
  return res.data;
};

export const getCarPublicDetail = async (carId: string): Promise<CarPublicDetail> => {
  const res = await apiClient.get(`/cars/${carId}/`);
  return res.data;
};

export const getRecommendations = async (carModelId: string): Promise<Car[]> => {
  const res = await apiClient.get("/recommendations/", { params: { car_model_id: carModelId } });
  return res.data;
};

export const getCatalogRecommendations = async (carModelIds: string[]): Promise<Car[]> => {
  const res = await apiClient.get("/recommendations/catalog/", {
    params: { car_model_ids: carModelIds.join(",") },
  });
  return res.data;
};

export const postTestDriveRequest = async (
  data: {
    showroom_id: string;
    car_model_id?: string;
    car_model_info: string;
    color_name: string;
    color_hex: string;
    body_style?: string;
    engine_hp?: number;
    fuel_type?: string;
    transmission_type?: string;
    drive_type?: string;
    name: string;
    phone: string;
  },
  headers?: Record<string, string>,
): Promise<{ id: string }> => {
  const res = await apiClient.post("/test-drive-requests/", data, { headers });
  return res.data;
};

export const getCarModelReviews = async (id: string): Promise<CarReviewsResponse> => {
  const res = await apiClient.get<CarReviewsResponse>(`/car-models/${id}/reviews/`);
  return res.data;
};
