import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentMountTime: number;
  reRenderCount: number;
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  logToConsole?: boolean;
  threshold?: number; // Threshold in ms for warning
}

export const usePerformanceMonitor = (
  componentName: string,
  options: UsePerformanceMonitorOptions = {}
) => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    logToConsole = true,
    threshold = 100 // Warn if render takes longer than 100ms
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMountTime: 0,
    reRenderCount: 0,
  });

  const renderStartTime = useRef<number>(0);
  const mountStartTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  // Track render performance
  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime.current;

      setMetrics(prev => ({
        ...prev,
        renderTime,
        reRenderCount: renderCount.current,
      }));

      if (logToConsole && renderTime > threshold) {
        console.warn(
          `🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (Render #${renderCount.current})`
        );
      }
    };
  });

  // Track mount time
  useEffect(() => {
    if (!enabled) return;

    const mountEndTime = Date.now();
    const mountTime = mountEndTime - mountStartTime.current;

    setMetrics(prev => ({
      ...prev,
      componentMountTime: mountTime,
    }));

    if (logToConsole) {
      console.log(`⚡ ${componentName} mounted in ${mountTime}ms`);
    }
  }, []);

  // Log performance summary on unmount
  useEffect(() => {
    return () => {
      if (!enabled || !logToConsole) return;

      console.log(`📊 Performance Summary for ${componentName}:`, {
        ...metrics,
        reRenderCount: renderCount.current,
      });
    };
  }, []);

  return metrics;
};

// Hook for monitoring async operations
export const useAsyncPerformance = () => {
  const [operations, setOperations] = useState<Array<{
    name: string;
    duration: number;
    timestamp: number;
  }>>([]);

  const trackAsync = async <T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;

      setOperations(prev => [
        ...prev,
        {
          name,
          duration,
          timestamp: Date.now(),
        },
      ]);

      if (duration > 1000) {
        console.warn(`🐌 Slow async operation: ${name} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`❌ Failed async operation: ${name} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  };

  return { trackAsync, operations };
};

// Utility for debouncing expensive operations
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T;
};
