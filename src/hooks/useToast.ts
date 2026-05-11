import { toast } from "sonner";

export type ToastOptions = {
  description?: string;
};

export function useToast() {
  return {
    success: (title: string, opts?: ToastOptions) => toast.success(title, opts),
    error: (title: string, opts?: ToastOptions) => toast.error(title, opts),
    info: (title: string, opts?: ToastOptions) => toast(title, opts),
  };
}

