export type ShutdownServer = {
  close: (callback?: (error?: Error | null) => void) => void
}

export type GracefulShutdownDependencies = {
  server: ShutdownServer
  exit: (code: number) => void
  onSignal?: (signal: string) => void
  onCloseError?: (error: Error) => void
}

export function createGracefulShutdownHandler(deps: GracefulShutdownDependencies) {
  let isShuttingDown = false

  return (signal: string) => {
    if (isShuttingDown) {
      return
    }

    isShuttingDown = true
    deps.onSignal?.(signal)

    deps.server.close((error) => {
      if (error) {
        deps.onCloseError?.(error)
        deps.exit(1)
        return
      }

      deps.exit(0)
    })
  }
}

export function registerGracefulShutdown(
  signals: NodeJS.Signals[],
  deps: GracefulShutdownDependencies,
) {
  const handleSignal = createGracefulShutdownHandler(deps)

  for (const signal of signals) {
    process.on(signal, () => handleSignal(signal))
  }
}
