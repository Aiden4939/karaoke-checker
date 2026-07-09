import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default variant and forwards slot content', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me',
      },
    })

    const button = wrapper.get('button')

    expect(button.text()).toBe('Click me')
    expect(button.classes().join(' ')).toContain('bg-primary')
  })

  it('supports outline variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'outline',
      },
      slots: {
        default: 'Outline',
      },
    })

    expect(wrapper.get('button').classes().join(' ')).toContain('border')
  })
})
