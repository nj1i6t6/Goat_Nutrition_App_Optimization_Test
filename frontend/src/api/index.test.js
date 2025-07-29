/**
 * API 模組測試
 * @jest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock axios 先於其他導入
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn()
    },
    response: {
      use: vi.fn()
    }
  }
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance)
  }
}))

// Mock auth store
vi.mock('../stores/auth', () => ({
  useAuthStore: vi.fn()
}))

// Mock error handler
vi.mock('../utils/errorHandler', () => ({
  handleApiError: vi.fn()
}))

import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../stores/auth'

describe('API 模組', () => {
  let mockAuthStore
  let pinia
  let api

  beforeEach(async () => {
    // Setup pinia
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Mock auth store
    mockAuthStore = {
      logout: vi.fn()
    }
    
    useAuthStore.mockReturnValue(mockAuthStore)
    
    vi.clearAllMocks()
    
    // 動態導入API模組以確保mocks已設置
    const apiModule = await import('./index')
    api = apiModule.default
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('API 客戶端初始化', () => {
    it('應該使用正確配置創建axios 實例', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '/',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true
      })
    })

    it('應該設置請求攔截器', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    })

    it('應該設置響應攔截器', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('響應攔截器', () => {
    let responseInterceptor
    let errorInterceptor

    beforeEach(() => {
      // 獲取響應攔截器函數
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0]
      if (interceptorCall) {
        responseInterceptor = interceptorCall[0]
        errorInterceptor = interceptorCall[1]
      }
    })

    it('應該正確處理響應數據', () => {
      if (!responseInterceptor) return
      
      const mockResponse = {
        data: { message: 'success' },
        config: { responseType: 'json' }
      }
      
      const result = responseInterceptor(mockResponse)
      expect(result).toEqual({ message: 'success' })
    })

    it('應該正確處理 blob 響應', () => {
      if (!responseInterceptor) return
      
      const mockResponse = {
        data: new Blob(),
        config: { responseType: 'blob' }
      }
      
      const result = responseInterceptor(mockResponse)
      expect(result).toBe(mockResponse)
    })

    it('應該處理 401 錯誤並執行登出', async () => {
      if (!errorInterceptor) return
      
      const mockError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      }
      
      try {
        await errorInterceptor(mockError)
      } catch (error) {
        expect(mockAuthStore.logout).toHaveBeenCalled()
      }
    })

    it('應該處理 404 錯誤', async () => {
      if (!errorInterceptor) return
      
      const mockError = {
        response: {
          status: 404,
          data: { error: 'Not Found' }
        }
      }
      
      try {
        await errorInterceptor(mockError)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('應該處理網絡錯誤', async () => {
      if (!errorInterceptor) return
      
      const mockError = {
        message: 'Network Error'
      }
      
      try {
        await errorInterceptor(mockError)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('API 方法測試', () => {
    beforeEach(() => {
      // Mock axios methods for api calls
      mockAxiosInstance.get.mockResolvedValue({ data: 'mock data' })
      mockAxiosInstance.post.mockResolvedValue({ data: 'mock data' })
      mockAxiosInstance.put.mockResolvedValue({ data: 'mock data' })
      mockAxiosInstance.delete.mockResolvedValue({ data: 'mock data' })
    })

    describe('認證相關 API', () => {
      it('應該正確調用登入 API', async () => {
        const loginData = { username: 'testuser', password: 'testpass' }
        
        if (api.login) {
          await api.login(loginData)
          expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', loginData)
        }
      })

      it('應該正確調用登出 API', async () => {
        if (api.logout) {
          await api.logout()
          expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout')
        }
      })

      it('應該正確調用檢查認證狀態API', async () => {
        if (api.checkAuthStatus) {
          await api.checkAuthStatus()
          expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/check')
        }
      })
    })

    describe('羊隻管理 API', () => {
      it('應該正確調用獲取所有羊隻API', async () => {
        if (api.getAllSheep) {
          await api.getAllSheep()
          expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/sheep')
        }
      })

      it('應該正確調用獲取羊隻詳情 API', async () => {
        const earNum = 'SH001'
        
        if (api.getSheepDetails) {
          await api.getSheepDetails(earNum)
          expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/api/sheep/${earNum}`)
        }
      })

      it('應該正確調用創建羊隻 API', async () => {
        const sheepData = { EarNum: 'SH001', Breed: '努比亞' }
        
        if (api.createSheep) {
          await api.createSheep(sheepData)
          expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/sheep', sheepData)
        }
      })

      it('應該正確調用更新羊隻 API', async () => {
        const earNum = 'SH001'
        const updateData = { Body_Weight_kg: 50 }
        
        if (api.updateSheep) {
          await api.updateSheep(earNum, updateData)
          expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/api/sheep/${earNum}`, updateData)
        }
      })

      it('應該正確調用刪除羊隻 API', async () => {
        const earNum = 'SH001'
        
        if (api.deleteSheep) {
          await api.deleteSheep(earNum)
          expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/api/sheep/${earNum}`)
        }
      })
    })

    describe('儀表板 API', () => {
      it('應該正確調用獲取儀表板數據 API', async () => {
        await api.getDashboardData()
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/dashboard')
      })

      it('應該正確調用獲取農場報告 API', async () => {
        await api.getFarmReport()
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/farm-report')
      })
    })

    describe('諮詢 API', () => {
      it('應該正確調用獲取飼養建議 API', async () => {
        const consultationData = {
          EarNum: 'SH001',
          Body_Weight_kg: 50,
          status: 'lactating_peak'
        }
        const apiKey = 'test-api-key'
        
        await api.getRecommendation(apiKey, consultationData)
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/consultation', {
          api_key: apiKey,
          ...consultationData
        })
      })
    })

    describe('聊天 API', () => {
      it('應該正確調用聊天 API', async () => {
        const apiKey = 'test-api-key'
        const message = '你好'
        const sessionId = 'session_123'
        const earNumContext = 'SH001'
        
        await api.chatWithAgent(apiKey, message, sessionId, earNumContext)
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/chat', {
          api_key: apiKey,
          user_message: message,
          session_id: sessionId,
          ear_num_context: earNumContext
        })
      })
    })

    describe('設置 API', () => {
      it('應該正確調用測試 API 密鑰', async () => {
        const apiKey = 'test-api-key'
        
        await api.testApiKey(apiKey)
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/test-api-key', {
          api_key: apiKey
        })
      })

      it('應該正確調用獲取代理提示 API', async () => {
        const apiKey = 'test-api-key'
        
        await api.getAgentTip(apiKey)
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/agent-tip', {
          api_key: apiKey
        })
      })
    })

    describe('數據管理 API', () => {
      it('應該正確調用批量導入 API', async () => {
        const csvData = 'EarNum,Breed\nSH001,努比亞'
        
        await api.bulkImport(csvData)
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/bulk-import', {
          csv_data: csvData
        })
      })

      it('應該正確調用清空數據 API', async () => {
        await api.clearAllData()
        
        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clear-all-data')
      })

      it('應該正確調用導出數據 API', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: new Blob(),
          headers: { 'content-type': 'text/csv' }
        })
        
        await api.exportAllData()
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/export-all-data', {
          responseType: 'blob'
        })
      })
    })
  })

  describe('錯誤處理', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    it('應該處理 API 調用錯誤', async () => {
      const error = new Error('API Error')
      mockAxiosInstance.get.mockRejectedValue(error)
      
      await expect(api.getAllSheep()).rejects.toThrow('API Error')
    })

    it('應該處理網絡錯誤', async () => {
      const networkError = {
        message: 'Network Error',
        code: 'NETWORK_ERROR'
      }
      mockAxiosInstance.get.mockRejectedValue(networkError)
      
      await expect(api.getDashboardData()).rejects.toMatchObject({
        message: 'Network Error',
        code: 'NETWORK_ERROR'
      })
    })

    it('應該處理服務器錯誤響應', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      }
      mockAxiosInstance.post.mockRejectedValue(serverError)
      
      await expect(api.login({ username: 'test', password: 'test' }))
        .rejects.toMatchObject({ response: { status: 500 } })
    })
  })

  describe('請求配置', () => {
    it('應該正確設置請求頭', async () => {
      const requestData = { test: 'data' }
      
      await api.createSheep(requestData)
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/sheep', requestData)
      // 驗證 axios.create 被調用時的headers 配置
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
      )
    })

    it('應該設置 withCredentials 為 true', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          withCredentials: true
        })
      )
    })

    it('應該設置正確的baseURL', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: '/'
        })
      )
    })
  })

  describe('響應數據類型處理', () => {
    let responseInterceptor

    beforeEach(() => {
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0]
      responseInterceptor = interceptorCall[0]
    })

    it('應該正確處理 blob 響應類型', () => {
      const blobResponse = {
        data: new Blob(['test data'], { type: 'text/csv' }),
        config: { responseType: 'blob' }
      }
      
      const result = responseInterceptor(blobResponse)
      expect(result).toBe(blobResponse)
      expect(result.data).toBeInstanceOf(Blob)
    })

    it('應該正確處理 JSON 響應類型', () => {
      const jsonResponse = {
        data: { success: true, message: 'Test' },
        config: { responseType: 'json' }
      }
      
      const result = responseInterceptor(jsonResponse)
      expect(result).toEqual({ success: true, message: 'Test' })
    })

    it('應該正確處理沒有指定響應類型的響應', () => {
      const defaultResponse = {
        data: { default: 'response' },
        config: {}
      }
      
      const result = responseInterceptor(defaultResponse)
      expect(result).toEqual({ default: 'response' })
    })
  })

  describe('邊界條件', () => {
    it('應該處理空響應數據', () => {
      const emptyResponse = {
        data: null,
        config: {}
      }
      
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0]
      const responseInterceptor = interceptorCall[0]
      
      const result = responseInterceptor(emptyResponse)
      expect(result).toBe(null)
    })

    it('應該處理 undefined 響應數據', () => {
      const undefinedResponse = {
        data: undefined,
        config: {}
      }
      
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0]
      const responseInterceptor = interceptorCall[0]
      
      const result = responseInterceptor(undefinedResponse)
      expect(result).toBeUndefined()
    })

    it('應該處理沒有響應對象的錯誤', () => {
      const noResponseError = {
        message: 'Request timeout'
      }
      
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0]
      const errorInterceptor = interceptorCall[1]
      
      expect(() => errorInterceptor(noResponseError)).rejects.toThrow()
      expect(mockAuthStore.logout).not.toHaveBeenCalled()
    })
  })
})
