import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import { server } from '@/mocks/server'
import { healthErrorHandlers, healthLoadingHandlers } from '@/mocks/handlers'
import HomeView from '@/views/HomeView.vue'

describe('HomeView health card', () => {
  it('shows success state when health API responds', async () => {
    const wrapper = mount(HomeView)

    await flushPromises()

    expect(wrapper.find('[data-testid="health-success"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Service is healthy')
    expect(wrapper.text()).toContain('req-test-1')
  })

  it('shows loading state while health API is pending', async () => {
    server.use(...healthLoadingHandlers)

    const wrapper = mount(HomeView)

    expect(wrapper.find('[data-testid="health-loading"]').exists()).toBe(true)
  })

  it('shows error state when health API fails', async () => {
    server.use(...healthErrorHandlers)

    const wrapper = mount(HomeView)

    await flushPromises()

    expect(wrapper.find('[data-testid="health-error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Health check failed')
  })
})
