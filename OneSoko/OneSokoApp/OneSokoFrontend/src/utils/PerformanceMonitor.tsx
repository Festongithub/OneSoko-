import React, { useEffect, useState, useRef } from 'react';
import { ChartBarIcon, WifiIcon } from '@heroicons/react/24/outline';

interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  connectionType: string;
  memoryUsage?: {
    used: number;
    total: number;
  };
}

interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    timeToInteractive: 0,
    connectionType: 'unknown',
  };
  private componentMetrics: Map<string, ComponentPerformance> = new Map();
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Web Vitals monitoring
    this.observeWebVitals();
    
    // Network information
    this.getNetworkInfo();
    
    // Memory monitoring
    this.monitorMemoryUsage();
    
    // Resource timing
    this.monitorResourceTiming();
  }

  private observeWebVitals() {
    // First Contentful Paint (FCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
          this.notifyObservers();
        }
      });
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
      this.notifyObservers();
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.metrics.cumulativeLayoutShift = clsValue;
      this.notifyObservers();
    }).observe({ entryTypes: ['layout-shift'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        this.notifyObservers();
      });
    }).observe({ entryTypes: ['first-input'] });
  }

  private getNetworkInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.connectionType = connection.effectiveType || 'unknown';
      
      connection.addEventListener('change', () => {
        this.metrics.connectionType = connection.effectiveType || 'unknown';
        this.notifyObservers();
      });
    }
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
        };
        this.notifyObservers();
      };

      updateMemory();
      setInterval(updateMemory, 5000); // Update every 5 seconds
    }
  }

  private monitorResourceTiming() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          // Log slow resources
          if (entry.duration > 1000) {
            console.warn(`Slow resource detected: ${entry.name} took ${entry.duration}ms`);
          }
        }
      });
    }).observe({ entryTypes: ['resource'] });
  }

  public trackComponentPerformance(componentName: string, renderTime: number, mountTime?: number) {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.renderTime = renderTime;
      existing.updateCount += 1;
      if (mountTime) existing.mountTime = mountTime;
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        mountTime: mountTime || 0,
        updateCount: 1,
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getComponentMetrics(): ComponentPerformance[] {
    return Array.from(this.componentMetrics.values());
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.add(callback);
    return () => {
      this.observers.delete(callback);
    };
  }

  private notifyObservers() {
    this.observers.forEach(callback => callback(this.getMetrics()));
  }

  public exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      webVitals: this.metrics,
      components: this.getComponentMetrics(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// React Hook for performance monitoring
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    const unsubscribe = monitor.subscribe(setMetrics);
    setMetrics(monitor.getMetrics());
    return unsubscribe;
  }, [monitor]);

  return metrics;
};

// HOC for component performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const ComponentWithPerformance: React.FC<P> = (props) => {
    const renderStartTime = useRef<number>(Date.now());
    const mountStartTime = useRef<number>(Date.now());
    const monitor = PerformanceMonitor.getInstance();
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';

    useEffect(() => {
      const mountTime = Date.now() - mountStartTime.current;
      monitor.trackComponentPerformance(name, 0, mountTime);
    }, [monitor, name]);

    useEffect(() => {
      const renderTime = Date.now() - renderStartTime.current;
      monitor.trackComponentPerformance(name, renderTime);
    });

    renderStartTime.current = Date.now();

    return <WrappedComponent {...props} />;
  };

  ComponentWithPerformance.displayName = `withPerformanceTracking(${name})`;
  return ComponentWithPerformance;
}

// Performance Debug Panel Component
interface PerformanceDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceDebugPanel: React.FC<PerformanceDebugPanelProps> = ({ isOpen, onClose }) => {
  const metrics = usePerformanceMetrics();
  const [componentMetrics, setComponentMetrics] = useState<ComponentPerformance[]>([]);
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setComponentMetrics(monitor.getComponentMetrics());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, monitor]);

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getScoreColor = (score: number, thresholds: { good: number; poor: number }) => {
    if (score <= thresholds.good) return 'text-green-600';
    if (score <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportReport = () => {
    const report = monitor.exportReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !metrics) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-neutral-800 rounded-lg max-w-4xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6" />
              Performance Metrics
            </h2>
            <div className="flex gap-2">
              <button
                onClick={exportReport}
                className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600"
              >
                Export Report
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Web Vitals */}
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Web Vitals</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">FCP</span>
                    <span className={`text-sm font-medium ${getScoreColor(metrics.firstContentfulPaint, { good: 1800, poor: 3000 })}`}>
                      {metrics.firstContentfulPaint.toFixed(0)}ms
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">LCP</span>
                    <span className={`text-sm font-medium ${getScoreColor(metrics.largestContentfulPaint, { good: 2500, poor: 4000 })}`}>
                      {metrics.largestContentfulPaint.toFixed(0)}ms
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">CLS</span>
                    <span className={`text-sm font-medium ${getScoreColor(metrics.cumulativeLayoutShift, { good: 0.1, poor: 0.25 })}`}>
                      {metrics.cumulativeLayoutShift.toFixed(3)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">FID</span>
                    <span className={`text-sm font-medium ${getScoreColor(metrics.firstInputDelay, { good: 100, poor: 300 })}`}>
                      {metrics.firstInputDelay.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">System Info</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <WifiIcon className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Connection</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 capitalize">
                    {metrics.connectionType}
                  </span>
                </div>

                {metrics.memoryUsage && (
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Memory Usage</div>
                    <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {formatBytes(metrics.memoryUsage.used)} / {formatBytes(metrics.memoryUsage.total)}
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{
                          width: `${(metrics.memoryUsage.used / metrics.memoryUsage.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Component Performance */}
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Component Performance</h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {componentMetrics.map((component) => (
                  <div key={component.componentName} className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {component.componentName}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      Render: {component.renderTime.toFixed(1)}ms | 
                      Mount: {component.mountTime.toFixed(1)}ms | 
                      Updates: {component.updateCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
