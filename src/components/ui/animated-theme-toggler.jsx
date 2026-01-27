import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function AnimatedThemeToggler() {
  const [isDark, setIsDark] = useState(false);

  // Sync state with current DOM state on mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const handleToggle = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    
    if (isCurrentlyDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2.5 rounded-lg transition bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={18} className="transition-transform duration-300" />
      ) : (
        <Moon size={18} className="transition-transform duration-300" />
      )}
    </button>
  );
}

export default AnimatedThemeToggler;
