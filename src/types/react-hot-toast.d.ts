declare module 'react-hot-toast' {
  export type ToastPosition = 
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

  export interface ToasterProps {
    position?: ToastPosition;
    toastOptions?: ToastOptions;
    reverseOrder?: boolean;
    gutter?: number;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
  }

  export interface ToastOptions {
    id?: string;
    duration?: number;
    style?: React.CSSProperties;
    className?: string;
    success?: {
      duration?: number;
      icon?: React.ReactNode;
    };
    error?: {
      duration?: number;
      icon?: React.ReactNode;
    };
    loading?: {
      duration?: number;
      icon?: React.ReactNode;
    };
    custom?: {
      duration?: number;
      icon?: React.ReactNode;
    };
  }

  export function Toaster(props: ToasterProps): JSX.Element;
  
  export function toast(message: string, options?: ToastOptions): string;
  
  toast.success = function(message: string, options?: ToastOptions): string { return ''; };
  toast.error = function(message: string, options?: ToastOptions): string { return ''; };
  toast.loading = function(message: string, options?: ToastOptions): string { return ''; };
  toast.custom = function(component: React.ReactNode, options?: ToastOptions): string { return ''; };
  toast.dismiss = function(toastId?: string): void {};

  export default toast;
} 