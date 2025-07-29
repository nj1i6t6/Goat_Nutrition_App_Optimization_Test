/**
 * SheepFilter.vue 組件測試 - 簡化版本
 * 測試羊隻篩選器的基本功能
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

describe('SheepFilter 基本功能測試', () => {
  let wrapper
  let pinia
  let sheepStore

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(SheepFilter, {
      global: {
        plugins: [pinia],
      },
    })
    
    sheepStore = useSheepStore()
  })

  describe('組件基本渲染', () => {
    it('應該正確渲染篩選器組件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.el-card').exists()).toBe(true)
      expect(wrapper.find('.el-form').exists()).toBe(true)
    })

    it('應該渲染搜尋和清除按鈕', () => {
      const buttons = wrapper.findAll('.el-button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('應該渲染耳號搜尋輸入框', () => {
      const input = wrapper.find('.el-input')
      expect(input.exists()).toBe(true)
    })
  })

  describe('表單互動', () => {
    it('應該能夠輸入搜尋條件', async () => {
      const component = wrapper.vm
      
      // 直接設置 filterForm
      component.filterForm.earNumSearch = 'A001'
      await wrapper.vm.$nextTick()
      
      expect(component.filterForm.earNumSearch).toBe('A001')
    })

    it('應該能夠觸發篩選事件', async () => {
      const component = wrapper.vm
      
      // 設置篩選條件
      component.filterForm.earNumSearch = 'A001'
      component.filterForm.breed = '波爾羊'
      
      // 觸發篩選
      component.emitFilter()
      
      // 檢查事件是否發出
      expect(wrapper.emitted('filter')).toBeTruthy()
      expect(wrapper.emitted('filter')[0][0]).toMatchObject({
        earNumSearch: 'A001',
        breed: '波爾羊'
      })
    })

    it('應該能夠重置篩選條件', async () => {
      const component = wrapper.vm
      
      // 設置一些篩選條件
      component.filterForm.earNumSearch = 'A001'
      component.filterForm.breed = '波爾羊'
      component.dateRange = ['2024-01-01', '2024-12-31']
      
      // 重置篩選
      component.resetFilter()
      
      // 檢查是否重置
      expect(component.filterForm.earNumSearch).toBe('')
      expect(component.filterForm.breed).toBe('')
      expect(component.dateRange).toEqual([])
    })
  })

  describe('日期範圍處理', () => {
    it('應該正確處理日期範圍變化', async () => {
      const component = wrapper.vm
      
      // 設置日期範圍
      component.dateRange = ['2024-01-01', '2024-12-31']
      await wrapper.vm.$nextTick()
      
      expect(component.filterForm.startDate).toBe('2024-01-01')
      expect(component.filterForm.endDate).toBe('2024-12-31')
    })

    it('應該正確處理日期範圍清空', async () => {
      const component = wrapper.vm
      
      // 先設置日期範圍
      component.dateRange = ['2024-01-01', '2024-12-31']
      await wrapper.vm.$nextTick()
      
      // 然後清空
      component.dateRange = null
      await wrapper.vm.$nextTick()
      
      expect(component.filterForm.startDate).toBe('')
      expect(component.filterForm.endDate).toBe('')
    })
  })

  describe('動態選項測試', () => {
    it('應該在 store 有資料時顯示選項', async () => {
      // 先檢查初始狀態
      expect(wrapper.vm.farmNumOptions).toEqual([])
      expect(wrapper.vm.breedOptions).toEqual([])
      
      // 設置 store 資料
      sheepStore.sheepList = [
        { EarNum: 'A001', Breed: '波爾羊', FarmNum: 'F001' },
        { EarNum: 'A002', Breed: '台灣黑山羊', FarmNum: 'F002' },
      ]
      
      await wrapper.vm.$nextTick()
      
      // 檢查選項是否更新
      expect(wrapper.vm.farmNumOptions.length).toBeGreaterThan(0)
      expect(wrapper.vm.breedOptions.length).toBeGreaterThan(0)
    })
  })
})
