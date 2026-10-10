import * as React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore } from '@/stores/theme.store';
import { Dropdown } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useThemeStore();

  const items = [
    {
      id: 'light',
      label: 'Light Mode',
      icon: <Sun className="h-4 w-4" />,
      onClick: () => setTheme('light'),
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      icon: <Moon className="h-4 w-4" />,
      onClick: () => setTheme('dark'),
    },
    {
      id: 'system',
      label: 'System Preference',
      icon: <Laptop className="h-4 w-4" />,
      onClick: () => setTheme('system'),
    },
  ];

  return (
    <Dropdown
      trigger={
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {resolvedTheme === 'dark' ? (
            <Moon className="h-5 w-5 text-indigo-400" />
          ) : (
            <Sun className="h-5 w-5 text-amber-500" />
          )}
        </Button>
      }
      items={items}
      align="right"
    />
  );
}
