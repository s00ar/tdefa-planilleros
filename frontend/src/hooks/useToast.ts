import { toast } from "sonner";

export type ToastOptions = {
  description?: string;
};

const toastApi = {
  success: (title: string, opts?: ToastOptions) => toast.success(title, opts),
  error: (title: string, opts?: ToastOptions) => toast.error(title, opts),
  info: (title: string, opts?: ToastOptions) => toast(title, opts),
};

export function useToast() {
  return toastApi;
}
