import { describe, it, expect } from 'vitest'

describe('Vue 組件導入測試', () => {
  it('應該能導入 Vue 組件', async () => {
    const LoginView = await import('./LoginView.vue')
    expect(LoginView).toBeDefined()
    expect(LoginView.default).toBeDefined()
  })
})
