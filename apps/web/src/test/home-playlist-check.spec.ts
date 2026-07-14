import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

describe('HomeView playlist checker', () => {
  it('renders the playlist checker form', () => {
    const wrapper = mount(HomeView)

    expect(wrapper.get('h1').text()).toBe('Karaoke Checker')
    expect(wrapper.find('input[aria-label="YouTube playlist URL"]').exists()).toBe(true)
    expect(wrapper.get('button[type="submit"]').text()).toBe('Check')
  })
})
