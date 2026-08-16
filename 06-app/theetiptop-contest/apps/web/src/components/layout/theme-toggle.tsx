'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Le thème est déjà posé sur <html> par le script du layout. On se
    // contente de lire l'état effectif pour afficher la bonne icône.
    const applied = document.documentElement.dataset.theme as Theme | undefined;
    setTheme(
      applied ??
        (window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light')
    );
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('theme', next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-10 place-items-center rounded-full border border-border text-fg-muted hover:bg-muted"
      aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
    >
      {theme === 'dark' ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
