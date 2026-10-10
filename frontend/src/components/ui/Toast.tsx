import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
    return id;
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string, title?: string) =>
    useToastStore.getState().addToast({ message, title, type: 'success' }),
  error: (message: string, title?: string) =>
    useToastStore.getState().addToast({ message, title, type: 'error' }),
  warning: (message: string, title?: string) =>
    useToastStore.getState().addToast({ message, title, type: 'warning' }),
  info: (message: string, title?: string) =>
    useToastStore.getState().addToast({ message, title, type: 'info' }),
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case 'info':
        return <Info className="h-5 w-5 text-sky-500 shrink-0" />;
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg text-card-foreground',
              'transition-all'
            )}
            role="alert"
          >
            {getIcon(t.type)}
            <div className="flex-1 text-left">
              {t.title && <h5 className="text-sm font-semibold">{t.title}</h5>}
              <p className="text-sm text-muted-foreground">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
