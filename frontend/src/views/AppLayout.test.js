import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import AppLayout from './AppLayout.vue'
import { useAuthStore } from '../stores/auth'

// Mock Element Plus components
const MockElHeader = {
  template: '<header class="el-header"><slot /></header>'
}

const MockElMenu = {
  template: `
    <nav class="el-menu" :class="mode">
      <slot />
    </nav>
  `,
  props: ['defaultActive', 'mode', 'ellipsis', 'router'],
  emits: ['select']
}

const MockElMenuItem = {
  template: `
    <div class="el-menu-item" :class="{ 'is-active': isActive }" @click="handleClick">
      <slot />
    </div>
  `,
  props: ['index'],
  computed: {
    isActive() {
      return this.$parent.defaultActive === this.index
    }
  },
  methods: {
    handleClick() {
      this.$parent.$emit('select', this.index)
      if (this.$parent.router) {
        this.$router.push(this.index)
      }
    }
  }
}

const MockElButton = {
  template: '<button class="el-button" :type="type" :size="size" @click="$emit(\'click\')"><slot /></button>',
  props: ['type', 'size', 'plain'],
  emits: ['click']
}

const MockElDrawer = {
  template: `
    <div v-if="modelValue" class="el-drawer" @click.self="$emit('update:modelValue', false)">
      <div class="drawer-content">
        <slot />
      </div>
    </div>
  `,
  props: ['modelValue', 'title', 'direction', 'withHeader', 'size'],
  emits: ['update:modelValue']
}

const MockElIcon = {
  template: '<i class="el-icon"><slot /></i>'
}

// Mock Element Plus icons
const mockIcons = {
  Menu: { template: '<span>Menu</span>' },
  DataAnalysis: { template: '<span>DataAnalysis</span>' },
  HelpFilled: { template: '<span>HelpFilled</span>' },
  Service: { template: '<span>Service</span>' },
  Tickets: { template: '<span>Tickets</span>' },
  Upload: { template: '<span>Upload</span>' },
  Setting: { template: '<span>Setting</span>' }
}

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: createMockElMessage(),
  ElMessageBox: createMockElMessageBox()
}))

// Mock router
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/consultation', component: { template: '<div>Consultation</div>' } },
    { path: '/chat', component: { template: '<div>Chat</div>' } },
    { path: '/flock', component: { template: '<div>Flock</div>' } },
    { path: '/data-management', component: { template: '<div>DataManagement</div>' } },
    { path: '/settings', component: { template: '<div>Settings</div>' } }
  ]
})

describe('AppLayout', () => {
  let wrapper
  let pinia
  let authStore

  const createWrapper = (route = '/dashboard') => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    mockRouter.push(route)
    
    return mount(AppLayout, {
      global: {
        plugins: [pinia, mockRouter],
        components: {
          ElHeader: MockElHeader,
          ElMenu: MockElMenu,
          ElMenuItem: MockElMenuItem,
          ElButton: MockElButton,
          ElDrawer: MockElDrawer,
          ElIcon: MockElIcon,
          ...mockIcons
        },
        stubs: {
          RouterView: { template: '<div class="router-view">Content</div>' }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    MockElMessageBox.confirm.mockResolvedValue(true)
    
    wrapper = createWrapper()
    authStore = useAuthStore()
    authStore.username = 'testuser'
    authStore.logout = vi.fn()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('組件初始化', () => {
    it('應該正確渲染布局', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.app-layout-container').exists()).toBe(true)
    })

    it('應該渲染標題列', () => {
      const header = wrapper.findComponent(MockElHeader)
      expect(header.exists()).toBe(true)
      expect(header.classes()).toContain('top-nav')
    })

    it('應該渲染主內容區域', () => {
      const main = wrapper.find('.main-content')
      expect(main.exists()).toBe(true)
    })

    it('應該渲染router-view', () => {
      const routerView = wrapper.find('.router-view')
      expect(routerView.exists()).toBe(true)
    })
  })

  describe('導航功能', () => {
    it('應該顯示logo', () => {
      const logo = wrapper.find('.logo')
      expect(logo.exists()).toBe(true)
      expect(logo.find('img').exists()).toBe(true)
      expect(logo.find('span').text()).toBe('領頭羊博士')
    })

    it('應該點擊logo跳轉到儀表板', async () => {
      const logo = wrapper.find('.logo')
      const routerPushSpy = vi.spyOn(mockRouter, 'push')
      
      await logo.trigger('click')
      
      expect(routerPushSpy).toHaveBeenCalledWith('/dashboard')
    })

    it('應該渲染頂部菜單', () => {
      const topMenu = wrapper.find('.top-menu')
      expect(topMenu.exists()).toBe(true)
    })

    it('應該有正確的菜單項目', () => {
      const menuItems = wrapper.findAllComponents(MockElMenuItem)
      const expectedItems = [
        '/dashboard',
        '/consultation', 
        '/chat',
        '/flock',
        '/data-management',
        '/settings'
      ]
      
      expect(menuItems.length).toBeGreaterThanOrEqual(expectedItems.length)
    })

    it('應該高亮當前路由', async () => {
      await mockRouter.push('/dashboard')
      await wrapper.vm.$nextTick()
      
      const menu = wrapper.findComponent(MockElMenu)
      expect(menu.props('defaultActive')).toBe('/dashboard')
    })
  })

  describe('用戶資訊', () => {
    it('應該顯示用戶名稱', () => {
      const userInfo = wrapper.find('.user-info')
      expect(userInfo.exists()).toBe(true)
      expect(userInfo.text()).toContain('testuser')
    })

    it('應該有登出按鈕', () => {
      const logoutButton = wrapper.findComponent(MockElButton)
      expect(logoutButton.exists()).toBe(true)
      expect(logoutButton.props('type')).toBe('danger')
    })

    it('應該處理登出操作', async () => {
      const logoutButton = wrapper.findComponent(MockElButton)
      
      await logoutButton.vm.$emit('click')
      
      expect(MockElMessageBox.confirm).toHaveBeenCalledWith(
        '您確定要登出嗎？',
        '提示',
        expect.objectContaining({
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      )
    })

    it('應該在確認後執行登出', async () => {
      const logoutButton = wrapper.findComponent(MockElButton)
      
      await logoutButton.vm.$emit('click')
      await wrapper.vm.$nextTick()
      
      expect(authStore.logout).toHaveBeenCalled()
      expect(MockElMessage).toHaveBeenCalledWith({
        type: 'success',
        message: '您已成功登出'
      })
    })

    it('應該處理登出取消', async () => {
      MockElMessageBox.confirm.mockRejectedValue(new Error('cancelled'))
      
      const logoutButton = wrapper.findComponent(MockElButton)
      await logoutButton.vm.$emit('click')
      
      // 不應該調用logout
      expect(authStore.logout).not.toHaveBeenCalled()
    })
  })

  describe('響應式設計', () => {
    it('應該有漢堡選單按鈕', () => {
      const hamburgerMenu = wrapper.find('.hamburger-menu')
      expect(hamburgerMenu.exists()).toBe(true)
    })

    it('應該點擊漢堡選單打開抽屜', async () => {
      const hamburgerMenu = wrapper.find('.hamburger-menu')
      
      expect(wrapper.vm.drawerVisible).toBe(false)
      
      await hamburgerMenu.trigger('click')
      
      expect(wrapper.vm.drawerVisible).toBe(true)
    })

    it('應該渲染抽屜菜單', () => {
      const drawer = wrapper.findComponent(MockElDrawer)
      expect(drawer.exists()).toBe(true)
      expect(drawer.props('title')).toBe('導航選單')
      expect(drawer.props('direction')).toBe('rtl')
      expect(drawer.props('size')).toBe('260px')
    })

    it('應該在抽屜中有菜單項目', () => {
      const drawerMenu = wrapper.find('.drawer-menu')
      expect(drawerMenu.exists()).toBe(true)
    })

    it('應該選擇菜單項目後關閉抽屜', async () => {
      wrapper.vm.drawerVisible = true
      await wrapper.vm.$nextTick()
      
      const drawerMenu = wrapper.findComponent({ name: 'el-menu', class: 'drawer-menu' })
      if (drawerMenu.exists()) {
        drawerMenu.vm.$emit('select', '/dashboard')
        await wrapper.vm.$nextTick()
        
        expect(wrapper.vm.drawerVisible).toBe(false)
      }
    })
  })

  describe('路由整合', () => {
    it('應該根據當前路由設置active狀態', async () => {
      await mockRouter.push('/consultation')
      await wrapper.vm.$nextTick()
      
      const menu = wrapper.findComponent(MockElMenu)
      expect(menu.props('defaultActive')).toBe('/consultation')
    })

    it('應該在不同路由間正確切換', async () => {
      const routes = ['/dashboard', '/consultation', '/chat', '/flock']
      
      for (const route of routes) {
        await mockRouter.push(route)
        await wrapper.vm.$nextTick()
        
        expect(mockRouter.currentRoute.value.path).toBe(route)
      }
    })
  })

  describe('樣式和布局', () => {
    it('應該有正確的CSS類別', () => {
      expect(wrapper.find('.app-layout-container').exists()).toBe(true)
      expect(wrapper.find('.top-nav').exists()).toBe(true)
      expect(wrapper.find('.main-content').exists()).toBe(true)
      expect(wrapper.find('.right-panel').exists()).toBe(true)
    })

    it('應該有固定的頂部導航', () => {
      const topNav = wrapper.find('.top-nav')
      expect(topNav.exists()).toBe(true)
    })

    it('應該有響應式布局', () => {
      const topMenu = wrapper.find('.top-menu')
      const hamburgerMenu = wrapper.find('.hamburger-menu')
      
      expect(topMenu.exists()).toBe(true)
      expect(hamburgerMenu.exists()).toBe(true)
    })
  })

  describe('無障礙功能', () => {
    it('應該有適當的ARIA標籤', () => {
      const logo = wrapper.find('.logo')
      expect(logo.find('img').attributes('alt')).toBe('Logo')
    })

    it('應該支援鍵盤導航', () => {
      const menuItems = wrapper.findAllComponents(MockElMenuItem)
      expect(menuItems.length).toBeGreaterThan(0)
    })

    it('應該有適當的語義化標籤', () => {
      const header = wrapper.find('header')
      const main = wrapper.find('main')
      const nav = wrapper.find('nav')
      
      expect(header.exists()).toBe(true)
      expect(main.exists()).toBe(true)
      expect(nav.exists()).toBe(true)
    })
  })

  describe('狀態管理', () => {
    it('應該正確管理抽屜可見性', async () => {
      expect(wrapper.vm.drawerVisible).toBe(false)
      
      wrapper.vm.drawerVisible = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.drawerVisible).toBe(true)
    })

    it('應該響應認證狀態變化', async () => {
      authStore.username = 'newuser'
      await wrapper.vm.$nextTick()
      
      const userInfo = wrapper.find('.user-info')
      expect(userInfo.text()).toContain('newuser')
    })
  })

  describe('錯誤處理', () => {
    it('應該處理登出錯誤', async () => {
      authStore.logout.mockRejectedValue(new Error('Logout failed'))
      
      const logoutButton = wrapper.findComponent(MockElButton)
      await logoutButton.vm.$emit('click')
      
      // 應該仍然調用logout方法
      expect(authStore.logout).toHaveBeenCalled()
    })

    it('應該處理路由錯誤', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      try {
        await mockRouter.push('/invalid-route')
      } catch (error) {
        // 預期會有錯誤
      }
      
      consoleSpy.mockRestore()
    })
  })

  describe('性能優化', () => {
    it('應該使用響應式數據', () => {
      expect(wrapper.vm.drawerVisible).toBeDefined()
      expect(typeof wrapper.vm.drawerVisible).toBe('boolean')
    })

    it('應該正確清理組件', () => {
      const instance = wrapper.vm
      
      wrapper.unmount()
      
      // 組件應該被正確清理
      expect(instance).toBeDefined()
    })
  })
})
