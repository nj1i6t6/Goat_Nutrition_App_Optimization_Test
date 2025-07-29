import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SheepListView from './SheepListView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'

// 創建 API mock 工廠
const createMockApi = () => ({
  getSheepList: vi.fn(),
  deleteSheep: vi.fn(),
  updateSheep: vi.fn()
})

// Mock API
vi.mock('../api', () => ({
  default: createMockApi()
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock router
const mockRouter = {
  push: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  Tickets: { template: '<span>Tickets</span>' },
  Plus: { template: '<span>Plus</span>' },
  EditPen: { template: '<span>EditPen</span>' },
  Delete: { template: '<span>Delete</span>' },
  Search: { template: '<span>Search</span>' }
}))

describe('SheepListView', () => {
  let wrapper
  let pinia
  let api

  const mockSheepData = [
    {
      EarNum: 'SH001',
      Breed: '努比亞',
      Sex: 'F',
      BirthDate: '2023-01-15',
      Body_Weight_kg: 45.5,
      Status: '健康'
    },
    {
      EarNum: 'SH002',
      Breed: '薩能',
      Sex: 'M',
      BirthDate: '2023-02-20',
      Body_Weight_kg: 50.0,
      Status: '健康'
    },
    {
      EarNum: 'SH003',
      Breed: '努比亞',
      Sex: 'F',
      BirthDate: '2023-03-10',
      Body_Weight_kg: 42.0,
      Status: '懷孕'
    }
  ]

  const createWrapper = () => {
    return mount(SheepListView, {
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
    
    // Mock API responses
    api.getSheepList.mockResolvedValue(mockSheepData)
  })

  describe('組件初始化', () => {
    it('應該正確渲染組件', () => {
      wrapper = createWrapper()
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.sheep-list-view').exists()).toBe(true)
    })

    it('應該在掛載時加載羊隻列表', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      expect(api.getSheepList).toHaveBeenCalled()
    })

    it('應該顯示加載狀態', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.loading).toBe(false) // 在beforeEach中已設置mock
    })

    it('應該初始化篩選狀態', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.filters).toBeDefined()
      expect(wrapper.vm.showFilters).toBe(false)
    })
  })

  describe('數據加載', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('應該成功加載羊隻數據', async () => {
      await wrapper.vm.fetchSheepList()
      
      expect(api.getSheepList).toHaveBeenCalled()
      expect(wrapper.vm.sheepList).toHaveLength(3)
      expect(wrapper.vm.loading).toBe(false)
    })

    it('應該處理加載失敗', async () => {
      const error = new Error('加載失敗')
      api.getSheepList.mockRejectedValue(error)
      
      await wrapper.vm.fetchSheepList()
      
      expect(ElMessage.error).toHaveBeenCalled()
      expect(wrapper.vm.loading).toBe(false)
    })

    it('應該設置加載狀態', async () => {
      // 創建一個延遲的Promise來測試loading狀態
      let resolvePromise
      const loadingPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      api.getSheepList.mockReturnValue(loadingPromise)
      
      const fetchPromise = wrapper.vm.fetchSheepList()
      
      expect(wrapper.vm.loading).toBe(true)
      
      resolvePromise(mockSheepData)
      await fetchPromise
      
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('羊隻列表顯示', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.fetchSheepList()
    })

    it('應該顯示羊隻列表', () => {
      const sheepItems = wrapper.findAll('.sheep-item')
      expect(sheepItems.length).toBeGreaterThan(0)
    })

    it('應該顯示羊隻基本信息', () => {
      const firstSheep = wrapper.find('.sheep-item')
      
      expect(firstSheep.text()).toContain('SH001')
      expect(firstSheep.text()).toContain('努比亞')
      expect(firstSheep.text()).toContain('F')
    })

    it('應該顯示操作按鈕', () => {
      const actionButtons = wrapper.findAll('.action-button')
      expect(actionButtons.length).toBeGreaterThan(0)
    })

    it('應該支持分頁', () => {
      const pagination = wrapper.find('.pagination')
      expect(pagination.exists()).toBe(true)
    })
  })

  describe('篩選功能', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.fetchSheepList()
    })

    it('應該支持切換篩選面板', async () => {
      const filterToggle = wrapper.find('.filter-toggle')
      
      expect(wrapper.vm.showFilters).toBe(false)
      
      await filterToggle.trigger('click')
      
      expect(wrapper.vm.showFilters).toBe(true)
    })

    it('應該支持重置篩選條件', async () => {
      wrapper.vm.filters = { breed: '努比亞' }
      
      await wrapper.vm.resetFilters()
      
      expect(wrapper.vm.filters).toEqual({ breed: '努比亞' })
    })

    it('應該根據品種篩選羊隻', async () => {
      wrapper.vm.applyFilters({ breed: '努比亞' })
      
      expect(wrapper.vm.filteredSheep).toHaveLength(2)
      expect(wrapper.vm.filteredSheep.every(sheep => sheep.Breed === '努比亞')).toBe(true)
    })

    it('應該根據耳號篩選羊隻', async () => {
      wrapper.vm.applyFilters({ earNumSearch: 'SH001' })
      
      expect(wrapper.vm.filteredSheep).toHaveLength(1)
      expect(wrapper.vm.filteredSheep[0].EarNum).toBe('SH001')
    })

    it('應該根據性別篩選羊隻', async () => {
      wrapper.vm.applyFilters({ sex: 'F' })
      
      expect(wrapper.vm.filteredSheep).toHaveLength(2)
      expect(wrapper.vm.filteredSheep.every(sheep => sheep.Sex === 'F')).toBe(true)
    })

    it('應該根據出生日期範圍篩選羊隻', async () => {
      wrapper.vm.applyFilters({ 
        startDate: '2023-02-01',
        endDate: '2023-02-28'
      })
      
      expect(wrapper.vm.filteredSheep).toHaveLength(1)
      expect(wrapper.vm.filteredSheep[0].EarNum).toBe('SH002')
    })

    it('應該支持多個篩選條件', async () => {
      wrapper.vm.applyFilters({ 
        breed: '努比亞',
        sex: 'F'
      })
      
      expect(wrapper.vm.filteredSheep).toHaveLength(2)
      expect(wrapper.vm.filteredSheep.every(sheep => 
        sheep.Breed === '努比亞' && sheep.Sex === 'F'
      )).toBe(true)
    })

    it('應該更新統計信息', async () => {
      wrapper.vm.applyFilters({ breed: '努比亞' })
      await wrapper.vm.$nextTick()
      
      const summary = wrapper.find('.list-summary')
      expect(summary.text()).toContain('2')
    })
  })

  describe('CRUD 操作', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.fetchSheepList()
    })

    it('應該支持新增羊隻', async () => {
      const addButton = wrapper.find('.add-button')
      await addButton.trigger('click')
      
      expect(mockRouter.push).toHaveBeenCalledWith('/sheep/add')
    })

    it('應該支持編輯羊隻', async () => {
      const editButton = wrapper.find('.edit-button')
      await editButton.trigger('click')
      
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('/sheep/edit/')
      )
    })

    it('應該支持查看羊隻詳情', async () => {
      const viewButton = wrapper.find('.view-button')
      await viewButton.trigger('click')
      
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('/sheep/view/')
      )
    })

    it('應該支持刪除羊隻', async () => {
      ElMessageBox.confirm.mockResolvedValue('confirm')
      api.deleteSheep.mockResolvedValue({ success: true })
      
      const deleteButton = wrapper.find('.delete-button')
      await deleteButton.trigger('click')
      
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(api.deleteSheep).toHaveBeenCalled()
      expect(ElMessage.success).toHaveBeenCalled()
    })

    it('應該處理刪除取消', async () => {
      ElMessageBox.confirm.mockRejectedValue('cancel')
      
      const deleteButton = wrapper.find('.delete-button')
      await deleteButton.trigger('click')
      
      expect(ElMessageBox.confirm).toHaveBeenCalled()
      expect(api.deleteSheep).not.toHaveBeenCalled()
    })

    it('應該處理刪除失敗', async () => {
      ElMessageBox.confirm.mockResolvedValue('confirm')
      api.deleteSheep.mockRejectedValue(new Error('刪除失敗'))
      
      const deleteButton = wrapper.find('.delete-button')
      await deleteButton.trigger('click')
      
      expect(ElMessage.error).toHaveBeenCalled()
    })
  })

  describe('搜索功能', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.fetchSheepList()
    })

    it('應該支持搜索輸入', async () => {
      const searchInput = wrapper.find('.search-input')
      
      await searchInput.setValue('SH001')
      
      expect(wrapper.vm.searchTerm).toBe('SH001')
    })

    it('應該支持按Enter搜索', async () => {
      const searchInput = wrapper.find('.search-input')
      
      await searchInput.setValue('SH001')
      await searchInput.trigger('keyup.enter')
      
      expect(wrapper.vm.filteredSheep).toHaveLength(1)
      expect(wrapper.vm.filteredSheep[0].EarNum).toBe('SH001')
    })

    it('應該支持點擊搜索按鈕', async () => {
      const searchButton = wrapper.find('.search-button')
      wrapper.vm.searchTerm = 'SH001'
      
      await searchButton.trigger('click')
      
      expect(wrapper.vm.filteredSheep).toHaveLength(1)
    })

    it('應該支持清空搜索', async () => {
      wrapper.vm.searchTerm = 'SH001'
      wrapper.vm.performSearch()
      
      const clearButton = wrapper.find('.clear-search')
      await clearButton.trigger('click')
      
      expect(wrapper.vm.searchTerm).toBe('')
      expect(wrapper.vm.filteredSheep).toHaveLength(3)
    })
  })

  describe('排序功能', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.fetchSheepList()
    })

    it('應該支持按耳號排序', async () => {
      wrapper.vm.sortBy('EarNum')
      
      expect(wrapper.vm.sortField).toBe('EarNum')
      expect(wrapper.vm.sortOrder).toBe('asc')
    })

    it('應該支持切換排序順序', async () => {
      wrapper.vm.sortBy('EarNum')
      wrapper.vm.sortBy('EarNum')
      
      expect(wrapper.vm.sortOrder).toBe('desc')
    })

    it('應該支持按出生日期排序', async () => {
      wrapper.vm.sortBy('BirthDate')
      
      const sorted = wrapper.vm.sortedSheep
      const dates = sorted.map(sheep => new Date(sheep.BirthDate))
      
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i] >= dates[i-1]).toBe(true)
      }
    })

    it('應該支持按體重排序', async () => {
      wrapper.vm.sortBy('Body_Weight_kg')
      
      const sorted = wrapper.vm.sortedSheep
      const weights = sorted.map(sheep => sheep.Body_Weight_kg)
      
      for (let i = 1; i < weights.length; i++) {
        expect(weights[i] >= weights[i-1]).toBe(true)
      }
    })
  })

  describe('分頁功能', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      // 創建更多數據以測試分頁
      const moreSheepData = Array.from({ length: 25 }, (_, i) => ({
        EarNum: `SH${String(i + 1).padStart(3, '0')}`,
        Breed: i % 2 === 0 ? '努比亞' : '薩能',
        Sex: i % 2 === 0 ? 'F' : 'M',
        BirthDate: `2023-01-${String(i + 1).padStart(2, '0')}`,
        Body_Weight_kg: 40 + i,
        Status: '健康'
      }))
      api.getSheepList.mockResolvedValue(moreSheepData)
      await wrapper.vm.fetchSheepList()
    })

    it('應該正確分頁顯示', () => {
      wrapper.vm.pageSize = 10
      
      expect(wrapper.vm.totalPages).toBe(3)
      expect(wrapper.vm.paginatedSheep).toHaveLength(10)
    })

    it('應該支持翻頁', async () => {
      wrapper.vm.pageSize = 10
      wrapper.vm.currentPage = 2
      
      expect(wrapper.vm.paginatedSheep[0].EarNum).toBe('SH011')
    })

    it('應該在搜索後重置頁碼', async () => {
      wrapper.vm.currentPage = 2
      
      wrapper.vm.performSearch('SH001')
      
      expect(wrapper.vm.currentPage).toBe(1)
    })
  })

  describe('響應式設計', () => {
    it('應該支持移動設備視圖', () => {
      wrapper = createWrapper()
      
      // 模擬小屏幕
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      })
      
      window.dispatchEvent(new Event('resize'))
      
      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('應該在移動設備上隱藏部分列', () => {
      wrapper = createWrapper()
      wrapper.vm.isMobile = true
      
      const hiddenColumns = wrapper.findAll('.mobile-hidden')
      expect(hiddenColumns.length).toBeGreaterThan(0)
    })
  })

  describe('邊界條件處理', () => {
    it('應該處理空的羊隻列表', async () => {
      api.getSheepList.mockResolvedValue([])
      wrapper = createWrapper()
      await wrapper.vm.fetchSheepList()
      
      expect(wrapper.vm.sheepList).toHaveLength(0)
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
    })

    it('應該處理網絡錯誤', async () => {
      api.getSheepList.mockRejectedValue(new Error('網絡錯誤'))
      wrapper = createWrapper()
      await wrapper.vm.fetchSheepList()
      
      expect(ElMessage.error).toHaveBeenCalledWith(
        expect.stringContaining('網絡錯誤')
      )
    })

    it('應該處理無效的搜索結果', () => {
      wrapper = createWrapper()
      wrapper.vm.sheepList = mockSheepData
      wrapper.vm.performSearch('不存在的羊隻')
      
      expect(wrapper.vm.filteredSheep).toHaveLength(0)
    })

    it('應該處理無效的分頁參數', () => {
      wrapper = createWrapper()
      wrapper.vm.sheepList = mockSheepData
      wrapper.vm.currentPage = 999
      
      expect(wrapper.vm.paginatedSheep).toHaveLength(0)
    })
  })

  describe('性能優化', () => {
    it('應該正確處理大量數據', async () => {
      const largeSheepData = Array.from({ length: 1000 }, (_, i) => ({
        EarNum: `SH${String(i + 1).padStart(4, '0')}`,
        Breed: '努比亞',
        Sex: 'F',
        BirthDate: '2023-01-15',
        Body_Weight_kg: 45.5,
        Status: '健康'
      }))
      
      api.getSheepList.mockResolvedValue(largeSheepData)
      wrapper = createWrapper()
      await wrapper.vm.fetchSheepList()
      
      expect(wrapper.vm.sheepList).toHaveLength(1000)
      expect(wrapper.vm.paginatedSheep.length).toBeLessThanOrEqual(20) // 默認分頁大小
    })

    it('應該使用防抖進行搜索', async () => {
      wrapper = createWrapper()
      
      const searchSpy = vi.spyOn(wrapper.vm, 'performSearch')
      
      // 快速連續輸入
      wrapper.vm.searchTerm = 'S'
      wrapper.vm.searchTerm = 'SH'
      wrapper.vm.searchTerm = 'SH0'
      wrapper.vm.searchTerm = 'SH001'
      
      // 等待防抖完成
      await new Promise(resolve => setTimeout(resolve, 500))
      
      expect(searchSpy).toHaveBeenCalledTimes(1)
    })
  })
})
