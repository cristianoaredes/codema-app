import * as React from "react";
import { useForm, UseFormReturn, FieldValues, FieldPath, Path, DefaultValues, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Clock, 
  Wifi, 
  WifiOff 
} from "lucide-react";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface AutoSaveConfig {
  enabled: boolean;
  interval?: number; // ms
  key: string; // localStorage key
  onSave?: (data: Record<string, unknown>) => Promise<void>;
  onError?: (error: Error) => void;
}

export interface SmartFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void>;
  autoSave?: AutoSaveConfig;
  className?: string;
  children: (form: UseFormReturn<T>) => React.ReactNode;
  submitButton?: {
    text?: string;
    loadingText?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  };
  realTimeValidation?: boolean;
  showSaveStatus?: boolean;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export function SmartForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  autoSave,
  className,
  children,
  submitButton = { text: "Salvar", loadingText: "Salvando..." },
  realTimeValidation = true,
  showSaveStatus = true
}: SmartFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>('idle');
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const { toast } = useToast();
  
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: realTimeValidation ? 'onChange' : 'onSubmit'
  });

  const { watch, formState } = form;
  const watchedValues = watch();

  // Network status monitoring
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved data from localStorage on mount
  React.useEffect(() => {
    if (autoSave?.enabled && autoSave.key) {
      try {
        const savedData = localStorage.getItem(autoSave.key);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          form.reset(parsed);
          toast({
            title: "Dados restaurados",
            description: "Seus dados foram restaurados automaticamente.",
            variant: "default"
          });
        }
      } catch (error) {
        console.warn('Failed to load saved form data:', error);
      }
    }
  }, [autoSave?.key, autoSave?.enabled, form, toast]);

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave?.enabled || !isOnline) return;

    const timeoutId = setTimeout(async () => {
      if (formState.isDirty && Object.keys(formState.dirtyFields).length > 0) {
        setSaveStatus('saving');
        
        try {
          // Save to localStorage
          if (autoSave.key) {
            localStorage.setItem(autoSave.key, JSON.stringify(watchedValues));
          }

          // Call custom save function if provided
          if (autoSave.onSave) {
            await autoSave.onSave(watchedValues);
          }

          setSaveStatus('saved');
          
          // Reset to idle after showing success
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
          setSaveStatus('error');
          autoSave.onError?.(error as Error);
          setTimeout(() => setSaveStatus('idle'), 3000);
        }
      }
    }, autoSave.interval || 3000);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, formState.isDirty, formState.dirtyFields, autoSave, isOnline]);

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      
      // Clear auto-saved data on successful submit
      if (autoSave?.enabled && autoSave.key) {
        localStorage.removeItem(autoSave.key);
      }
      
      toast({
        title: "Sucesso",
        description: "Formulário enviado com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'saved':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Salvando...';
      case 'saved':
        return 'Salvo automaticamente';
      case 'error':
        return 'Erro ao salvar';
      case 'offline':
        return 'Offline - salvará quando conectar';
      default:
        return formState.isDirty ? 'Alterações não salvas' : 'Tudo salvo';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return 'text-blue-600';
      case 'saved':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'offline':
        return 'text-orange-600';
      default:
        return formState.isDirty ? 'text-amber-600' : 'text-muted-foreground';
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className={cn("space-y-6", className)}
      >
        {/* Status Bar */}
        {(showSaveStatus || autoSave?.enabled) && (
          <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              {!isOnline && <WifiOff className="h-4 w-4 text-red-600" />}
              {isOnline && <Wifi className="h-4 w-4 text-green-600" />}
              <span className="text-muted-foreground">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {autoSave?.enabled && (
              <div className={cn("flex items-center gap-1", getSaveStatusColor())}>
                {getSaveStatusIcon()}
                <span className="text-xs">
                  {getSaveStatusText()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
        {children(form)}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2">
            {formState.errors && Object.keys(formState.errors).length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {Object.keys(formState.errors).length} erro(s)
              </Badge>
            )}
            {realTimeValidation && formState.isValid && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Válido
              </Badge>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting || (!isOnline && !autoSave?.enabled)}
            variant={submitButton.variant}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submitButton.loadingText}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {submitButton.text}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Generic type for form field components that accept basic form props
type FormFieldComponent = React.ComponentType<{
  placeholder?: string;
  type?: string;
  className?: string;
  value?: string | number | readonly string[] | undefined;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  name?: string;
  disabled?: boolean;
  id?: string;
}>;

// Enhanced form field components with validation feedback
export function SmartFormField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  type = "text",
  component: Component = Input,
  required = false,
  className
}: {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  description?: string;
  placeholder?: string;
  type?: string;
  component?: FormFieldComponent;
  required?: boolean;
  className?: string;
}) {
  const fieldState = form.getFieldState(name);
  const hasError = !!fieldState.error;
  const hasValue = !!form.watch(name);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="flex items-center gap-2">
            {label}
            {required && <span className="text-red-500">*</span>}
            {hasValue && !hasError && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
          </FormLabel>
          <FormControl>
            <Component
              {...field}
              placeholder={placeholder}
              type={type}
              className={cn(
                hasError && "border-red-500 focus-visible:ring-red-500",
                hasValue && !hasError && "border-green-500 focus-visible:ring-green-500"
              )}
            />
          </FormControl>
          {description && (
            <FormDescription>{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Specialized components for common field types
export function SmartTextarea<T extends FieldValues>(props: Parameters<typeof SmartFormField<T>>[0]) {
  return <SmartFormField {...props} component={Textarea} />;
}

export function SmartInput<T extends FieldValues>(props: Parameters<typeof SmartFormField<T>>[0]) {
  return <SmartFormField {...props} component={Input} />;
}