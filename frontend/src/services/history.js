import axios from 'axios';

export async function getHistory(limit = 6) {
  const response = await axios.get(`/api/history?limit=${limit}`);
  return response.data.history;
}

export async function getHistoryEntry(id) {
  const response = await axios.get(`/api/history/${id}`);
  return response.data.entry;
}

export async function deleteHistoryEntry(id) {
  const response = await axios.delete(`/api/history/${id}`);
  return response.data;
}
