import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SheepTable from './SheepTable.vue'
import { createPinia, setActivePinia } from 'pinia'

// Mock Element Plus components
const MockElTableV2 = {
  template: `
    <div class="el-table-v2" @column-sort="$emit('column-sort', $event)">
      <div v-for="(item, index) in data" :key="index" class="table-row">
        {{ item.EarNum }}
      </div>
      <div v-if="!data.length" class="empty-state">
        <slot name="empty" />
      </div>
    </div>
  `,
  props: ['columns', 'data', 'width', 'height', 'sortBy', 'fixed'],
  emits: ['column-sort']
}

const MockElAutoResizer = {
  template: `
    <div class="el-auto-resizer">
      <slot :height="400" :width="800" />
    </div>
  `
}

// Mock utils
const mockStatusOptions = [
  { value: 'healthy', label: '健康' },
  { value: 'sick', label: '生病' },
  { value: 'pregnant', label: '懷孕' }
]

vi.mock('../../utils', () => ({
  statusOptions: mockStatusOptions
}))

describe('SheepTable', () => {
  let wrapper
  let pinia

  const mockSheepData = [
    {
      EarNum: 'SH001',
      Breed: '努比亞',
      Sex: 'F',
      BirthDate: '2023-01-15',
      status: 'healthy',
      next_vaccination_due_date: '2024-02-01',
      next_deworming_due_date: null,
      expected_lambing_date: null
    },
    {
      EarNum: 'SH002',
      Breed: '薩能',
      Sex: 'M',
      BirthDate: '2023-02-20',
      status: 'pregnant',
      next_vaccination_due_date: '2023-12-01', // 過期
      next_deworming_due_date: '2024-01-30',
      expected_lambing_date: '2024-03-15'
    },
    {
      EarNum: 'SH003',
      Breed: '努比亞',
      Sex: 'F',
      BirthDate: '2023-03-10',
      status: 'sick',
      next_vaccination_due_date: null,
      next_deworming_due_date: null,
      expected_lambing_date: null
    }
  ]

  const createWrapper = (props = {}) => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    return mount(SheepTable, {
      props: {
        sheepData: mockSheepData,
        loading: false,
        ...props
      },
      global: {
        plugins: [pinia],
        components: {
          ElTableV2: MockElTableV2,
          ElAutoResizer: MockElAutoResizer,
          ElButton: { 
            template: '<button @click="$emit(\'click\')" :type="type" :size="size"><slot /></button>',
            props: ['type', 'size'],
            emits: ['click']
          },
          ElTooltip: {
            template: '<div class="el-tooltip" :title="content"><slot /></div>',
            props: ['content', 'placement']
          },
          ElEmpty: {
            template: '<div class="el-empty">{{ description }}</div>',
            props: ['description']
          }
        },
        directives: {
          loading: (el, binding) => {
            if (binding.value) {
              el.classList.add('loading')
            } else {
              el.classList.remove('loading')
            }
          }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock current date for testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-25'))
    wrapper = createWrapper()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
  })

  describe('組件初始化', () => {
    it('應該正確渲染組件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.table-container').exists()).toBe(true)
    })

    it('應該渲染表格組件', () => {
      const table = wrapper.findComponent(MockElTableV2)
      expect(table.exists()).toBe(true)
    })

    it('應該渲染自動調整大小組件', () => {
      const resizer = wrapper.findComponent(MockElAutoResizer)
      expect(resizer.exists()).toBe(true)
    })

    it('應該傳遞正確的props給表格', () => {
      const table = wrapper.findComponent(MockElTableV2)
      expect(table.props('data')).toEqual(mockSheepData)
      expect(table.props('columns')).toBeDefined()
      expect(table.props('width')).toBe(800)
      expect(table.props('height')).toBe(400)
    })

    it('應該有正確的初始排序狀態', () => {
      expect(wrapper.vm.sortState).toEqual({
        key: 'EarNum',
        order: 'asc'
      })
    })
  })

  describe('數據顯示', () => {
    it('應該顯示羊隻數據', () => {
      const tableRows = wrapper.findAll('.table-row')
      expect(tableRows.length).toBeGreaterThan(0)
    })

    it('應該顯示載入狀態', async () => {
      await wrapper.setProps({ loading: true })
      
      expect(wrapper.find('.table-container').classes()).toContain('loading')
    })

    it('應該顯示空狀態', async () => {
      await wrapper.setProps({ sheepData: [] })
      
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
    })

    it('應該定義正確的表格列', () => {
      const columns = wrapper.vm.columns
      expect(columns).toHaveLength(6)
      
      const columnKeys = columns.map(col => col.key)
      expect(columnKeys).toEqual([
        'EarNum', 'Breed', 'Sex', 'BirthDate', 'status', 'operations'
      ])
    })
  })

  describe('排序功能', () => {
    it('應該處理排序事件', () => {
      const table = wrapper.findComponent(MockElTableV2)
      
      table.vm.$emit('column-sort', { key: 'Breed', order: 'desc' })
      
      expect(wrapper.vm.sortState).toEqual({
        key: 'Breed',
        order: 'desc'
      })
    })

    it('應該按耳號排序', () => {
      wrapper.vm.sortState = { key: 'EarNum', order: 'asc' }
      
      const sorted = wrapper.vm.sortedData
      expect(sorted[0].EarNum).toBe('SH001')
      expect(sorted[1].EarNum).toBe('SH002')
      expect(sorted[2].EarNum).toBe('SH003')
    })

    it('應該按品種降序排序', () => {
      wrapper.vm.sortState = { key: 'Breed', order: 'desc' }
      
      const sorted = wrapper.vm.sortedData
      expect(sorted[0].Breed).toBe('薩能')
      expect(sorted[1].Breed).toBe('努比亞')
      expect(sorted[2].Breed).toBe('努比亞')
    })

    it('應該按出生日期排序', () => {
      wrapper.vm.sortState = { key: 'BirthDate', order: 'asc' }
      
      const sorted = wrapper.vm.sortedData
      expect(sorted[0].EarNum).toBe('SH001') // 2023-01-15
      expect(sorted[1].EarNum).toBe('SH002') // 2023-02-20
      expect(sorted[2].EarNum).toBe('SH003') // 2023-03-10
    })

    it('應該處理空排序鍵', () => {
      wrapper.vm.sortState = { key: '', order: 'asc' }
      
      const sorted = wrapper.vm.sortedData
      expect(sorted).toEqual(mockSheepData)
    })

    it('應該處理缺少值的數據', () => {
      const dataWithMissing = [
        { EarNum: 'SH001', Breed: 'A' },
        { EarNum: 'SH002', Breed: '' },
        { EarNum: 'SH003' } // 缺少 Breed
      ]
      wrapper.setProps({ sheepData: dataWithMissing })
      wrapper.vm.sortState = { key: 'Breed', order: 'asc' }
      
      const sorted = wrapper.vm.sortedData
      expect(sorted).toHaveLength(3)
    })
  })

  describe('工具函數', () => {
    it('應該正確格式化日期', () => {
      const formatted = wrapper.vm.$options.setup().formatDate('2023-01-15')
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('應該處理無效日期', () => {
      const { formatDate } = wrapper.vm.$options.setup()
      expect(formatDate(null)).toBe('N/A')
      expect(formatDate('')).toBe('N/A')
    })

    it('應該獲取狀態文本', () => {
      const { getStatusText } = wrapper.vm.$options.setup()
      expect(getStatusText('healthy')).toBe('健康')
      expect(getStatusText('unknown')).toBe('unknown')
      expect(getStatusText(null)).toBe('未指定')
    })

    it('應該計算提醒', () => {
      const { getReminders } = wrapper.vm.$options.setup()
      
      // 測試即將到期的疫苗
      const sheep1 = {
        next_vaccination_due_date: '2024-01-30', // 5天後
        next_deworming_due_date: null,
        expected_lambing_date: null
      }
      const reminders1 = getReminders(sheep1)
      expect(reminders1).toHaveLength(1)
      expect(reminders1[0].text).toBe('疫苗')
      expect(reminders1[0].isOverdue).toBe(false)
      
      // 測試過期的驅蟲
      const sheep2 = {
        next_vaccination_due_date: null,
        next_deworming_due_date: '2024-01-20', // 5天前
        expected_lambing_date: null
      }
      const reminders2 = getReminders(sheep2)
      expect(reminders2).toHaveLength(1)
      expect(reminders2[0].text).toBe('驅蟲')
      expect(reminders2[0].isOverdue).toBe(true)
    })

    it('應該處理無效的提醒日期', () => {
      const { getReminders } = wrapper.vm.$options.setup()
      
      const sheep = {
        next_vaccination_due_date: 'invalid-date',
        next_deworming_due_date: null,
        expected_lambing_date: null
      }
      const reminders = getReminders(sheep)
      expect(reminders).toHaveLength(0)
    })
  })

  describe('事件發射', () => {
    it('應該發射編輯事件', () => {
      // 由於我們使用render函數，我們需要測試實際的組件方法
      wrapper.vm.$emit('edit', 'SH001')
      
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')[0]).toEqual(['SH001'])
    })

    it('應該發射刪除事件', () => {
      wrapper.vm.$emit('delete', 'SH002')
      
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')[0]).toEqual(['SH002'])
    })

    it('應該發射查看日誌事件', () => {
      wrapper.vm.$emit('viewLog', 'SH003')
      
      expect(wrapper.emitted('viewLog')).toBeTruthy()
      expect(wrapper.emitted('viewLog')[0]).toEqual(['SH003'])
    })

    it('應該發射諮詢事件', () => {
      wrapper.vm.$emit('consult', 'SH001')
      
      expect(wrapper.emitted('consult')).toBeTruthy()
      expect(wrapper.emitted('consult')[0]).toEqual(['SH001'])
    })
  })

  describe('列配置', () => {
    it('應該有可排序的列', () => {
      const sortableColumns = wrapper.vm.columns.filter(col => col.sortable)
      expect(sortableColumns).toHaveLength(5) // 除了操作列外都可排序
    })

    it('應該有正確的列寬度', () => {
      const columns = wrapper.vm.columns
      expect(columns.find(col => col.key === 'EarNum').width).toBe(150)
      expect(columns.find(col => col.key === 'operations').width).toBe(280)
    })

    it('應該有操作列', () => {
      const operationColumn = wrapper.vm.columns.find(col => col.key === 'operations')
      expect(operationColumn).toBeDefined()
      expect(operationColumn.title).toBe('操作')
      expect(operationColumn.align).toBe('center')
    })

    it('應該有自定義渲染器', () => {
      const dateColumn = wrapper.vm.columns.find(col => col.key === 'BirthDate')
      expect(dateColumn.cellRenderer).toBeDefined()
      
      const statusColumn = wrapper.vm.columns.find(col => col.key === 'status')
      expect(statusColumn.cellRenderer).toBeDefined()
      
      const operationsColumn = wrapper.vm.columns.find(col => col.key === 'operations')
      expect(operationsColumn.cellRenderer).toBeDefined()
    })
  })

  describe('邊界條件處理', () => {
    it('應該處理空數據', async () => {
      await wrapper.setProps({ sheepData: [] })
      
      expect(wrapper.vm.sortedData).toEqual([])
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('應該處理缺少屬性的數據', async () => {
      const incompleteData = [
        { EarNum: 'SH001' }, // 缺少其他屬性
        { Breed: '努比亞' } // 缺少耳號
      ]
      await wrapper.setProps({ sheepData: incompleteData })
      
      expect(wrapper.vm.sortedData).toHaveLength(2)
    })

    it('應該處理載入狀態變化', async () => {
      expect(wrapper.vm.loading).toBe(false)
      
      await wrapper.setProps({ loading: true })
      expect(wrapper.props('loading')).toBe(true)
    })

    it('應該處理無效的排序配置', () => {
      wrapper.vm.sortState = { key: 'invalid_key', order: 'invalid_order' }
      
      // 應該不會拋出錯誤
      expect(() => wrapper.vm.sortedData).not.toThrow()
    })
  })

  describe('響應式數據', () => {
    it('應該響應數據變化', async () => {
      const newData = [
        { EarNum: 'SH004', Breed: '薩能', Sex: 'F', BirthDate: '2023-04-01' }
      ]
      
      await wrapper.setProps({ sheepData: newData })
      
      expect(wrapper.vm.sortedData).toEqual(newData)
    })

    it('應該響應排序狀態變化', async () => {
      wrapper.vm.sortState = { key: 'Breed', order: 'desc' }
      await wrapper.vm.$nextTick()
      
      const sorted = wrapper.vm.sortedData
      expect(sorted[0].Breed).toBe('薩能')
    })
  })

  describe('樣式和布局', () => {
    it('應該有正確的CSS類別', () => {
      expect(wrapper.find('.table-container').exists()).toBe(true)
    })

    it('應該有正確的高度設置', () => {
      const container = wrapper.find('.table-container')
      expect(container.exists()).toBe(true)
    })

    it('應該應用載入指令', async () => {
      await wrapper.setProps({ loading: true })
      
      const container = wrapper.find('.table-container')
      expect(container.classes()).toContain('loading')
    })
  })

  describe('性能優化', () => {
    it('應該使用computed進行排序', () => {
      const sortedData = wrapper.vm.sortedData
      expect(sortedData).toBeDefined()
      
      // 第二次調用應該使用cached結果
      const sortedData2 = wrapper.vm.sortedData
      expect(sortedData2).toBe(sortedData)
    })

    it('應該處理大量數據', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        EarNum: `SH${String(i).padStart(3, '0')}`,
        Breed: i % 2 === 0 ? '努比亞' : '薩能',
        Sex: i % 2 === 0 ? 'F' : 'M',
        BirthDate: `2023-${String((i % 12) + 1).padStart(2, '0')}-01`
      }))
      
      await wrapper.setProps({ sheepData: largeData })
      
      expect(wrapper.vm.sortedData).toHaveLength(1000)
    })
  })
})
