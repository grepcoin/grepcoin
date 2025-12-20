'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false })} />
    }
    return this.props.children
  }
}

function ErrorFallback({ error, onRetry }: { error?: Error; onRetry: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
