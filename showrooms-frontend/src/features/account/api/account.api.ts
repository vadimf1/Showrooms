import apiClient from '../../../shared/api/apiClient';
import type { FavoriteItem, TestDriveItem, PurchaseItem } from '../model/account.types';

export const getFavorites = async () => {
  const res = await apiClient.get('/account/favorites/');
  return res.data as FavoriteItem[];
};

export const addFavorite = async (carModelId: string) => {
  await apiClient.post(`/account/favorites/${carModelId}/`, {});
};

export const removeFavorite = async (carModelId: string) => {
  await apiClient.delete(`/account/favorites/${carModelId}/`);
};

export const getTestDrives = async () => {
  const res = await apiClient.get('/account/test-drives/');
  return res.data as TestDriveItem[];
};

export const getPurchases = async () => {
  const res = await apiClient.get('/account/purchases/');
  return res.data as PurchaseItem[];
};

export const unlinkTelegram = async () => {
  await apiClient.delete('/account/telegram/unlink/');
};

export const linkTelegram = async (): Promise<{ url: string }> => {
  const res = await apiClient.post('/account/telegram/link/', {});
  return res.data;
};

export const cancelTestDrive = async (id: string): Promise<void> => {
  await apiClient.patch(`/account/test-drives/${id}/cancel/`, {});
};
