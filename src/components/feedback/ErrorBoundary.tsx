import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl p-8">
          <div className="rounded-xl border border-danger-200 bg-danger-50 p-6">
            <h2 className="text-lg font-semibold text-danger-700">Something went wrong</h2>
            <pre className="mt-4 overflow-auto rounded-lg bg-white p-4 text-xs text-danger-600">
              {this.state.error?.toString()}
            </pre>
            {this.state.errorInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-danger-600">
                  Component stack
                </summary>
                <pre className="mt-2 overflow-auto rounded-lg bg-white p-4 text-xs text-gray-600">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="mt-4 rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
