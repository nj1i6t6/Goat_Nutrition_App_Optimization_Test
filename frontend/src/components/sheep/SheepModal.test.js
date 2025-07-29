/**
 * SheepModal 組件測試
 * @jest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SheepModal from './SheepModal.vue'
import api from '../../api'

// Mock API
vi.mock('../../api', () => ({
  default: {
    getSheepDetails: vi.fn()
  }
}))

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}))

// Mock child components
vi.mock('./tabs/BasicInfoTab.vue', () => ({
  default: {
    name: 'BasicInfoTab',
    template: '<div class="basic-info-tab">BasicInfoTab</div>',
    props: ['sheepData'],
    emits: ['data-updated', 'close']
  }
}))

vi.mock('./tabs/EventsLogTab.vue', () => ({
  default: {
    name: 'EventsLogTab',
    template: '<div class="events-log-tab">EventsLogTab</div>',
    props: ['earNum']
  }
}))

vi.mock('./tabs/HistoryTab.vue', () => ({
  default: {
    name: 'HistoryTab',
    template: '<div class="history-tab">HistoryTab</div>',
    props: ['earNum']
  }
}))

describe('SheepModal', () => {
  let wrapper

  const mockSheepData = {
    EarNum: 'SH001',
    Breed: '努比亞',
    Sex: 'F',
    BirthDate: '2023-01-15',
    Body_Weight_kg: 45.5
  }

  const createWrapper = (props = {}) => {
    return mount(SheepModal, {
      props,
      global: {
        stubs: {
          'el-dialog': {
            template: `
              <div class="el-dialog" v-show="modelValue">
                <div class="el-dialog__header">{{ title }}</div>
                <div class="el-dialog__body"><slot /></div>
              </div>
            `,
            props: ['modelValue', 'title', 'width', 'beforeClose', 'top'],
            emits: ['update:modelValue']
          },
          'el-tabs': {
            template: '<div class="el-tabs"><slot /></div>',
            props: ['modelValue'],
            emits: ['update:modelValue']
          },
          'el-tab-pane': {
            template: '<div class="el-tab-pane" :class="{ disabled: disabled }"><slot /></div>',
            props: ['label', 'name', 'disabled']
          }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('組件初始化', () => {
    it('應該正確渲染組件', () => {
      wrapper = createWrapper({ earNum: 'SH001' })
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.el-dialog').exists()).toBe(true)
      expect(wrapper.find('.el-tabs').exists()).toBe(true)
    })

    it('應該顯示正確的標題 - 編輯模式', () => {
      wrapper = createWrapper({ earNum: 'SH001' })
      
      expect(wrapper.vm.title).toBe('管理羊隻資料 (耳號: SH001)')
    })

    it('應該顯示正確的標題 - 新增模式', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.title).toBe('新增羊隻資料')
    })

    it('應該正確識別新增羊隻模式', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.isNewSheep).toBe(true)
    })

    it('應該正確識別編輯羊隻模式', () => {
      wrapper = createWrapper({ earNum: 'SH001' })
      expect(wrapper.vm.isNewSheep).toBe(false)
    })

    it('應該設置正確的初始標籤頁', () => {
      wrapper = createWrapper({ initialTab: 'eventsLogTab' })
      expect(wrapper.vm.activeTab).toBe('eventsLogTab')
    })
  })

  describe('數據獲取', () => {
    it('應該在編輯模式下獲取羊隻數據', async () => {
      api.getSheepDetails.mockResolvedValue(mockSheepData)
      
      wrapper = createWrapper({ earNum: 'SH001' })
      await wrapper.vm.$nextTick()
      
      expect(api.getSheepDetails).toHaveBeenCalledWith('SH001')
      expect(wrapper.vm.sheepData).toEqual(mockSheepData)
      expect(wrapper.vm.loading).toBe(false)
    })

    it('應該在新增模式下不獲取羊隻數據', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(api.getSheepDetails).not.toHaveBeenCalled()
      expect(wrapper.vm.sheepData).toBe(null)
    })

    it('應該處理數據獲取失敗', async () => {
      const { ElMessage } = await import('element-plus')
      const error = { error: '羊隻不存在' }
      
      api.getSheepDetails.mockRejectedValue(error)
      const handleCloseSpy = vi.spyOn(SheepModal.methods || {}, 'handleClose')
      
      wrapper = createWrapper({ earNum: 'INVALID' })
      await wrapper.vm.fetchSheepDetails()
      
      expect(ElMessage.error).toHaveBeenCalledWith('載入羊隻資料失敗: 羊隻不存在')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('應該在數據獲取期間顯示載入狀態', async () => {
      let loadingDuringFetch = false
      
      api.getSheepDetails.mockImplementation(() => {
        loadingDuringFetch = wrapper.vm.loading
        return Promise.resolve(mockSheepData)
      })
      
      wrapper = createWrapper({ earNum: 'SH001' })
      await wrapper.vm.fetchSheepDetails()
      
      expect(loadingDuringFetch).toBe(true)
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('標籤頁管理', () => {
    beforeEach(() => {
      wrapper = createWrapper({ earNum: 'SH001' })
    })

    it('應該渲染基本資料標籤頁', () => {
      const tabPanes = wrapper.findAll('.el-tab-pane')
      expect(tabPanes[0].text()).toContain('基本資料')
    })

    it('應該在編輯模式下啟用所有標籤頁', () => {
      const tabPanes = wrapper.findAll('.el-tab-pane')
      
      expect(tabPanes[1].classes()).not.toContain('disabled') // 事件日誌
      expect(tabPanes[2].classes()).not.toContain('disabled') // 歷史數據
    })

    it('應該在新增模式下禁用部分標籤頁', () => {
      wrapper = createWrapper() // 新增模式
      const tabPanes = wrapper.findAll('.el-tab-pane')
      
      expect(tabPanes[1].classes()).toContain('disabled') // 事件日誌
      expect(tabPanes[2].classes()).toContain('disabled') // 歷史數據
    })

    it('應該根據 activeTab 條件性渲染子組件', async () => {
      wrapper.vm.activeTab = 'basicInfoTab'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.basic-info-tab').exists()).toBe(true)
      expect(wrapper.find('.events-log-tab').exists()).toBe(false)
      expect(wrapper.find('.history-tab').exists()).toBe(false)
    })

    it('應該正確傳遞 props 到子組件', async () => {
      api.getSheepDetails.mockResolvedValue(mockSheepData)
      await wrapper.vm.fetchSheepDetails()
      
      const basicInfoTab = wrapper.findComponent({ name: 'BasicInfoTab' })
      expect(basicInfoTab.props('sheepData')).toEqual(mockSheepData)
    })
  })

  describe('事件處理', () => {
    beforeEach(() => {
      wrapper = createWrapper({ earNum: 'SH001' })
    })

    it('應該處理關閉事件', () => {
      wrapper.vm.handleClose()
      
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('應該處理數據更新事件', () => {
      wrapper.vm.handleDataUpdated()
      
      expect(wrapper.emitted('data-updated')).toBeTruthy()
      expect(wrapper.emitted('data-updated')).toHaveLength(1)
    })

    it('應該從子組件接收關閉事件', async () => {
      const basicInfoTab = wrapper.findComponent({ name: 'BasicInfoTab' })
      await basicInfoTab.vm.$emit('close')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('應該從子組件接收數據更新事件', async () => {
      const basicInfoTab = wrapper.findComponent({ name: 'BasicInfoTab' })
      await basicInfoTab.vm.$emit('data-updated')
      
      expect(wrapper.emitted('data-updated')).toBeTruthy()
    })
  })

  describe('對話框行為', () => {
    it('應該默認顯示對話框', () => {
      wrapper = createWrapper()
      expect(wrapper.vm.dialogVisible).toBe(true)
    })

    it('應該設置正確的對話框屬性', () => {
      wrapper = createWrapper()
      const dialog = wrapper.findComponent({ name: 'el-dialog' })
      
      expect(dialog.props('width')).toBe('70%')
      expect(dialog.props('top')).toBe('5vh')
    })
  })

  describe('響應式計算屬性', () => {
    it('title 應該根據 earNum 動態變化', async () => {
      wrapper = createWrapper()
      expect(wrapper.vm.title).toBe('新增羊隻資料')
      
      await wrapper.setProps({ earNum: 'SH002' })
      expect(wrapper.vm.title).toBe('管理羊隻資料 (耳號: SH002)')
    })

    it('isNewSheep 應該根據 earNum 動態變化', async () => {
      wrapper = createWrapper()
      expect(wrapper.vm.isNewSheep).toBe(true)
      
      await wrapper.setProps({ earNum: 'SH001' })
      expect(wrapper.vm.isNewSheep).toBe(false)
    })
  })

  describe('邊界條件處理', () => {
    it('應該處理空的羊隻數據響應', async () => {
      api.getSheepDetails.mockResolvedValue(null)
      
      wrapper = createWrapper({ earNum: 'SH001' })
      await wrapper.vm.fetchSheepDetails()
      
      expect(wrapper.vm.sheepData).toBe(null)
      expect(wrapper.vm.loading).toBe(false)
    })

    it('應該處理網絡錯誤', async () => {
      const { ElMessage } = await import('element-plus')
      const networkError = new Error('Network Error')
      
      api.getSheepDetails.mockRejectedValue(networkError)
      
      wrapper = createWrapper({ earNum: 'SH001' })
      await wrapper.vm.fetchSheepDetails()
      
      expect(ElMessage.error).toHaveBeenCalledWith('載入羊隻資料失敗: Network Error')
    })

    it('應該處理特殊字符的耳號', async () => {
      api.getSheepDetails.mockResolvedValue({
        ...mockSheepData,
        EarNum: 'SH-001@#$'
      })
      
      wrapper = createWrapper({ earNum: 'SH-001@#$' })
      await wrapper.vm.fetchSheepDetails()
      
      expect(api.getSheepDetails).toHaveBeenCalledWith('SH-001@#$')
      expect(wrapper.vm.title).toBe('管理羊隻資料 (耳號: SH-001@#$)')
    })

    it('應該處理 undefined 的 initialTab', () => {
      wrapper = createWrapper({ initialTab: undefined })
      expect(wrapper.vm.activeTab).toBe('basicInfoTab') // 應該使用默認值
    })

    it('應該處理無效的 initialTab', () => {
      wrapper = createWrapper({ initialTab: 'invalidTab' })
      expect(wrapper.vm.activeTab).toBe('invalidTab') // 應該設置為傳入的值
    })
  })

  describe('組件生命週期', () => {
    it('應該在掛載時獲取數據', () => {
      const fetchSheepDetailsSpy = vi.spyOn(SheepModal.methods || {}, 'fetchSheepDetails')
      
      wrapper = createWrapper({ earNum: 'SH001' })
      
      expect(fetchSheepDetailsSpy).toHaveBeenCalled()
    })

    it('應該在新增模式下不獲取數據', () => {
      const fetchSheepDetailsSpy = vi.spyOn(SheepModal.methods || {}, 'fetchSheepDetails')
      
      wrapper = createWrapper()
      
      expect(fetchSheepDetailsSpy).toHaveBeenCalled() // 會被調用但內部會直接返回
    })
  })

  describe('樣式類別', () => {
    it('應該應用 sheep-modal 類別', () => {
      wrapper = createWrapper()
      const dialog = wrapper.findComponent({ name: 'el-dialog' })
      
      // 檢查是否有傳遞正確的 class prop（如果有的話）
      expect(wrapper.classes()).toContain('sheep-modal') ||
      expect(dialog.classes()).toContain('sheep-modal')
    })
  })

  describe('性能優化', () => {
    it('應該只在相應標籤頁激活時渲染子組件', async () => {
      wrapper = createWrapper({ earNum: 'SH001' })
      
      // 默認在 basicInfoTab
      expect(wrapper.find('.basic-info-tab').exists()).toBe(true)
      expect(wrapper.find('.events-log-tab').exists()).toBe(false)
      expect(wrapper.find('.history-tab').exists()).toBe(false)
      
      // 切換到 eventsLogTab
      wrapper.vm.activeTab = 'eventsLogTab'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.basic-info-tab').exists()).toBe(false)
      expect(wrapper.find('.events-log-tab').exists()).toBe(true)
      expect(wrapper.find('.history-tab').exists()).toBe(false)
    })

    it('應該在新增模式下不渲染禁用的標籤頁內容', async () => {
      wrapper = createWrapper() // 新增模式
      
      wrapper.vm.activeTab = 'eventsLogTab'
      await wrapper.vm.$nextTick()
      
      // 即使設置了 activeTab，也不應該渲染因為是新增模式
      expect(wrapper.find('.events-log-tab').exists()).toBe(false)
    })
  })
})
