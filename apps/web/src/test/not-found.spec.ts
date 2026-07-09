import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import NotFoundView from '@/views/NotFoundView.vue'

describe('NotFoundView', () => {
  it('renders 404 content for unknown routes', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: AppLayout,
          children: [
            {
              path: ':pathMatch(.*)*',
              component: NotFoundView,
            },
          ],
        },
      ],
    })

    await router.push('/does-not-exist')
    await router.isReady()

    const wrapper = mount(AppLayout, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Page not found')
    expect(wrapper.text()).toContain('Back to home')
  })
})
