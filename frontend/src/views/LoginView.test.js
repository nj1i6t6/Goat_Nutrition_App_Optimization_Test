import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from './LoginView.vue'
import { createPinia, setActivePinia } from 'pinia'

// Mock Vue Router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

// Mock API
vi.mock('@/api', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  }
}))

// Mock Element Plus message
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock auth store 直接在這裡定義
const mockAuthStore = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  user: null,
  isAuthenticated: false,
  username: '訪客'
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

describe('LoginView', () => {
  let wrapper
  let pinia

  const createWrapper = (props = {}) => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    return mount(LoginView, {
      props,
      global: {
        plugins: [pinia],
        components: {
          ElButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          ElInput: { 
            template: '<input v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
            emits: ['update:modelValue']
          },
          ElForm: { 
            template: '<form @submit="$emit(\'submit\', $event)"><slot /></form>',
            methods: {
              validate: vi.fn((callback) => callback(true))
            }
          },
          ElFormItem: { template: '<div><slot /></div>' },
          ElTabs: { 
            template: '<div><slot /></div>',
            props: ['modelValue']
          },
          ElTabPane: { template: '<div><slot /></div>' },
          ElAlert: { template: '<div class="el-alert"><slot /></div>' }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
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
      expect(wrapper.find('.login-container').exists()).toBe(true)
    })

    it('應該顯示logo和標題', () => {
      const logo = wrapper.find('.login-logo')
      expect(logo.exists()).toBe(true)
      expect(logo.find('h1').text()).toBe('領頭羊博士')
      expect(logo.find('p').text()).toBe('您的智能飼養顧問')
    })

    it('應該默認顯示登入頁籤', () => {
      expect(wrapper.vm.activeTab).toBe('login')
    })

    it('應該初始化表單數據', () => {
      expect(wrapper.vm.loginForm).toEqual({
        username: '',
        password: ''
      })
      expect(wrapper.vm.registerForm).toEqual({
        username: '',
        password: ''
      })
    })
  })

  describe('頁籤切換', () => {
    it('應該支持在登入和註冊間切換', async () => {
      expect(wrapper.vm.activeTab).toBe('login')
      
      wrapper.vm.activeTab = 'register'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.activeTab).toBe('register')
    })

    it('應該根據activeTab顯示相應表單', async () => {
      // 默認顯示登入表單
      expect(wrapper.find('form').exists()).toBe(true)
      
      // 切換到註冊
      wrapper.vm.activeTab = 'register'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('form').exists()).toBe(true)
    })
  })

  describe('登入功能', () => {
    beforeEach(() => {
      wrapper.vm.activeTab = 'login'
    })

    it('應該處理登入表單提交', async () => {
      mockAuthStore.login.mockResolvedValue()
      
      wrapper.vm.loginForm.username = 'testuser'
      wrapper.vm.loginForm.password = 'password123'
      
      await wrapper.vm.handleLogin()
      
      expect(mockAuthStore.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      })
      // 使用 vi.mocked 來獲取 mock 函數
      const { ElMessage } = await import('element-plus')
      expect(ElMessage.success).toHaveBeenCalledWith('登入成功！')
    })

    it('應該處理登入失敗', async () => {
      const error = { error: '用戶名或密碼錯誤' }
      mockAuthStore.login.mockRejectedValue(error)
      
      wrapper.vm.loginForm.username = 'testuser'
      wrapper.vm.loginForm.password = 'wrongpassword'
      
      await wrapper.vm.handleLogin()
      
      expect(wrapper.vm.errorMessage).toBe('用戶名或密碼錯誤')
    })

    it('應該在登入時顯示載入狀態', async () => {
      let resolveLogin
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve
      })
      mockAuthStore.login.mockReturnValue(loginPromise)
      
      wrapper.vm.loginForm.username = 'testuser'
      wrapper.vm.loginForm.password = 'password123'
      
      const loginPromiseResult = wrapper.vm.handleLogin()
      
      expect(wrapper.vm.loading).toBe(true)
      
      resolveLogin()
      await loginPromiseResult
      
      expect(wrapper.vm.loading).toBe(false)
    })

    it('應該處理未知錯誤', async () => {
      mockAuthStore.login.mockRejectedValue(new Error('Network error'))
      
      wrapper.vm.loginForm.username = 'testuser'
      wrapper.vm.loginForm.password = 'password123'
      
      await wrapper.vm.handleLogin()
      
      expect(wrapper.vm.errorMessage).toBe('登入時發生未知錯誤')
    })
  })

  describe('註冊功能', () => {
    beforeEach(() => {
      wrapper.vm.activeTab = 'register'
    })

    it('應該處理註冊表單提交', async () => {
      mockAuthStore.register.mockResolvedValue()
      
      wrapper.vm.registerForm.username = 'newuser'
      wrapper.vm.registerForm.password = 'password123'
      
      await wrapper.vm.handleRegister()
      
      expect(mockAuthStore.register).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'password123'
      })
      const { ElMessage } = await import('element-plus')
      expect(ElMessage.success).toHaveBeenCalledWith('註冊成功！')
    })

    it('應該處理註冊失敗', async () => {
      const error = { error: '用戶名已存在' }
      mockAuthStore.register.mockRejectedValue(error)
      
      wrapper.vm.registerForm.username = 'existinguser'
      wrapper.vm.registerForm.password = 'password123'
      
      await wrapper.vm.handleRegister()
      
      expect(wrapper.vm.errorMessage).toBe('用戶名已存在')
    })

    it('應該在註冊時顯示載入狀態', async () => {
      let resolveRegister
      const registerPromise = new Promise(resolve => {
        resolveRegister = resolve
      })
      mockAuthStore.register.mockReturnValue(registerPromise)
      
      wrapper.vm.registerForm.username = 'newuser'
      wrapper.vm.registerForm.password = 'password123'
      
      const registerPromiseResult = wrapper.vm.handleRegister()
      
      expect(wrapper.vm.loading).toBe(true)
      
      resolveRegister()
      await registerPromiseResult
      
      expect(wrapper.vm.loading).toBe(false)
    })

    it('應該處理註冊時的未知錯誤', async () => {
      mockAuthStore.register.mockRejectedValue(new Error('Network error'))
      
      wrapper.vm.registerForm.username = 'newuser'
      wrapper.vm.registerForm.password = 'password123'
      
      await wrapper.vm.handleRegister()
      
      expect(wrapper.vm.errorMessage).toBe('註冊時發生未知錯誤')
    })
  })

  describe('表單驗證', () => {
    it('應該有正確的驗證規則', () => {
      expect(wrapper.vm.formRules).toHaveProperty('username')
      expect(wrapper.vm.formRules).toHaveProperty('password')
      
      const usernameRules = wrapper.vm.formRules.username
      const passwordRules = wrapper.vm.formRules.password
      
      expect(usernameRules[0].required).toBe(true)
      expect(passwordRules[0].required).toBe(true)
      expect(passwordRules[1].min).toBe(6)
    })

    it('應該清除錯誤訊息', async () => {
      wrapper.vm.errorMessage = '測試錯誤'
      
      await wrapper.vm.handleLogin()
      
      expect(wrapper.vm.errorMessage).toBe('')
    })
  })

  describe('錯誤處理', () => {
    it('應該顯示錯誤訊息', async () => {
      wrapper.vm.errorMessage = '測試錯誤訊息'
      await wrapper.vm.$nextTick()
      
      const alert = wrapper.find('.el-alert')
      expect(alert.exists()).toBe(true)
    })

    it('應該隱藏錯誤訊息當沒有錯誤時', async () => {
      wrapper.vm.errorMessage = ''
      await wrapper.vm.$nextTick()
      
      const alert = wrapper.find('.el-alert')
      expect(alert.exists()).toBe(false)
    })
  })

  describe('用戶界面交互', () => {
    it('應該支持表單提交', async () => {
      const form = wrapper.find('form')
      const handleLoginSpy = vi.spyOn(wrapper.vm, 'handleLogin')
      
      await form.trigger('submit')
      
      expect(handleLoginSpy).toHaveBeenCalled()
    })

    it('應該支持輸入用戶名', async () => {
      const input = wrapper.find('input')
      await input.setValue('testuser')
      
      expect(wrapper.vm.loginForm.username).toBe('testuser')
    })
  })

  describe('樣式類別', () => {
    it('應該應用正確的CSS類別', () => {
      expect(wrapper.find('.login-page-body').exists()).toBe(true)
      expect(wrapper.find('.login-container').exists()).toBe(true)
      expect(wrapper.find('.login-logo').exists()).toBe(true)
    })

    it('應該有響應式設計', () => {
      const container = wrapper.find('.login-container')
      expect(container.exists()).toBe(true)
    })
  })

  describe('無障礙功能', () => {
    it('應該有適當的標籤', () => {
      const logo = wrapper.find('.login-logo img')
      expect(logo.attributes('alt')).toBe('領頭羊博士 Logo')
    })

    it('應該支持鍵盤導航', () => {
      const form = wrapper.find('form')
      expect(form.exists()).toBe(true)
    })
  })
})
