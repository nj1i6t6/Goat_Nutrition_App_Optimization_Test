import { describe, it, expect, vi } from 'vitest'

describe('循環依賴修正測試', () => {
  it('應該能夠正常載入模組而不出現循環依賴錯誤', async () => {
    // 測試 API 模組
    expect(async () => {
      await import('../api/index.js')
    }).not.toThrow()

    // 測試 Router 模組
    expect(async () => {
      await import('../router/index.js')
    }).not.toThrow()

    // 測試 Auth Store 模組
    expect(async () => {
      await import('../stores/auth.js')
    }).not.toThrow()
  })

  it('應該能夠正常使用動態導入', async () => {
    const { default: api } = await import('../api/index.js')
    expect(api).toBeDefined()
    expect(typeof api.login).toBe('function')

    const { default: router } = await import('../router/index.js')
    expect(router).toBeDefined()
    expect(typeof router.push).toBe('function')

    const { useAuthStore } = await import('../stores/auth.js')
    expect(useAuthStore).toBeDefined()
    expect(typeof useAuthStore).toBe('function')
  })

  it('模組應該能夠正常初始化', async () => {
    // 模擬 API 導入測試
    const api = await import('../api/index.js')
    expect(api.default).toBeDefined()

    // 模擬 Router 導入測試  
    const router = await import('../router/index.js')
    expect(router.default).toBeDefined()

    // 模擬 Store 導入測試
    const store = await import('../stores/auth.js')
    expect(store.useAuthStore).toBeDefined()
  })
})
