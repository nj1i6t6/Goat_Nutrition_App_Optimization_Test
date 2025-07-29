import { describe, it, expect, vi } from 'vitest' 
import { mount } from '@vue/test-utils'

// 創建一個簡單的測試組件避免循環依賴
const SimpleTestComponent = {
  template: `
    <div class="test-component">
      <h1>{{ title }}</h1>
      <button @click="increment">Count: {{ count }}</button>
    </div>
  `,
  data() {
    return {
      title: 'Test Component',
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}

describe('簡單組件測試', () => {
  it('應該能正確渲染組件', () => {
    const wrapper = mount(SimpleTestComponent)
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.test-component').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Test Component')
  })

  it('應該能正確處理點擊事件', async () => {
    const wrapper = mount(SimpleTestComponent)
    
    const button = wrapper.find('button')
    expect(button.text()).toBe('Count: 0')
    
    await button.trigger('click')
    expect(button.text()).toBe('Count: 1')
  })

  it('應該能正常使用 Vue Test Utils', () => {
    const wrapper = mount(SimpleTestComponent)
    
    expect(wrapper.vm.title).toBe('Test Component')
    expect(wrapper.vm.count).toBe(0)
    
    wrapper.vm.increment()
    expect(wrapper.vm.count).toBe(1)
  })
})
