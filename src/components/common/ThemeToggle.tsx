import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  className?: string;
}

export const ThemeToggle = ({ theme, onThemeChange, className = '' }: ThemeToggleProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[1];
  const Icon = currentTheme.icon;

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
        title={`Theme: ${currentTheme.label}`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="w-5 h-5 text-gray-300" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-40 bg-black/95 backdrop-blur-xl border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {themes.map((themeOption) => {
                const ThemeIcon = themeOption.icon;
                const isSelected = theme === themeOption.value;

                return (
                  <motion.button
                    key={themeOption.value}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    onClick={() => {
                      onThemeChange(themeOption.value);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <ThemeIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{themeOption.label}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-2 h-2 bg-emerald-400 rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple toggle button (for navbar)
export const SimpleThemeToggle = ({
  isDark,
  onToggle,
  className = '',
}: {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 ${className}`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Moon className="w-5 h-5 text-gray-300" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Sun className="w-5 h-5 text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
