import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-5xl">😵</p>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="mt-2 text-gray-500">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.href = '/'
              }}
              className="mt-6 px-6 py-3 font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
            >
              Go home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
