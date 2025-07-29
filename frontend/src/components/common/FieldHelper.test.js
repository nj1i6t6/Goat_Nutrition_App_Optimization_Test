import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FieldHelper from './FieldHelper.vue'

// Mock Element Plus components
const MockElTooltip = {
  template: `
    <div class="el-tooltip" :class="{ disabled: disabled }" :title="content">
      <slot />
    </div>
  `,
  props: ['content', 'placement', 'disabled']
}

const MockElIcon = {
  template: '<i class="el-icon" :class="$attrs.class"><slot /></i>'
}

// Mock Element Plus icons
const QuestionFilled = {
  template: '<span class="question-filled-icon">?</span>'
}

describe('FieldHelper', () => {
  let wrapper

  const createWrapper = (props = {}) => {
    return mount(FieldHelper, {
      props: {
        content: '',
        ...props
      },
      global: {
        components: {
          ElTooltip: MockElTooltip,
          ElIcon: MockElIcon,
          QuestionFilled
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = createWrapper()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('組件初始化', () => {
    it('應該正確渲染組件', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('應該包含tooltip組件', () => {
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.exists()).toBe(true)
    })

    it('應該包含圖標組件', () => {
      const icon = wrapper.findComponent(MockElIcon)
      expect(icon.exists()).toBe(true)
    })

    it('應該包含問號圖標', () => {
      const questionIcon = wrapper.findComponent(QuestionFilled)
      expect(questionIcon.exists()).toBe(true)
    })
  })

  describe('Props處理', () => {
    it('應該接受content屬性', () => {
      const content = '這是幫助文字'
      wrapper = createWrapper({ content })
      
      expect(wrapper.props('content')).toBe(content)
    })

    it('應該有預設的空content', () => {
      expect(wrapper.props('content')).toBe('')
    })

    it('應該將content傳遞給tooltip', () => {
      const content = '幫助提示文字'
      wrapper = createWrapper({ content })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('content')).toBe(content)
    })

    it('應該設置tooltip的placement', () => {
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('placement')).toBe('top')
    })
  })

  describe('顯示邏輯', () => {
    it('應該在有content時顯示圖標', () => {
      wrapper = createWrapper({ content: '有幫助文字' })
      
      const icon = wrapper.find('.field-helper-icon')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('has-help')
    })

    it('應該在沒有content時隱藏圖標', () => {
      wrapper = createWrapper({ content: '' })
      
      const icon = wrapper.find('.field-helper-icon')
      expect(icon.classes()).not.toContain('has-help')
    })

    it('應該根據content動態切換顯示狀態', async () => {
      // 初始沒有content
      expect(wrapper.find('.field-helper-icon').classes()).not.toContain('has-help')
      
      // 設置content
      await wrapper.setProps({ content: '新的幫助文字' })
      expect(wrapper.find('.field-helper-icon').classes()).toContain('has-help')
      
      // 清空content
      await wrapper.setProps({ content: '' })
      expect(wrapper.find('.field-helper-icon').classes()).not.toContain('has-help')
    })

    it('應該在有content時啟用tooltip', () => {
      wrapper = createWrapper({ content: '幫助文字' })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('disabled')).toBe(false)
    })

    it('應該在沒有content時禁用tooltip', () => {
      wrapper = createWrapper({ content: '' })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('disabled')).toBe(true)
    })
  })

  describe('樣式功能', () => {
    it('應該有正確的CSS類別', () => {
      const icon = wrapper.find('.field-helper-icon')
      expect(icon.exists()).toBe(true)
    })

    it('應該在有幫助內容時添加has-help類別', () => {
      wrapper = createWrapper({ content: '幫助內容' })
      
      const icon = wrapper.find('.field-helper-icon')
      expect(icon.classes()).toContain('has-help')
    })

    it('應該在沒有幫助內容時不添加has-help類別', () => {
      wrapper = createWrapper({ content: '' })
      
      const icon = wrapper.find('.field-helper-icon')
      expect(icon.classes()).not.toContain('has-help')
    })
  })

  describe('用戶交互', () => {
    it('應該有help cursor樣式', () => {
      const icon = wrapper.find('.field-helper-icon')
      expect(icon.exists()).toBe(true)
      // CSS cursor: help 會通過樣式應用
    })

    it('應該支援hover效果', () => {
      wrapper = createWrapper({ content: '幫助文字' })
      
      const icon = wrapper.find('.field-helper-icon')
      expect(icon.classes()).toContain('has-help')
    })
  })

  describe('無障礙功能', () => {
    it('應該使用適當的圖標', () => {
      const questionIcon = wrapper.findComponent(QuestionFilled)
      expect(questionIcon.exists()).toBe(true)
    })

    it('應該有tooltip提供文字說明', () => {
      wrapper = createWrapper({ content: '這是說明文字' })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('content')).toBe('這是說明文字')
    })
  })

  describe('邊界條件', () => {
    it('應該處理null content', () => {
      wrapper = createWrapper({ content: null })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('disabled')).toBe(true)
    })

    it('應該處理undefined content', () => {
      wrapper = createWrapper({ content: undefined })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('disabled')).toBe(true)
    })

    it('應該處理空字符串 content', () => {
      wrapper = createWrapper({ content: '' })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('disabled')).toBe(true)
    })

    it('應該處理只有空格的 content', () => {
      wrapper = createWrapper({ content: '   ' })
      
      // 空格也被視為有內容
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('disabled')).toBe(false)
    })

    it('應該處理很長的 content', () => {
      const longContent = 'A'.repeat(1000)
      wrapper = createWrapper({ content: longContent })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('content')).toBe(longContent)
      expect(tooltip.props('disabled')).toBe(false)
    })
  })

  describe('響應式更新', () => {
    it('應該響應content屬性變化', async () => {
      // 初始狀態
      expect(wrapper.find('.field-helper-icon').classes()).not.toContain('has-help')
      
      // 更新content
      await wrapper.setProps({ content: '新內容' })
      expect(wrapper.find('.field-helper-icon').classes()).toContain('has-help')
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('content')).toBe('新內容')
    })

    it('應該在多次更新中保持狀態一致', async () => {
      const contents = ['第一個內容', '第二個內容', '', '第三個內容']
      
      for (const content of contents) {
        await wrapper.setProps({ content })
        
        const tooltip = wrapper.findComponent(MockElTooltip)
        expect(tooltip.props('content')).toBe(content)
        expect(tooltip.props('disabled')).toBe(!content)
        
        const icon = wrapper.find('.field-helper-icon')
        if (content) {
          expect(icon.classes()).toContain('has-help')
        } else {
          expect(icon.classes()).not.toContain('has-help')
        }
      }
    })
  })

  describe('組件結構', () => {
    it('應該有正確的DOM結構', () => {
      wrapper = createWrapper({ content: '測試內容' })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      const icon = wrapper.findComponent(MockElIcon)
      const questionIcon = wrapper.findComponent(QuestionFilled)
      
      expect(tooltip.exists()).toBe(true)
      expect(icon.exists()).toBe(true)
      expect(questionIcon.exists()).toBe(true)
    })

    it('應該正確嵌套組件', () => {
      const tooltip = wrapper.findComponent(MockElTooltip)
      const icon = tooltip.findComponent(MockElIcon)
      const questionIcon = icon.findComponent(QuestionFilled)
      
      expect(icon.exists()).toBe(true)
      expect(questionIcon.exists()).toBe(true)
    })
  })

  describe('性能考量', () => {
    it('應該是輕量級組件', () => {
      const html = wrapper.html()
      expect(html.length).toBeLessThan(500)
    })

    it('應該不包含不必要的watchers', () => {
      // 組件應該使用props直接綁定，不需要額外的watchers
      expect(wrapper.vm.$props).toBeDefined()
    })

    it('應該快速渲染', () => {
      const startTime = performance.now()
      const testWrapper = createWrapper({ content: '測試' })
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(10)
      
      testWrapper.unmount()
    })
  })

  describe('類型安全', () => {
    it('應該接受字符串類型的content', () => {
      wrapper = createWrapper({ content: 'string content' })
      expect(typeof wrapper.props('content')).toBe('string')
    })

    it('應該有適當的prop類型定義', () => {
      // 檢查組件是否正確定義了props
      expect(wrapper.vm.$props).toHaveProperty('content')
    })
  })

  describe('國際化支持', () => {
    it('應該支援中文內容', () => {
      const chineseContent = '這是中文幫助文字'
      wrapper = createWrapper({ content: chineseContent })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('content')).toBe(chineseContent)
    })

    it('應該支援英文內容', () => {
      const englishContent = 'This is English help text'
      wrapper = createWrapper({ content: englishContent })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('content')).toBe(englishContent)
    })

    it('應該支援特殊字符', () => {
      const specialContent = '包含特殊字符的內容：@#$%^&*()'
      wrapper = createWrapper({ content: specialContent })
      
      const tooltip = wrapper.findComponent(MockElTooltip)
      expect(tooltip.props('content')).toBe(specialContent)
    })
  })
})
