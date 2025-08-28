import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  colorBlindFriendly: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  colorBlindFriendly: false,
  keyboardNavigation: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
    
    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    return {
      ...defaultSettings,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
    };
  });

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
  };

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--accessibility-font-scale', 
      settings.fontSize === 'small' ? '0.875' :
      settings.fontSize === 'large' ? '1.125' :
      settings.fontSize === 'extra-large' ? '1.25' : '1'
    );
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Color blind friendly
    if (settings.colorBlindFriendly) {
      root.classList.add('color-blind-friendly');
    } else {
      root.classList.remove('color-blind-friendly');
    }
    
    // Screen reader optimizations
    if (settings.screenReader) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }
    
  }, [settings]);

  // Listen for system preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('accessibility-settings')) {
        updateSetting('reducedMotion', e.matches);
      }
    };
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('accessibility-settings')) {
        updateSetting('highContrast', e.matches);
      }
    };
    
    motionQuery.addListener(handleMotionChange);
    contrastQuery.addListener(handleContrastChange);
    
    return () => {
      motionQuery.removeListener(handleMotionChange);
      contrastQuery.removeListener(handleContrastChange);
    };
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Accessibility Panel Component
interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSetting, resetSettings } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-neutral-800 rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Accessibility Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
              aria-label="Close accessibility panel"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Font Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting('fontSize', size)}
                    className={`p-2 text-sm rounded-lg border ${
                      settings.fontSize === size
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {size.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Settings */}
            {[
              { key: 'highContrast', label: 'High Contrast Mode', description: 'Increases contrast for better visibility' },
              { key: 'reducedMotion', label: 'Reduce Motion', description: 'Minimizes animations and transitions' },
              { key: 'colorBlindFriendly', label: 'Color Blind Friendly', description: 'Uses patterns and shapes alongside colors' },
              { key: 'screenReader', label: 'Screen Reader Mode', description: 'Optimizes for screen reader navigation' },
              { key: 'keyboardNavigation', label: 'Enhanced Keyboard Navigation', description: 'Shows focus indicators and supports keyboard shortcuts' },
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={key}
                  checked={settings[key as keyof AccessibilitySettings] as boolean}
                  onChange={(e) => updateSetting(key as keyof AccessibilitySettings, e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <label htmlFor={key} className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    {label}
                  </label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {description}
                  </p>
                </div>
              </div>
            ))}

            {/* Reset Button */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={resetSettings}
                className="w-full p-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skip to content link
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50 focus:z-50"
    >
      Skip to main content
    </a>
  );
};

// Focus trap hook
export const useFocusTrap = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);
};

// Announce to screen readers
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  document.body.appendChild(announcer);
  
  announcer.textContent = message;
  
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};
