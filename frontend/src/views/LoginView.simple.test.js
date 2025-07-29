import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// 先 mock 所有外部依賴
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}))

vi.mock('@/api', () => ({
  default: {
    login: vi.fn().mockResolvedValue({ success: true, user: { username: 'test' } }),
    register: vi.fn().mockResolvedValue({ success: true, user: { username: 'test' } }),
    logout: vi.fn()
  }
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// 然後導入組件
import LoginView from './LoginView.vue'

describe('LoginView 簡化測試', () => {
  let wrapper
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(LoginView, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-tabs': { template: '<div><slot /></div>' },
          'el-tab-pane': { template: '<div><slot /></div>' },
          'el-form': { 
            template: '<form @submit="$emit(\'submit\', $event)"><slot /></form>',
            methods: {
              validate: vi.fn((callback) => callback(true))
            }
          },
          'el-form-item': { template: '<div><slot /></div>' },
          'el-input': { 
            template: '<input v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
            emits: ['update:modelValue']
          },
          'el-button': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          'el-alert': { template: '<div class="el-alert"><slot /></div>' }
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('應該正確渲染組件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.login-container').exists()).toBe(true)
  })

  it('應該有初始表單數據', () => {
    expect(wrapper.vm.loginForm).toEqual({
      username: '',
      password: ''
    })
    expect(wrapper.vm.registerForm).toEqual({
      username: '',
      password: ''
    })
  })

  it('應該默認顯示登入標籤', () => {
    expect(wrapper.vm.activeTab).toBe('login')
  })

  it('應該有表單驗證規則', () => {
    expect(wrapper.vm.formRules).toHaveProperty('username')
    expect(wrapper.vm.formRules).toHaveProperty('password')
  })

  it('應該能處理表單輸入', async () => {
    wrapper.vm.loginForm.username = 'testuser'
    wrapper.vm.loginForm.password = 'password123'
    
    expect(wrapper.vm.loginForm.username).toBe('testuser')
    expect(wrapper.vm.loginForm.password).toBe('password123')
  })
})
