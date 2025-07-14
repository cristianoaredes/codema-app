import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const notificationVariants = cva(
  "relative flex items-start gap-3 w-full rounded-lg border p-4 shadow-lg transition-all duration-300 animate-slide-in",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        success: "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
        error: "bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        warning: "bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
        info: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info
};

export function Notification({
  className,
  variant = "default",
  title,
  message,
  action,
  onClose,
  autoClose = true,
  duration = 5000,
  ...props
}: NotificationProps) {
  const Icon = iconMap[variant || 'default'];

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div
      className={cn(notificationVariants({ variant }), className)}
      role="alert"
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      
      <div className="flex-1 space-y-1">
        <p className="font-semibold leading-none tracking-tight">
          {title}
        </p>
        {message && (
          <p className="text-sm opacity-90">
            {message}
          </p>
        )}
        {action && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-inherit hover:underline"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>

      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-transparent opacity-70 hover:opacity-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar notificação</span>
        </Button>
      )}
    </div>
  );
}

// Container para notificações
export function NotificationContainer({ 
  children,
  position = "top-right" 
}: { 
  children: React.ReactNode;
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
}) {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2"
  };

  return (
    <div 
      className={cn(
        "fixed z-50 flex flex-col gap-2 pointer-events-none",
        positionClasses[position]
      )}
    >
      <div className="pointer-events-auto max-w-sm">
        {children}
      </div>
    </div>
  );
}

// Hook para gerenciar notificações
export function useNotification() {
  const [notifications, setNotifications] = React.useState<
    Array<NotificationProps & { id: string }>
  >([]);

  const show = React.useCallback((notification: NotificationProps) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { ...notification, id }]);
    
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    show,
    dismiss,
    dismissAll
  };
}