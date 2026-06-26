import api from './api';

export async function getHistory(limit = 6) {
  const response = await api.get(`/history?limit=${limit}`);
  return response.data.history;
}

export async function getHistoryEntry(id) {
  const response = await api.get(`/history/${id}`);
  return response.data.entry;
}

export async function deleteHistoryEntry(id) {
  const response = await api.delete(`/history/${id}`);
  return response.data;
}
