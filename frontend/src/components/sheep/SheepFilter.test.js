/**
 * SheepFilter.vue 組件測試
 * 測試羊隻篩選器的互動功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SheepFilter from '@/components/sheep/SheepFilter.vue'
import { useSheepStore } from '@/stores/sheep'

// 模擬 utils
vi.mock('@/utils', () => ({
  sexOptions: [
    { label: '公羊', value: '公' },
    { label: '母羊', value: '母' },
  ],
  breedCategoryOptions: [
    { label: '乳用羊', value: '乳用' },
    { label: '肉用羊', value: '肉用' },
  ],
  statusOptions: [
    { label: '懷孕', value: '懷孕' },
    { label: '哺乳', value: '哺乳' },
  ],
}))

// 模擬 Element Plus 圖標
vi.mock('@element-plus/icons-vue', () => ({
  Search: 'search-icon',
}))

describe('SheepFilter', () => {
  let wrapper
  let sheepStore
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    sheepStore = useSheepStore()
    
    // 設置模擬的篩選選項 - 直接更新 reactive 資料
    sheepStore.sheepList = [
      { EarNum: 'A001', Breed: '波爾羊', FarmNum: 'F001' },
      { EarNum: 'A002', Breed: '台灣黑山羊', FarmNum: 'F001' },
      { EarNum: 'A003', Breed: '努比亞羊', FarmNum: 'F002' },
    ]

    wrapper = mount(SheepFilter, {
      global: {
        plugins: [pinia],
      },
    })
  })

  describe('組件渲染', () => {
    it('應該正確渲染所有篩選欄位', () => {
      // 檢查耳號搜尋框
      const earNumInput = wrapper.find('.el-input[placeholder="輸入部分或完整耳號"]')
      expect(earNumInput.exists()).toBe(true)

      // 檢查按鈕
      const buttons = wrapper.findAll('.el-button')
      expect(buttons).toHaveLength(2)
    })
  })

  describe('篩選選項計算', () => {
    it('應該正確計算牧場編號選項', async () => {
      // 等待響應式系統更新
      await wrapper.vm.$nextTick()
      
      const component = wrapper.vm

      expect(component.farmNumOptions).toEqual([
        { label: 'F001', value: 'F001' },
        { label: 'F002', value: 'F002' },
      ])
    })

    it('應該正確計算品種選項', async () => {
      // 等待響應式系統更新
      await wrapper.vm.$nextTick()
      
      const component = wrapper.vm

      expect(component.breedOptions).toEqual([
        { label: '努比亞羊', value: '努比亞羊' },
        { label: '台灣黑山羊', value: '台灣黑山羊' },
        { label: '波爾羊', value: '波爾羊' },
      ])
    })
  })

  describe('用戶互動', () => {
    it('應該在耳號搜尋框輸入時更新狀態', async () => {
      const earNumInput = wrapper.find('.el-input[placeholder="輸入部分或完整耳號"]')
      
      await earNumInput.setValue('A001')
      
      expect(wrapper.vm.filterForm.earNumSearch).toBe('A001')
    })

    it('應該在按 Enter 時觸發搜尋', async () => {
      const earNumInput = wrapper.find('.el-input[placeholder="輸入部分或完整耳號"]')
      await earNumInput.setValue('A001')
      await earNumInput.trigger('keyup.enter')
      
      // 檢查是否調用了 emitFilter 方法
      expect(wrapper.vm.filterForm.earNumSearch).toBe('A001')
    })

    it('應該在點擊搜尋按鈕時觸發 filter 事件', async () => {
      // 設置一些篩選條件
      const component = wrapper.vm
      component.filterForm.earNumSearch = 'A001'
      component.filterForm.breed = '波爾羊'
      
      const searchButton = wrapper.findAll('.el-button')[0]
      await searchButton.trigger('click')
      
      // 檢查是否發出了 filter 事件
      expect(wrapper.emitted('filter')).toBeTruthy()
      expect(wrapper.emitted('filter')[0][0]).toEqual({
        earNumSearch: 'A001',
        farmNum: '',
        breed: '波爾羊',
        sex: '',
        breedCategory: '',
        status: '',
        startDate: '',
        endDate: '',
      })
    })

    it('應該在點擊清除篩選時重置所有篩選條件', async () => {
      const component = wrapper.vm
      
      // 設置一些篩選條件
      component.filterForm.earNumSearch = 'A001'
      component.filterForm.breed = '波爾羊'
      component.filterForm.sex = '公'
      component.dateRange = ['2024-01-01', '2024-12-31']
      
      const clearButton = wrapper.findAll('.el-button')[1]
      await clearButton.trigger('click')
      
      // 檢查是否重置了所有條件
      expect(component.filterForm.earNumSearch).toBe('')
      expect(component.filterForm.breed).toBe('')
      expect(component.filterForm.sex).toBe('')
      expect(component.dateRange).toEqual([])
      
      // 檢查是否發出了 filter 事件
      expect(wrapper.emitted('filter')).toBeTruthy()
    })
  })

  describe('日期範圍處理', () => {
    it('應該在日期範圍變化時更新 filterForm', async () => {
      const component = wrapper.vm
      
      // 模擬日期範圍變化
      component.dateRange = ['2024-01-01', '2024-12-31']
      await wrapper.vm.$nextTick()
      
      expect(component.filterForm.startDate).toBe('2024-01-01')
      expect(component.filterForm.endDate).toBe('2024-12-31')
    })

    it('應該在日期範圍清空時重置日期欄位', async () => {
      const component = wrapper.vm
      
      // 先設置日期
      component.dateRange = ['2024-01-01', '2024-12-31']
      await wrapper.vm.$nextTick()
      
      // 然後清空
      component.dateRange = null
      await wrapper.vm.$nextTick()
      
      expect(component.filterForm.startDate).toBe('')
      expect(component.filterForm.endDate).toBe('')
    })
  })

  describe('複雜篩選場景', () => {
    it('應該處理多個篩選條件的組合', async () => {
      const component = wrapper.vm
      
      // 設置多個篩選條件
      component.filterForm.earNumSearch = 'A00'
      component.filterForm.breed = '波爾羊'
      component.filterForm.sex = '母'
      component.filterForm.breedCategory = '肉用'
      component.dateRange = ['2024-01-01', '2024-06-30']
      
      await wrapper.vm.$nextTick()
      
      const searchButton = wrapper.findAll('.el-button')[0]
      await searchButton.trigger('click')
      
      const emittedFilter = wrapper.emitted('filter')[0][0]
      expect(emittedFilter.earNumSearch).toBe('A00')
      expect(emittedFilter.breed).toBe('波爾羊')
      expect(emittedFilter.sex).toBe('母')
      expect(emittedFilter.breedCategory).toBe('肉用')
      expect(emittedFilter.startDate).toBe('2024-01-01')
      expect(emittedFilter.endDate).toBe('2024-06-30')
    })

    it('應該在 store 數據更新時更新篩選選項', async () => {
      // 添加新的羊隻到 store
      sheepStore.sheepList.push({
        EarNum: 'B001',
        Breed: '薩能羊',
        FarmNum: 'F003'
      })
      
      await wrapper.vm.$nextTick()
      
      const component = wrapper.vm
      expect(component.breedOptions).toContainEqual({ label: '薩能羊', value: '薩能羊' })
      expect(component.farmNumOptions).toContainEqual({ label: 'F003', value: 'F003' })
    })
  })

  describe('邊界條件', () => {
    it('應該處理空的羊隻列表', async () => {
      sheepStore.sheepList = []
      await wrapper.vm.$nextTick()
      
      const component = wrapper.vm
      expect(component.farmNumOptions).toEqual([])
      expect(component.breedOptions).toEqual([])
    })

    it('應該處理包含空值的羊隻資料', async () => {
      sheepStore.sheepList = [
        { EarNum: 'A001', Breed: null, FarmNum: '' },
        { EarNum: 'A002', Breed: '', FarmNum: null },
        { EarNum: 'A003', Breed: '波爾羊', FarmNum: 'F001' },
      ]
      
      await wrapper.vm.$nextTick()
      
      const component = wrapper.vm
      expect(component.breedOptions).toEqual([{ label: '波爾羊', value: '波爾羊' }])
      expect(component.farmNumOptions).toEqual([{ label: 'F001', value: 'F001' }])
    })
  })
})
