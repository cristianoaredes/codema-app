import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'inline' | 'dropdown';
}

export function ThemeToggle({ variant = 'dropdown' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  if (variant === 'inline') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Tema</span>
          <Badge variant="secondary" className="gap-1">
            <CurrentIcon className="h-3 w-3" />
            {currentTheme?.label}
          </Badge>
        </div>
        <div className="flex gap-2">
          {themes.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={theme === value ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setTheme(value)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          Tema: {currentTheme?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {theme === value && (
              <Badge variant="secondary" className="ml-auto">
                Atual
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}