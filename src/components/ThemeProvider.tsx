'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('al-theme') as Theme | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);

    // Apply theme to document
    if (initialTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';

      // Update localStorage
      localStorage.setItem('al-theme', newTheme);

      // Update document class
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }

      return newTheme;
    });
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const SunIcon = () => (
    <svg
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.415 0l1.414 1.414a1 1 0 01-1.415 1.415l-1.414-1.415a1 1 0 010-1.414zm2.828 4.22a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm0 6a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm-2.828 2.828a1 1 0 011.415 0l1.414 1.414a1 1 0 01-1.415 1.415l-1.414-1.415a1 1 0 010-1.414zm-9.172 2.828a1 1 0 011.415 0l1.414 1.414a1 1 0 11-1.415 1.415L3.636 17.05a1 1 0 010-1.414zM3 15a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm1.78-4.22a1 1 0 011.415 0l1.414 1.414a1 1 0 11-1.415 1.415l-1.414-1.415a1 1 0 010-1.414zM3.636 3.636a1 1 0 011.415 0l1.414 1.414a1 1 0 11-1.415 1.415L4.05 5.05a1 1 0 010-1.414zM10 6a4 4 0 100 8 4 4 0 000-8z"
        clipRule="evenodd"
      />
    </svg>
  );

  const MoonIcon = () => (
    <svg
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  );

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 rounded-md border border-white/10 dark:border-white/10 light:border-gray-200 flex items-center justify-center hover:border-white/20 dark:hover:border-white/20 light:hover:border-gray-300 transition-all"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <SunIcon />
      ) : (
        <MoonIcon />
      )}
    </button>
  );
}
