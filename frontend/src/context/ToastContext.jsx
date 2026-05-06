import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const toastId = ++id
    setToasts(t => [...t, { id: toastId, message, type }])
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === toastId ? { ...x, hide: true } : x))
      setTimeout(() => setToasts(t => t.filter(x => x.id !== toastId)), 320)
    }, duration)
  }, [])

  const toast = {
    success: (msg, d)  => addToast(msg, 'success', d),
    error:   (msg, d)  => addToast(msg, 'error',   d),
    info:    (msg, d)  => addToast(msg, 'info',     d),
    warning: (msg, d)  => addToast(msg, 'warning',  d),
  }

  const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type} ${t.hide ? 'hide' : ''}`}>
            <span>{ICONS[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
