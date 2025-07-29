/**
 * ChatView 測試
 * @jest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ChatView from './ChatView.vue'
import { useSettingsStore } from '../stores/settings'
import { useChatStore } from '../stores/chat'
import { useSheepStore } from '../stores/sheep'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  }
}))

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Service: 'service-icon',
  Delete: 'delete-icon',
  Search: 'search-icon'
}))

describe('ChatView', () => {
  let wrapper
  let pinia
  let settingsStore
  let chatStore
  let sheepStore

  // Mock data
  const mockSheepList = [
    { EarNum: 'SH001', Breed: '努比亞' },
    { EarNum: 'SH002', Breed: '波爾' },
    { EarNum: 'SH003', Breed: '台灣黑山羊' }
  ]

  const mockMessages = [
    { role: 'user', content: '你好' },
    { role: 'model', content: '您好！我是領頭羊博士，很高興為您服務。' }
  ]

  beforeEach(() => {
    pinia = createPinia()
    
    wrapper = mount(ChatView, {
      global: {
        plugins: [pinia],
        stubs: {
          'el-card': {
            template: '<div class="el-card"><slot /></div>'
          },
          'el-icon': {
            template: '<span class="el-icon"><slot /></span>'
          },
          'el-select-v2': {
            template: `
              <select 
                class="el-select-v2" 
                :value="modelValue" 
                @change="$emit('update:modelValue', $event.target.value)"
              >
                <option v-for="option in options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            `,
            props: ['modelValue', 'options', 'placeholder', 'clearable', 'filterable', 'loading'],
            emits: ['update:modelValue']
          },
          'el-input': {
            template: `
              <div class="el-input">
                <input 
                  v-if="type !== 'textarea'"
                  :value="modelValue" 
                  @input="$emit('update:modelValue', $event.target.value)" 
                  @keyup.enter="$emit('keyup', $event)"
                  :placeholder="placeholder" 
                />
                <textarea
                  v-else
                  :value="modelValue" 
                  @input="$emit('update:modelValue', $event.target.value)" 
                  @keyup.enter.prevent="$emit('keyup', $event)"
                  :placeholder="placeholder"
                  :rows="rows"
                ></textarea>
                <slot name="append" />
              </div>
            `,
            props: ['modelValue', 'placeholder', 'clearable', 'type', 'rows', 'resize'],
            emits: ['update:modelValue', 'keyup']
          },
          'el-button': {
            template: '<button @click="$emit(\'click\')" :disabled="disabled"><slot /></button>',
            props: ['type', 'loading', 'disabled', 'icon'],
            emits: ['click']
          }
        }
      }
    })

    settingsStore = useSettingsStore()
    chatStore = useChatStore()
    sheepStore = useSheepStore()
    
    // 設置 mock 數據
    sheepStore.sheepList = mockSheepList
    chatStore.messages = [...mockMessages]
    settingsStore.apiKey = 'test-api-key'
    
    // 重置所有 mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('組件初始化', () => {
    it('應該正確渲染組件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.chat-page').exists()).toBe(true)
      expect(wrapper.find('.page-title').text()).toContain('AI 問答助理')
    })

    it('應該在掛載時獲取羊隻列表', () => {
      const fetchSpy = vi.spyOn(sheepStore, 'fetchSheepList')
      
      mount(ChatView, {
        global: {
          plugins: [pinia],
          stubs: {
            'el-card': { template: '<div><slot /></div>' },
            'el-icon': { template: '<span><slot /></span>' },
            'el-select-v2': { template: '<select></select>' },
            'el-input': { template: '<input />' },
            'el-button': { template: '<button></button>' }
          }
        }
      })
      
      expect(fetchSpy).toHaveBeenCalled()
    })
  })

  describe('羊隻選擇功能', () => {
    it('應該正確生成羊隻選項', () => {
      const expectedOptions = [
        { value: 'SH001', label: 'SH001 (努比亞)' },
        { value: 'SH002', label: 'SH002 (波爾)' },
        { value: 'SH003', label: 'SH003 (台灣黑山羊)' }
      ]
      
      expect(wrapper.vm.sheepOptions).toEqual(expectedOptions)
    })

    it('應該處理手動搜索成功的情況', async () => {
      const { ElMessage } = await import('element-plus')
      
      wrapper.vm.manualEarNumInput = 'SH001'
      await wrapper.vm.handleManualSearch()
      
      expect(wrapper.vm.selectedEarNum).toBe('SH001')
      expect(wrapper.vm.manualEarNumInput).toBe('')
      expect(ElMessage.success).toHaveBeenCalledWith('已成功定位到羊隻 SH001')
    })

    it('應該處理手動搜索失敗的情況', async () => {
      const { ElMessage } = await import('element-plus')
      
      wrapper.vm.manualEarNumInput = 'INVALID'
      await wrapper.vm.handleManualSearch()
      
      expect(wrapper.vm.selectedEarNum).toBe('')
      expect(ElMessage.error).toHaveBeenCalledWith('在您的羊群中找不到耳號為 INVALID 的羊隻')
    })

    it('應該處理空的手動搜索輸入', async () => {
      const { ElMessage } = await import('element-plus')
      
      wrapper.vm.manualEarNumInput = '  '
      await wrapper.vm.handleManualSearch()
      
      expect(ElMessage.warning).toHaveBeenCalledWith('請輸入要查詢的耳號')
    })
  })

  describe('聊天功能', () => {
    it('應該顯示聊天訊息', () => {
      const messages = wrapper.findAll('.chat-message')
      expect(messages).toHaveLength(2)
      
      const userMessage = messages[0]
      const modelMessage = messages[1]
      
      expect(userMessage.classes()).toContain('user')
      expect(modelMessage.classes()).toContain('model')
    })

    it('應該處理發送訊息', async () => {
      const sendMessageSpy = vi.spyOn(chatStore, 'sendMessage').mockResolvedValue()
      
      wrapper.vm.userInput = '這是測試訊息'
      await wrapper.vm.handleSendMessage()
      
      expect(sendMessageSpy).toHaveBeenCalledWith('test-api-key', '這是測試訊息', '')
      expect(wrapper.vm.userInput).toBe('')
    })

    it('應該阻止發送空訊息', async () => {
      const sendMessageSpy = vi.spyOn(chatStore, 'sendMessage')
      
      wrapper.vm.userInput = '   '
      await wrapper.vm.handleSendMessage()
      
      expect(sendMessageSpy).not.toHaveBeenCalled()
    })

    it('應該檢查 API 金鑰', async () => {
      const { ElMessage } = await import('element-plus')
      settingsStore.hasApiKey = false
      
      wrapper.vm.userInput = '測試訊息'
      await wrapper.vm.handleSendMessage()
      
      expect(ElMessage.error).toHaveBeenCalledWith('請先在「系統設定」中設定並測試有效的 API 金鑰')
    })

    it('應該在載入時顯示載入動畫', async () => {
      chatStore.isLoading = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.loading-dots').exists()).toBe(true)
    })

    it('應該支持使用選定的羊隻發送訊息', async () => {
      const sendMessageSpy = vi.spyOn(chatStore, 'sendMessage').mockResolvedValue()
      
      wrapper.vm.selectedEarNum = 'SH001'
      wrapper.vm.userInput = '這隻羊的狀況如何？'
      await wrapper.vm.handleSendMessage()
      
      expect(sendMessageSpy).toHaveBeenCalledWith('test-api-key', '這隻羊的狀況如何？', 'SH001')
    })

    it('應該支持清空對話', () => {
      const clearChatSpy = vi.spyOn(chatStore, 'clearChat')
      
      const clearButton = wrapper.find('.clear-btn')
      clearButton.trigger('click')
      
      expect(clearChatSpy).toHaveBeenCalled()
    })
  })

  describe('用戶界面交互', () => {
    it('應該支持按 Enter 鍵發送訊息', async () => {
      const sendMessageSpy = vi.spyOn(chatStore, 'sendMessage').mockResolvedValue()
      
      wrapper.vm.userInput = '測試訊息'
      
      const textarea = wrapper.find('textarea')
      await textarea.trigger('keyup.enter.prevent')
      
      expect(sendMessageSpy).toHaveBeenCalled()
    })

    it('應該支持按 Enter 鍵執行手動搜索', async () => {
      const handleManualSearchSpy = vi.spyOn(wrapper.vm, 'handleManualSearch')
      
      const manualInput = wrapper.find('.manual-input input')
      await manualInput.trigger('keyup.enter')
      
      expect(handleManualSearchSpy).toHaveBeenCalled()
    })

    it('應該在沒有輸入時禁用發送按鈕', async () => {
      wrapper.vm.userInput = ''
      await wrapper.vm.$nextTick()
      
      const sendButton = wrapper.find('.chat-input-area button')
      expect(sendButton.attributes('disabled')).toBeDefined()
    })

    it('應該在載入時禁用發送按鈕', async () => {
      chatStore.isLoading = true
      await wrapper.vm.$nextTick()
      
      const sendButton = wrapper.find('.chat-input-area button')
      expect(sendButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('邊界條件處理', () => {
    it('應該處理空的羊隻列表', () => {
      sheepStore.sheepList = []
      expect(wrapper.vm.sheepOptions).toEqual([])
    })

    it('應該處理沒有品種信息的羊隻', () => {
      sheepStore.sheepList = [{ EarNum: 'SH004' }]
      
      const expectedOptions = [
        { value: 'SH004', label: 'SH004 (未知品種)' }
      ]
      
      expect(wrapper.vm.sheepOptions).toEqual(expectedOptions)
    })

    it('應該處理聊天容器的滾動', async () => {
      const mockScrollIntoView = vi.fn()
      const mockChatContainer = {
        scrollTop: 0,
        scrollHeight: 1000
      }
      
      wrapper.vm.$refs.chatContainerRef = mockChatContainer
      
      // 測試訊息更新後的滾動
      chatStore.messages.push({ role: 'user', content: '新訊息' })
      await wrapper.vm.$nextTick()
      
      expect(mockChatContainer.scrollTop).toBe(1000)
    })

    it('應該處理發送訊息時的錯誤', async () => {
      const error = new Error('發送失敗')
      vi.spyOn(chatStore, 'sendMessage').mockRejectedValue(error)
      
      wrapper.vm.userInput = '測試訊息'
      
      // 不應該拋出錯誤
      await expect(wrapper.vm.handleSendMessage()).resolves.toBeUndefined()
    })
  })

  describe('響應式設計', () => {
    it('應該正確計算聊天容器高度', () => {
      const chatContainer = wrapper.find('.chat-container')
      const styles = getComputedStyle(chatContainer.element)
      
      expect(styles.height).toContain('calc(100vh - 420px)')
      expect(styles.minHeight).toBe('300px')
    })

    it('應該支持彈性布局', () => {
      const chatControls = wrapper.find('.chat-controls')
      const styles = getComputedStyle(chatControls.element)
      
      expect(styles.display).toBe('flex')
      expect(styles.flexWrap).toBe('wrap')
    })
  })
})
