import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx'
import { I18nProvider } from './i18n/index.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

// oxlint-disable-next-line react/only-export-components
function ThemedToaster() {
  const { isDark } = useTheme()
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: '12px',
          fontSize: '14px',
          background: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
        },
        success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
      }}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AuthProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </AuthProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </I18nProvider>
      </ThemeProvider>
      <ThemedToaster />
    </ErrorBoundary>
  </StrictMode>,
)
