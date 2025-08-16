import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Store
import { useAuthStore } from './stores/authStore';

// Context
import { ThemeProvider } from './contexts/ThemeContext';

// Test Component
import TestComponent from './components/TestComponent';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check authentication status on app startup
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth check failed:', error);
        // Continue rendering the app even if auth check fails
      } finally {
        setIsInitialized(true);
      }
    };
    
    initAuth();
  }, [checkAuth]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading OneSoko...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex flex-col transition-colors duration-200">
          <Routes>
            <Route path="/" element={<TestComponent />} />
            <Route path="*" element={<TestComponent />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
