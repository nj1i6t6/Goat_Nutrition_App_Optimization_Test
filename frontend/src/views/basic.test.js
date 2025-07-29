import { describe, it, expect } from 'vitest'

describe('基礎測試', () => {
  it('應該能執行基本測試', () => {
    expect(1 + 1).toBe(2)
  })
  
  it('應該能執行 Vue 測試工具', async () => {
    const { mount } = await import('@vue/test-utils')
    expect(mount).toBeDefined()
  })
})
