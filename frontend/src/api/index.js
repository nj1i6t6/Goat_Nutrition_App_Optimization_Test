import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

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
  async (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error("收到 401 未授權錯誤，執行登出。");
          // 使用動態導入避免循環依賴
          const { useAuthStore } = await import('../stores/auth');
          const authStore = useAuthStore();
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
    return Promise.reject(error);
  }
);

/**
 * 帶錯誤處理的 API 包裝器
 * @param {Function} apiCall - API 調用函數
 * @param {Function} errorHandler - 錯誤處理函數 (可選)
 * @returns {Promise} API 調用結果
 */
async function withErrorHandling(apiCall, errorHandler = null) {
  try {
    return await apiCall();
  } catch (error) {
    if (errorHandler) {
      const formatted = handleApiError(error);
      errorHandler(formatted);
    }
    throw error;
  }
}

// 包裝 API 方法以提供錯誤處理
export default {
  // 身份驗證 API
  login(credentials, errorHandler) { 
    return withErrorHandling(() => apiClient.post('/api/auth/login', credentials), errorHandler); 
  },
  register(credentials, errorHandler) { 
    return withErrorHandling(() => apiClient.post('/api/auth/register', credentials), errorHandler); 
  },
  logout(errorHandler) { 
    return withErrorHandling(() => apiClient.post('/api/auth/logout'), errorHandler); 
  },
  getAuthStatus(errorHandler) { 
    return withErrorHandling(() => apiClient.get('/api/auth/status'), errorHandler); 
  },

  // 羊隻管理 API
  getAllSheep(errorHandler) { 
    return withErrorHandling(() => apiClient.get('/api/sheep/'), errorHandler); 
  },
  getSheepDetails(earNum, errorHandler) { 
    return withErrorHandling(() => apiClient.get(`/api/sheep/${earNum}`), errorHandler); 
  },
  addSheep(data, errorHandler) { 
    return withErrorHandling(() => apiClient.post('/api/sheep/', data), errorHandler); 
  },
  updateSheep(earNum, data, errorHandler) { 
    return withErrorHandling(() => apiClient.put(`/api/sheep/${earNum}`, data), errorHandler); 
  },
  deleteSheep(earNum, errorHandler) { 
    return withErrorHandling(() => apiClient.delete(`/api/sheep/${earNum}`), errorHandler); 
  },

  // 羊隻事件 API
  getSheepEvents(earNum, errorHandler) { 
    return withErrorHandling(() => apiClient.get(`/api/sheep/${earNum}/events`), errorHandler); 
  },
  addSheepEvent(earNum, data, errorHandler) { 
    return withErrorHandling(() => apiClient.post(`/api/sheep/${earNum}/events`, data), errorHandler); 
  },
  updateSheepEvent(eventId, data, errorHandler) { 
    return withErrorHandling(() => apiClient.put(`/api/sheep/events/${eventId}`, data), errorHandler); 
  },
  deleteSheepEvent(eventId, errorHandler) { 
    return withErrorHandling(() => apiClient.delete(`/api/sheep/events/${eventId}`), errorHandler); 
  },

  // 羊隻歷史記錄 API
  getSheepHistory(earNum, errorHandler) { 
    return withErrorHandling(() => apiClient.get(`/api/sheep/${earNum}/history`), errorHandler); 
  },
  deleteSheepHistory(recordId, errorHandler) { 
    return withErrorHandling(() => apiClient.delete(`/api/sheep/history/${recordId}`), errorHandler); 
  },

  // AI 代理 API
  getAgentTip(apiKey, errorHandler) { 
    return withErrorHandling(() => apiClient.get('/api/agent/tip', { headers: { 'X-Api-Key': apiKey } }), errorHandler); 
  },
  getRecommendation(apiKey, data, errorHandler) {
    const payload = { ...data, api_key: apiKey };
    return withErrorHandling(() => apiClient.post('/api/agent/recommendation', payload), errorHandler);
  },
  chatWithAgent(apiKey, message, sessionId, earNumContext, errorHandler) {
    const payload = { api_key: apiKey, message, session_id: sessionId, ear_num_context: earNumContext };
    return withErrorHandling(() => apiClient.post('/api/agent/chat', payload), errorHandler);
  },

  // 儀表板 API
  getDashboardData(errorHandler) { 
    return withErrorHandling(() => apiClient.get('/api/dashboard/data'), errorHandler); 
  },
  getFarmReport(errorHandler) { 
    return withErrorHandling(() => apiClient.get('/api/dashboard/farm_report'), errorHandler); 
  },

  // 資料管理 API
  exportExcel(errorHandler) { 
    return withErrorHandling(() => apiClient.get('/api/data/export_excel', { responseType: 'blob' }), errorHandler); 
  },
  analyzeExcel(file, errorHandler) {
    const formData = new FormData();
    formData.append('file', file);
    return withErrorHandling(() => apiClient.post('/api/data/analyze_excel', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    }), errorHandler);
  },
  processImport(file, isDefaultMode, mappingConfig = {}, errorHandler) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_default_mode', isDefaultMode);
    if (!isDefaultMode) {
      formData.append('mapping_config', JSON.stringify(mappingConfig));
    }
    return withErrorHandling(() => apiClient.post('/api/data/process_import', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    }), errorHandler);
  },

  // 事件選項管理 API
  getEventOptions(errorHandler) { 
    return withErrorHandling(() => apiClient.get('/api/dashboard/event_options'), errorHandler); 
  },
  addEventType(name, errorHandler) { 
    return withErrorHandling(() => apiClient.post('/api/dashboard/event_types', { name }), errorHandler); 
  },
  deleteEventType(typeId, errorHandler) { 
    return withErrorHandling(() => apiClient.delete(`/api/dashboard/event_types/${typeId}`), errorHandler); 
  },
  addEventDescription(typeId, description, errorHandler) {
    return withErrorHandling(() => apiClient.post('/api/dashboard/event_descriptions', { 
      event_type_option_id: typeId, 
      description: description 
    }), errorHandler);
  },
  deleteEventDescription(descId, errorHandler) { 
    return withErrorHandling(() => apiClient.delete(`/api/dashboard/event_descriptions/${descId}`), errorHandler); 
  },

  // 羊隻生長預測 API
  getSheepPrediction(earTag, targetDays, apiKey, errorHandler) {
    return withErrorHandling(() => apiClient.get(`/api/prediction/goats/${earTag}/prediction?target_days=${targetDays}`, {
      headers: { 'X-Api-Key': apiKey }
    }), errorHandler);
  },
  getPredictionChartData(earTag, targetDays, errorHandler) {
    return withErrorHandling(() => apiClient.get(`/api/prediction/goats/${earTag}/prediction/chart-data?target_days=${targetDays}`), errorHandler);
  },

  // 原始錯誤處理包裝函數，供外部使用
  withErrorHandling
};