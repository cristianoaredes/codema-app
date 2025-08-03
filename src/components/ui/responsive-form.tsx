import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

interface ResponsiveFormProps {
  title?: string;
  description?: string;
  onBack?: () => void;
  onSave?: () => void;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  saveLabel?: string;
  showBackButton?: boolean;
  sections?: Array<{
    title: string;
    description?: string;
    children: React.ReactNode;
    collapsible?: boolean;
  }>;
}

export function ResponsiveForm({
  title,
  description,
  onBack,
  onSave,
  children,
  className,
  loading = false,
  saveLabel = "Salvar",
  showBackButton = true,
  sections
}: ResponsiveFormProps) {
  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* Mobile-optimized header */}
      {(title || showBackButton) && (
        <div className="flex items-center gap-3 sm:gap-4">
          {showBackButton && onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="h-9 w-9 sm:h-10 sm:w-auto sm:px-3 p-0 sm:p-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Voltar</span>
            </Button>
          )}
          {title && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold truncate">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form content */}
      <div className="space-y-4 sm:space-y-6">
        {sections ? (
          // Section-based layout
          sections.map((section, index) => (
            <Card key={index}>
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">
                  {section.title}
                </CardTitle>
                {section.description && (
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {section.children}
              </CardContent>
            </Card>
          ))
        ) : (
          // Single card layout
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {children}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky bottom actions for mobile */}
      {onSave && (
        <>
          {/* Mobile sticky footer */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10">
            <Button 
              onClick={onSave} 
              disabled={loading}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvando..." : saveLabel}
            </Button>
          </div>
          
          {/* Desktop actions */}
          <div className="hidden sm:flex justify-end gap-4 pt-4">
            {onBack && (
              <Button variant="outline" onClick={onBack} disabled={loading}>
                Cancelar
              </Button>
            )}
            <Button onClick={onSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvando..." : saveLabel}
            </Button>
          </div>
          
          {/* Spacer for mobile sticky footer */}
          <div className="sm:hidden h-20" />
        </>
      )}
    </div>
  );
}

// Responsive form field wrapper
interface ResponsiveFormFieldProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function ResponsiveFormFields({ 
  children, 
  className,
  columns = 1 
}: ResponsiveFormFieldProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized input with better touch targets
interface ResponsiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

export function ResponsiveInput({
  label,
  error,
  helper,
  required,
  className,
  ...props
}: ResponsiveInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        className={cn(
          "flex h-11 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {helper && !error && (
        <p className="text-sm text-muted-foreground">{helper}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

// Mobile-optimized textarea
interface ResponsiveTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

export function ResponsiveTextarea({
  label,
  error,
  helper,
  required,
  className,
  ...props
}: ResponsiveTextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          "flex min-h-[100px] sm:min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2",
          "text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {helper && !error && (
        <p className="text-sm text-muted-foreground">{helper}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}