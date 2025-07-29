import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsView from './SettingsView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage } from 'element-plus'

// Mock Element Plus message and icons
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))

vi.mock('@element-plus/icons-vue', () => ({
  Setting: { template: '<span>Setting</span>' },
  Plus: { template: '<span>Plus</span>' },
  Delete: { template: '<span>Delete</span>' }
}))

// 創建 mock API 工廠
const createMockApi = () => ({
  getAgentTip: vi.fn(),
  getEventOptions: vi.fn(),
  addEventType: vi.fn(),
  deleteEventType: vi.fn(),
  addEventDescription: vi.fn(),
  deleteEventDescription: vi.fn()
})

// Mock API
vi.mock('../api', () => ({
  default: createMockApi()
}))

describe('SettingsView', () => {
  let wrapper
  let pinia
  let api

  const createWrapper = () => {
    return mount(SettingsView, {
      global: {
        plugins: [pinia]
      }
    })
  }

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Import API after mocking
    api = (await import('../api')).default
    
    // Set up default mock returns
    api.getAgentTip.mockResolvedValue('這是一個測試提示')
    api.getEventOptions.mockResolvedValue({
      types: ['疫苗接種', '健康檢查', '配種'],
      descriptions: {
        '疫苗接種': ['第一劑疫苗', '第二劑疫苗', '年度疫苗'],
        '健康檢查': ['定期檢查', '疾病診斷'],
        '配種': ['人工配種', '自然配種']
      }
    })
  })

  describe('組件初始化', () => {
    it('應該正確渲染組件', () => {
      wrapper = createWrapper()
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.settings-view').exists()).toBe(true)
    })

    it('應該顯示所有設置區域', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.api-key-section').exists()).toBe(true)
      expect(wrapper.find('.agent-tip-section').exists()).toBe(true)
      expect(wrapper.find('.event-management-section').exists()).toBe(true)
    })

    it('應該在掛載時加載數據', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(api.getAgentTip).toHaveBeenCalled()
      expect(api.getEventOptions).toHaveBeenCalled()
    })

    it('應該初始化表單狀態', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.apiKey).toBe('')
      expect(wrapper.vm.agentTip).toBe('')
      expect(wrapper.vm.eventTypes).toEqual([])
      expect(wrapper.vm.eventDescriptions).toEqual({})
    })
  })

  describe('API Key 管理', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('應該支持輸入 API Key', async () => {
      const apiKeyInput = wrapper.find('input[placeholder*="API"]')
      
      await apiKeyInput.setValue('test-api-key-123')
      
      expect(wrapper.vm.apiKey).toBe('test-api-key-123')
    })

    it('應該支持保存 API Key', async () => {
      wrapper.vm.apiKey = 'test-api-key-123'
      
      const saveButton = wrapper.find('.save-api-key-button')
      await saveButton.trigger('click')
      
      // 應該保存到 localStorage
      expect(localStorage.getItem('apiKey')).toBe('test-api-key-123')
      expect(ElMessage.success).toHaveBeenCalledWith('API Key 保存成功')
    })

    it('應該驗證 API Key 格式', async () => {
      wrapper.vm.apiKey = 'invalid-key'
      
      const saveButton = wrapper.find('.save-api-key-button')
      await saveButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('請輸入有效的 API Key')
    })

    it('應該支持清除 API Key', async () => {
      wrapper.vm.apiKey = 'test-api-key-123'
      
      const clearButton = wrapper.find('.clear-api-key-button')
      await clearButton.trigger('click')
      
      expect(wrapper.vm.apiKey).toBe('')
      expect(localStorage.getItem('apiKey')).toBeNull()
      expect(ElMessage.success).toHaveBeenCalledWith('API Key 已清除')
    })

    it('應該在頁面加載時從 localStorage 讀取 API Key', () => {
      localStorage.setItem('apiKey', 'stored-api-key')
      
      wrapper = createWrapper()
      
      expect(wrapper.vm.apiKey).toBe('stored-api-key')
    })

    it('應該隱藏 API Key 顯示', () => {
      wrapper.vm.apiKey = 'test-api-key-123'
      wrapper.vm.$nextTick()
      
      const apiKeyDisplay = wrapper.find('.api-key-display')
      expect(apiKeyDisplay.text()).toContain('****')
    })

    it('應該支持顯示/隱藏 API Key', async () => {
      wrapper.vm.apiKey = 'test-api-key-123'
      
      const toggleButton = wrapper.find('.toggle-api-key-visibility')
      await toggleButton.trigger('click')
      
      expect(wrapper.vm.showApiKey).toBe(true)
    })
  })

  describe('智慧代理提示管理', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
    })

    it('應該顯示當前代理提示', () => {
      expect(wrapper.vm.agentTip).toBe('這是一個測試提示')
      
      const tipDisplay = wrapper.find('.agent-tip-display')
      expect(tipDisplay.text()).toContain('這是一個測試提示')
    })

    it('應該支持編輯代理提示', async () => {
      const editButton = wrapper.find('.edit-tip-button')
      await editButton.trigger('click')
      
      expect(wrapper.vm.isEditingTip).toBe(true)
      
      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
    })

    it('應該支持保存代理提示', async () => {
      wrapper.vm.isEditingTip = true
      wrapper.vm.editingTip = '這是新的代理提示'
      
      api.updateAgentTip = vi.fn().mockResolvedValue({ success: true })
      
      const saveButton = wrapper.find('.save-tip-button')
      await saveButton.trigger('click')
      
      expect(api.updateAgentTip).toHaveBeenCalledWith('這是新的代理提示')
      expect(wrapper.vm.agentTip).toBe('這是新的代理提示')
      expect(wrapper.vm.isEditingTip).toBe(false)
      expect(ElMessage.success).toHaveBeenCalledWith('代理提示更新成功')
    })

    it('應該支持取消編輯', async () => {
      wrapper.vm.isEditingTip = true
      wrapper.vm.editingTip = '修改中的提示'
      
      const cancelButton = wrapper.find('.cancel-edit-button')
      await cancelButton.trigger('click')
      
      expect(wrapper.vm.isEditingTip).toBe(false)
      expect(wrapper.vm.editingTip).toBe('')
    })

    it('應該驗證提示內容長度', async () => {
      wrapper.vm.isEditingTip = true
      wrapper.vm.editingTip = 'x'.repeat(2001) // 超過限制
      
      const saveButton = wrapper.find('.save-tip-button')
      await saveButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('提示內容不能超過 2000 字符')
    })

    it('應該處理代理提示更新失敗', async () => {
      wrapper.vm.isEditingTip = true
      wrapper.vm.editingTip = '新的提示'
      
      api.updateAgentTip = vi.fn().mockRejectedValue(new Error('更新失敗'))
      
      const saveButton = wrapper.find('.save-tip-button')
      await saveButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('更新失敗: 更新失敗')
    })
  })

  describe('事件類型管理', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
    })

    it('應該顯示現有事件類型', () => {
      expect(wrapper.vm.eventTypes).toEqual(['疫苗接種', '健康檢查', '配種'])
      
      const typeList = wrapper.findAll('.event-type-item')
      expect(typeList.length).toBe(3)
    })

    it('應該支持添加新事件類型', async () => {
      const newTypeInput = wrapper.find('.new-type-input')
      await newTypeInput.setValue('新事件類型')
      
      api.addEventType.mockResolvedValue({ success: true })
      
      const addButton = wrapper.find('.add-type-button')
      await addButton.trigger('click')
      
      expect(api.addEventType).toHaveBeenCalledWith('新事件類型')
      expect(ElMessage.success).toHaveBeenCalledWith('事件類型添加成功')
    })

    it('應該驗證事件類型名稱', async () => {
      const newTypeInput = wrapper.find('.new-type-input')
      await newTypeInput.setValue('')
      
      const addButton = wrapper.find('.add-type-button')
      await addButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('請輸入事件類型名稱')
    })

    it('應該防止添加重複的事件類型', async () => {
      const newTypeInput = wrapper.find('.new-type-input')
      await newTypeInput.setValue('疫苗接種') // 已存在的類型
      
      const addButton = wrapper.find('.add-type-button')
      await addButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('該事件類型已存在')
    })

    it('應該支持刪除事件類型', async () => {
      api.deleteEventType.mockResolvedValue({ success: true })
      
      const deleteButton = wrapper.find('.delete-type-button')
      await deleteButton.trigger('click')
      
      expect(api.deleteEventType).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('事件類型刪除成功')
    })

    it('應該處理事件類型操作失敗', async () => {
      api.addEventType.mockRejectedValue(new Error('添加失敗'))
      
      const newTypeInput = wrapper.find('.new-type-input')
      await newTypeInput.setValue('新事件類型')
      
      const addButton = wrapper.find('.add-type-button')
      await addButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('添加失敗: 添加失敗')
    })
  })

  describe('事件描述管理', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
    })

    it('應該顯示各事件類型的描述', () => {
      const descriptions = wrapper.vm.eventDescriptions
      
      expect(descriptions['疫苗接種']).toEqual(['第一劑疫苗', '第二劑疫苗', '年度疫苗'])
      expect(descriptions['健康檢查']).toEqual(['定期檢查', '疾病診斷'])
    })

    it('應該支持為事件類型添加描述', async () => {
      const newDescInput = wrapper.find('.new-description-input')
      await newDescInput.setValue('新的疫苗描述')
      
      // 選擇疫苗接種類型
      wrapper.vm.selectedEventType = '疫苗接種'
      
      api.addEventDescription.mockResolvedValue({ success: true })
      
      const addDescButton = wrapper.find('.add-description-button')
      await addDescButton.trigger('click')
      
      expect(api.addEventDescription).toHaveBeenCalledWith('疫苗接種', '新的疫苗描述')
      expect(ElMessage.success).toHaveBeenCalledWith('事件描述添加成功')
    })

    it('應該支持刪除事件描述', async () => {
      api.deleteEventDescription.mockResolvedValue({ success: true })
      
      const deleteDescButton = wrapper.find('.delete-description-button')
      await deleteDescButton.trigger('click')
      
      expect(api.deleteEventDescription).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalledWith('事件描述刪除成功')
    })

    it('應該驗證事件描述輸入', async () => {
      const newDescInput = wrapper.find('.new-description-input')
      await newDescInput.setValue('')
      
      const addDescButton = wrapper.find('.add-description-button')
      await addDescButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('請輸入事件描述')
    })

    it('應該防止添加重複的事件描述', async () => {
      wrapper.vm.selectedEventType = '疫苗接種'
      
      const newDescInput = wrapper.find('.new-description-input')
      await newDescInput.setValue('第一劑疫苗') // 已存在的描述
      
      const addDescButton = wrapper.find('.add-description-button')
      await addDescButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('該事件描述已存在')
    })
  })

  describe('數據加載和錯誤處理', () => {
    it('應該處理代理提示加載失敗', async () => {
      api.getAgentTip.mockRejectedValue(new Error('加載失敗'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith('加載代理提示失敗: 加載失敗')
    })

    it('應該處理事件選項加載失敗', async () => {
      api.getEventOptions.mockRejectedValue(new Error('加載失敗'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith('加載事件選項失敗: 加載失敗')
    })

    it('應該在加載時顯示加載狀態', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.loading).toBe(true)
      
      const loadingElement = wrapper.find('.loading')
      expect(loadingElement.exists()).toBe(true)
    })

    it('應該在加載完成後隱藏加載狀態', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('表單驗證', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('應該驗證 API Key 長度', async () => {
      wrapper.vm.apiKey = '123' // 太短
      
      const saveButton = wrapper.find('.save-api-key-button')
      await saveButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('API Key 長度不足')
    })

    it('應該驗證事件類型名稱長度', async () => {
      const longName = 'x'.repeat(51) // 超過限制
      
      const newTypeInput = wrapper.find('.new-type-input')
      await newTypeInput.setValue(longName)
      
      const addButton = wrapper.find('.add-type-button')
      await addButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('事件類型名稱不能超過 50 字符')
    })

    it('應該驗證事件描述長度', async () => {
      const longDesc = 'x'.repeat(201) // 超過限制
      wrapper.vm.selectedEventType = '疫苗接種'
      
      const newDescInput = wrapper.find('.new-description-input')
      await newDescInput.setValue(longDesc)
      
      const addDescButton = wrapper.find('.add-description-button')
      await addDescButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalledWith('事件描述不能超過 200 字符')
    })
  })

  describe('用戶界面', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('應該支持摺疊/展開設置區域', async () => {
      const collapseButton = wrapper.find('.collapse-button')
      
      expect(wrapper.vm.collapsed.apiKey).toBe(false)
      
      await collapseButton.trigger('click')
      
      expect(wrapper.vm.collapsed.apiKey).toBe(true)
    })

    it('應該顯示設置項的幫助信息', () => {
      const helpIcons = wrapper.findAll('.help-icon')
      expect(helpIcons.length).toBeGreaterThan(0)
      
      const tooltips = wrapper.findAll('.tooltip')
      expect(tooltips.length).toBeGreaterThan(0)
    })

    it('應該支持鍵盤快捷鍵', async () => {
      const apiKeyInput = wrapper.find('input[placeholder*="API"]')
      
      await apiKeyInput.setValue('test-key')
      await apiKeyInput.trigger('keyup.enter')
      
      // 應該觸發保存
      expect(localStorage.getItem('apiKey')).toBe('test-key')
    })

    it('應該響應式佈局', () => {
      // 模擬小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      })
      
      window.dispatchEvent(new Event('resize'))
      
      expect(wrapper.vm.isMobile).toBe(true)
      
      const mobileLayout = wrapper.find('.mobile-layout')
      expect(mobileLayout.exists()).toBe(true)
    })
  })

  describe('邊界條件', () => {
    it('應該處理空的事件選項響應', async () => {
      api.getEventOptions.mockResolvedValue({
        types: [],
        descriptions: {}
      })
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.eventTypes).toEqual([])
      expect(wrapper.vm.eventDescriptions).toEqual({})
    })

    it('應該處理無效的 API 響應', async () => {
      api.getAgentTip.mockResolvedValue(null)
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.agentTip).toBe('')
    })

    it('應該處理特殊字符的輸入', async () => {
      const specialChars = '特殊字符!@#$%^&*()'
      
      const newTypeInput = wrapper.find('.new-type-input')
      await newTypeInput.setValue(specialChars)
      
      api.addEventType.mockResolvedValue({ success: true })
      
      const addButton = wrapper.find('.add-type-button')
      await addButton.trigger('click')
      
      expect(api.addEventType).toHaveBeenCalledWith(specialChars)
    })

    it('應該處理網絡超時', async () => {
      api.getAgentTip.mockRejectedValue(new Error('timeout'))
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(ElMessage.error).toHaveBeenCalledWith(
        expect.stringContaining('timeout')
      )
    })
  })
})
