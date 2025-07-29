/**
 * ConsultationView 測試
 * @jest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia } from 'pinia'
import ConsultationView from './ConsultationView.vue'
import { useSettingsStore } from '../stores/settings'
import { useConsultationStore } from '../stores/consultation'
import { mountComponent } from '../tests/testUtils.js'
import api from '../api'

// Mock API
vi.mock('../api', () => ({
  default: {
    getSheepDetails: vi.fn()
  }
}))

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  }
}))

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  HelpFilled: 'help-filled-icon',
  Search: 'search-icon'
}))

// Mock utils
vi.mock('../utils', () => ({
  sexOptions: [
    { value: 'M', label: '公羊' },
    { value: 'F', label: '母羊' }
  ],
  breedCategoryOptions: [
    { value: 'dairy_goat', label: '乳用山羊' },
    { value: 'meat_goat', label: '肉用山羊' }
  ],
  statusOptions: [
    { value: 'maintenance', label: '維持期' },
    { value: 'growing_young', label: '生長前期' },
    { value: 'lactating_peak', label: '泌乳高峰期' },
    { value: 'gestating_early', label: '懷孕早期' },
    { value: 'other_status', label: '其他' }
  ],
  activityLevelOptions: [
    { value: 'low', label: '低' },
    { value: 'moderate', label: '中等' },
    { value: 'high', label: '高' }
  ],
  formatDateForInput: vi.fn(date => date)
}))

describe('ConsultationView', () => {
  let wrapper
  let pinia
  let settingsStore
  let consultationStore

  // Mock data
  const mockSheepData = {
    EarNum: 'SH001',
    Breed: '努比亞',
    Sex: 'F',
    BirthDate: '2023-01-15',
    Body_Weight_kg: 45.5,
    Age_Months: 12,
    breed_category: 'dairy_goat',
    status: 'lactating_peak'
  }

  beforeEach(() => {
    pinia = createPinia()
    
    wrapper = mountComponent(ConsultationView, {
      currentRoute: {
        path: '/consultation',
        name: 'Consultation',
        query: {}
      }
    })

    settingsStore = useSettingsStore()
    consultationStore = useConsultationStore()
    
    // 設定默認狀態
    settingsStore.apiKey = 'test-api-key'
    settingsStore.hasApiKey = true
    
    // 重置所有 mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('組件初始化', () => {
    it('應該正確渲染組件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.consultation-page').exists()).toBe(true)
      expect(wrapper.find('.page-title').text()).toContain('飼養建議諮詢')
    })

    it('應該顯示搜索區域', () => {
      expect(wrapper.find('.search-area').exists()).toBe(true)
      expect(wrapper.find('.el-input').exists()).toBe(true)
    })

    it('應該顯示表單', () => {
      expect(wrapper.find('.el-form').exists()).toBe(true)
    })
  })

  describe('URL 查詢參數處理', () => {
    it('應該在掛載時處理 URL 查詢參數', async () => {
      const loadSheepDataSpy = vi.spyOn(ConsultationView.methods || {}, 'loadSheepData')
      mockRoute.query.earNum = 'SH001'
      
      const wrapperWithQuery = mount(ConsultationView, {
        global: {
          plugins: [pinia],
          mocks: {
            $route: mockRoute,
            $router: mockRouter
          },
          stubs: {
            'el-card': { template: '<div><slot /></div>' },
            'el-form': { template: '<form><slot /></form>' }
          }
        }
      })
      
      expect(wrapperWithQuery.vm.earNumInput).toBe('SH001')
      expect(mockRouter.replace).toHaveBeenCalledWith({ query: {} })
    })
  })

  describe('羊隻數據加載', () => {
    it('應該成功加載羊隻數據', async () => {
      const { ElMessage } = await import('element-plus')
      const { formatDateForInput } = await import('../utils')
      
      api.getSheepDetails.mockResolvedValue(mockSheepData)
      formatDateForInput.mockReturnValue('2023-01-15')
      
      const setFormDataSpy = vi.spyOn(consultationStore, 'setFormData')
      
      wrapper.vm.earNumInput = 'SH001'
      await wrapper.vm.loadSheepData()
      
      expect(api.getSheepDetails).toHaveBeenCalledWith('SH001')
      expect(setFormDataSpy).toHaveBeenCalledWith({
        ...mockSheepData,
        BirthDate: '2023-01-15'
      })
      expect(ElMessage.success).toHaveBeenCalledWith('已成功載入耳號 SH001 的資料')
      expect(wrapper.vm.formLoading).toBe(false)
    })

    it('應該處理加載數據失敗', async () => {
      const { ElMessage } = await import('element-plus')
      const error = { error: '羊隻不存在' }
      
      api.getSheepDetails.mockRejectedValue(error)
      const resetSpy = vi.spyOn(consultationStore, 'reset')
      
      wrapper.vm.earNumInput = 'INVALID'
      await wrapper.vm.loadSheepData()
      
      expect(ElMessage.error).toHaveBeenCalledWith('載入資料失敗: 羊隻不存在')
      expect(resetSpy).toHaveBeenCalled()
      expect(consultationStore.form.EarNum).toBe('INVALID')
      expect(wrapper.vm.formLoading).toBe(false)
    })

    it('應該驗證耳號輸入', async () => {
      const { ElMessage } = await import('element-plus')
      
      wrapper.vm.earNumInput = ''
      await wrapper.vm.loadSheepData()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('請輸入要查詢的耳號')
      expect(api.getSheepDetails).not.toHaveBeenCalled()
    })

    it('應該在加載期間顯示加載狀態', async () => {
      api.getSheepDetails.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(mockSheepData), 100)
      }))
      
      wrapper.vm.earNumInput = 'SH001'
      const loadPromise = wrapper.vm.loadSheepData()
      
      expect(wrapper.vm.formLoading).toBe(true)
      await loadPromise
      expect(wrapper.vm.formLoading).toBe(false)
    })
  })

  describe('建議獲取', () => {
    beforeEach(() => {
      // 設置表單數據
      consultationStore.form = {
        ...mockSheepData,
        optimization_goal: 'balanced'
      }
    })

    it('應該成功獲取建議', async () => {
      const getRecommendationSpy = vi.spyOn(consultationStore, 'getRecommendation')
      
      await wrapper.vm.handleGetRecommendation()
      
      expect(getRecommendationSpy).toHaveBeenCalledWith('test-api-key')
    })

    it('應該檢查 API 金鑰', async () => {
      const { ElMessage } = await import('element-plus')
      settingsStore.hasApiKey = false
      
      await wrapper.vm.handleGetRecommendation()
      
      expect(ElMessage.error).toHaveBeenCalledWith('請先在「系統設定」中設定並測試有效的 API 金鑰')
    })

    it('應該處理表單驗證失敗', async () => {
      const { ElMessage } = await import('element-plus')
      
      // Mock 表單驗證失敗
      wrapper.vm.$refs.formRef = {
        validate: vi.fn((callback) => callback(false))
      }
      
      await wrapper.vm.handleGetRecommendation()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('請檢查表單必填項是否已填寫')
    })
  })

  describe('表單重置', () => {
    it('應該重置表單和輸入', () => {
      const resetSpy = vi.spyOn(consultationStore, 'reset')
      
      wrapper.vm.earNumInput = 'SH001'
      wrapper.vm.handleResetForm()
      
      expect(wrapper.vm.earNumInput).toBe('')
      expect(resetSpy).toHaveBeenCalled()
    })
  })

  describe('動態表單顯示', () => {
    beforeEach(() => {
      consultationStore.form.status = 'maintenance'
    })

    it('應該根據生理狀態顯示生長參數', async () => {
      consultationStore.form.status = 'growing_young'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isGrowing).toBe(true)
      expect(wrapper.vm.showProductionParams).toBe(true)
    })

    it('應該根據生理狀態顯示泌乳參數', async () => {
      consultationStore.form.status = 'lactating_peak'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isLactating).toBe(true)
      expect(wrapper.vm.showProductionParams).toBe(true)
    })

    it('應該根據生理狀態顯示懷孕參數', async () => {
      consultationStore.form.status = 'gestating_early'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isGestating).toBe(true)
      expect(wrapper.vm.showProductionParams).toBe(true)
    })

    it('應該隱藏非相關的生產參數', async () => {
      consultationStore.form.status = 'maintenance'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.isGrowing).toBe(false)
      expect(wrapper.vm.isLactating).toBe(false)
      expect(wrapper.vm.isGestating).toBe(false)
      expect(wrapper.vm.showProductionParams).toBe(false)
    })
  })

  describe('表單驗證規則', () => {
    it('應該有必要的驗證規則', () => {
      const rules = wrapper.vm.rules
      
      expect(rules.EarNum).toBeDefined()
      expect(rules.Body_Weight_kg).toBeDefined()
      expect(rules.Age_Months).toBeDefined()
      expect(rules.breed_category).toBeDefined()
      expect(rules.status).toBeDefined()
      
      expect(rules.EarNum[0].required).toBe(true)
      expect(rules.Body_Weight_kg[0].required).toBe(true)
      expect(rules.Age_Months[0].required).toBe(true)
      expect(rules.breed_category[0].required).toBe(true)
      expect(rules.status[0].required).toBe(true)
    })
  })

  describe('結果顯示', () => {
    it('應該在有結果時顯示結果區域', async () => {
      consultationStore.resultHtml = '<p>測試建議</p>'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.results-area').exists()).toBe(true)
      expect(wrapper.find('.results-title').text()).toContain('領頭羊博士的綜合建議')
    })

    it('應該在加載時顯示結果區域', async () => {
      consultationStore.isLoading = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.results-area').exists()).toBe(true)
    })

    it('應該在沒有結果且未加載時隱藏結果區域', async () => {
      consultationStore.resultHtml = ''
      consultationStore.isLoading = false
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.results-area').exists()).toBe(false)
    })
  })

  describe('用戶界面交互', () => {
    it('應該支持按 Enter 鍵加載羊隻數據', async () => {
      const loadSheepDataSpy = vi.spyOn(wrapper.vm, 'loadSheepData')
      
      const input = wrapper.find('.search-area input')
      await input.trigger('keyup.enter')
      
      expect(loadSheepDataSpy).toHaveBeenCalled()
    })

    it('應該支持點擊按鈕加載羊隻數據', async () => {
      const loadSheepDataSpy = vi.spyOn(wrapper.vm, 'loadSheepData')
      
      const button = wrapper.find('.search-area button')
      await button.trigger('click')
      
      expect(loadSheepDataSpy).toHaveBeenCalled()
    })

    it('應該支持點擊獲取建議按鈕', async () => {
      const handleGetRecommendationSpy = vi.spyOn(wrapper.vm, 'handleGetRecommendation')
      
      const button = wrapper.find('button[type="primary"]')
      await button.trigger('click')
      
      expect(handleGetRecommendationSpy).toHaveBeenCalled()
    })

    it('應該支持點擊重設按鈕', async () => {
      const handleResetFormSpy = vi.spyOn(wrapper.vm, 'handleResetForm')
      
      const buttons = wrapper.findAll('button')
      const resetButton = buttons.find(button => button.text().includes('重設'))
      await resetButton.trigger('click')
      
      expect(handleResetFormSpy).toHaveBeenCalled()
    })
  })

  describe('邊界條件處理', () => {
    it('應該處理空的羊隻數據響應', async () => {
      api.getSheepDetails.mockResolvedValue({})
      const setFormDataSpy = vi.spyOn(consultationStore, 'setFormData')
      
      wrapper.vm.earNumInput = 'SH001'
      await wrapper.vm.loadSheepData()
      
      expect(setFormDataSpy).toHaveBeenCalledWith({ BirthDate: undefined })
    })

    it('應該處理網絡錯誤', async () => {
      const { ElMessage } = await import('element-plus')
      const networkError = new Error('Network Error')
      
      api.getSheepDetails.mockRejectedValue(networkError)
      
      wrapper.vm.earNumInput = 'SH001'
      await wrapper.vm.loadSheepData()
      
      expect(ElMessage.error).toHaveBeenCalledWith('載入資料失敗: Network Error')
    })

    it('應該處理特殊字符的耳號', async () => {
      const { ElMessage } = await import('element-plus')
      api.getSheepDetails.mockResolvedValue({ ...mockSheepData, EarNum: 'SH-001@#$' })
      
      wrapper.vm.earNumInput = 'SH-001@#$'
      await wrapper.vm.loadSheepData()
      
      expect(api.getSheepDetails).toHaveBeenCalledWith('SH-001@#$')
      expect(ElMessage.success).toHaveBeenCalled()
    })
  })
})
