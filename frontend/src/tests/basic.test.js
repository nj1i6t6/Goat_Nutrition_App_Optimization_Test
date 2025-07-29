import { describe, it, expect, vi } from 'vitest'

describe('基本功能測試', () => {
  it('應該能正常運行測試環境', () => {
    expect(1 + 1).toBe(2)
  })

  it('應該能正常使用 vi mock', () => {
    const mockFn = vi.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })

  it('應該能正常處理字符串', () => {
    const testString = 'Hello World'
    expect(testString).toBe('Hello World')
    expect(testString.length).toBe(11)
  })
})
