import { describe, expect, it, vi } from 'vitest'
import { createGracefulShutdownHandler } from './graceful-shutdown.js'

function createDeps() {
  const close = vi.fn((callback?: (error?: Error | null) => void) => {
    callback?.(null)
  })
  const exit = vi.fn()
  const onSignal = vi.fn()
  const onCloseError = vi.fn()

  return {
    deps: {
      server: { close },
      exit,
      onSignal,
      onCloseError,
    },
    close,
    exit,
    onSignal,
    onCloseError,
  }
}

describe('createGracefulShutdownHandler', () => {
  it('closes the server and exits with code 0 on success', () => {
    const { deps, close, exit, onSignal } = createDeps()
    const handleSignal = createGracefulShutdownHandler(deps)

    handleSignal('SIGTERM')

    expect(onSignal).toHaveBeenCalledWith('SIGTERM')
    expect(close).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(0)
  })

  it('ignores duplicate signals while shutting down', () => {
    const { deps, close, exit } = createDeps()
    const handleSignal = createGracefulShutdownHandler(deps)

    handleSignal('SIGINT')
    handleSignal('SIGTERM')

    expect(close).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledTimes(1)
    expect(exit).toHaveBeenCalledWith(0)
  })

  it('logs close errors and exits with code 1', () => {
    const closeError = new Error('close failed')
    const close = vi.fn((callback?: (error?: Error | null) => void) => {
      callback?.(closeError)
    })
    const exit = vi.fn()
    const onCloseError = vi.fn()
    const handleSignal = createGracefulShutdownHandler({
      server: { close },
      exit,
      onCloseError,
    })

    handleSignal('SIGTERM')

    expect(close).toHaveBeenCalledTimes(1)
    expect(onCloseError).toHaveBeenCalledWith(closeError)
    expect(exit).toHaveBeenCalledWith(1)
  })
})
