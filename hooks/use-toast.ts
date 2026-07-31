import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, type: "info" as ToastType, duration: 4000, ...toast };
    set((state) => ({ toasts: [...state.toasts.slice(-4), newToast] }));

    if (newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (description: string, title?: string) =>
    useToastStore.getState().addToast({ type: "success", description, title }),
  error: (description: string, title?: string) =>
    useToastStore.getState().addToast({ type: "error", description, title }),
  info: (description: string, title?: string) =>
    useToastStore.getState().addToast({ type: "info", description, title }),
  warning: (description: string, title?: string) =>
    useToastStore.getState().addToast({ type: "warning", description, title }),
};
