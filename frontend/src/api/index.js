import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const apiClient = axios.create({
  // 【修改：改回相對路徑】
  // 因為 Flask 將同時提供 API 和前端檔案，它們是同源的。
  baseURL: '/', 
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // 同源請求也需要發送 cookie
  withCredentials: true, 
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  (error) => {
    const authStore = useAuthStore();
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error("收到 401 未授權錯誤，執行登出。");
          authStore.logout();
          break;
        case 404:
          console.error("請求的資源不存在 (404)。");
          break;
        default:
          console.error(`收到伺服器錯誤: ${error.response.status}`);
      }
    } else {
      console.error("網路錯誤或請求無法發送:", error.message);
    }
    return Promise.reject(error.response?.data || error);
  }
);

// 所有 API 方法保持不變
export default {
  login(credentials) { return apiClient.post('/api/auth/login', credentials); },
  register(credentials) { return apiClient.post('/api/auth/register', credentials); },
  logout() { return apiClient.post('/api/auth/logout'); },
  getAuthStatus() { return apiClient.get('/api/auth/status'); },
  getAllSheep() { return apiClient.get('/api/sheep/'); },
  getSheepDetails(earNum) { return apiClient.get(`/api/sheep/${earNum}`); },
  addSheep(data) { return apiClient.post('/api/sheep/', data); },
  updateSheep(earNum, data) { return apiClient.put(`/api/sheep/${earNum}`, data); },
  deleteSheep(earNum) { return apiClient.delete(`/api/sheep/${earNum}`); },
  getSheepEvents(earNum) { return apiClient.get(`/api/sheep/${earNum}/events`); },
  addSheepEvent(earNum, data) { return apiClient.post(`/api/sheep/${earNum}/events`, data); },
  updateSheepEvent(eventId, data) { return apiClient.put(`/api/sheep/events/${eventId}`, data); },
  deleteSheepEvent(eventId) { return apiClient.delete(`/api/sheep/events/${eventId}`); },
  getSheepHistory(earNum) { return apiClient.get(`/api/sheep/${earNum}/history`); },
  deleteSheepHistory(recordId) { return apiClient.delete(`/api/sheep/history/${recordId}`); },
  getAgentTip(apiKey) { return apiClient.get('/api/agent/tip', { headers: { 'X-Api-Key': apiKey } }); },
  getRecommendation(apiKey, data) {
    const payload = { ...data, api_key: apiKey };
    return apiClient.post('/api/agent/recommendation', payload);
  },
  chatWithAgent(apiKey, message, sessionId, earNumContext) {
    const payload = { api_key: apiKey, message, session_id: sessionId, ear_num_context: earNumContext };
    return apiClient.post('/api/agent/chat', payload);
  },
  getDashboardData() { return apiClient.get('/api/dashboard/data'); },
  getFarmReport() { return apiClient.get('/api/dashboard/farm_report'); },
  exportExcel() { return apiClient.get('/api/data/export_excel', { responseType: 'blob' }); },
  analyzeExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/data/analyze_excel', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  processImport(file, isDefaultMode, mappingConfig = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_default_mode', isDefaultMode);
    if (!isDefaultMode) {
      formData.append('mapping_config', JSON.stringify(mappingConfig));
    }
    return apiClient.post('/api/data/process_import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getEventOptions() { return apiClient.get('/api/dashboard/event_options'); },
  addEventType(name) { return apiClient.post('/api/dashboard/event_types', { name }); },
  deleteEventType(typeId) { return apiClient.delete(`/api/dashboard/event_types/${typeId}`); },
  addEventDescription(typeId, description) {
    return apiClient.post('/api/dashboard/event_descriptions', { event_type_option_id: typeId, description: description });
  },
  deleteEventDescription(descId) { return apiClient.delete(`/api/dashboard/event_descriptions/${descId}`); },
};