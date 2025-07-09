import React, { useState, useEffect } from 'react';
import { performanceMonitor, cacheManager, networkStatus } from '../../utils/serviceWorker';

const PerformanceMonitor = ({ showDetails = false }) => {
  const [metrics, setMetrics] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [isOnline, setIsOnline] = useState(networkStatus.isOnline());
  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setShowMonitor(true);
    }

    // Monitor network status
    const cleanup = networkStatus.monitor(
      () => setIsOnline(true),
      () => setIsOnline(false)
    );

    // Get initial metrics
    updateMetrics();

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  const updateMetrics = async () => {
    const loadingMetrics = performanceMonitor.getLoadingMetrics();
    const cacheHitRate = performanceMonitor.measureCacheHitRate();
    const cacheSize = await cacheManager.getCacheSize();

    setMetrics({
      loading: loadingMetrics,
      cache: cacheHitRate,
    });

    setCacheStats({
      size: formatBytes(cacheSize),
      hitRate: cacheHitRate?.hitRate || 0,
    });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearCache = async () => {
    await cacheManager.clearAll();
    updateMetrics();
  };

  if (!showMonitor || !showDetails) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {/* Network status indicator */}
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} 
             title={isOnline ? 'Online' : 'Offline'} />
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 max-w-sm border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Performance Monitor</h3>
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} 
             title={isOnline ? 'Online' : 'Offline'} />
      </div>

      {metrics && (
        <div className="space-y-3 text-xs">
          {/* Loading Metrics */}
          {metrics.loading && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Loading Performance</h4>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>DOM Ready:</span>
                  <span>{metrics.loading.domContentLoaded}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Load Complete:</span>
                  <span>{metrics.loading.loadComplete}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>First Paint:</span>
                  <span>{metrics.loading.firstPaint}ms</span>
                </div>
              </div>
            </div>
          )}

          {/* Cache Metrics */}
          {cacheStats && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Cache Performance</h4>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Hit Rate:</span>
                  <span>{cacheStats.hitRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Size:</span>
                  <span>{cacheStats.size}</span>
                </div>
                {metrics.cache && (
                  <div className="flex justify-between">
                    <span>Cache Hits:</span>
                    <span>{metrics.cache.cacheHits}/{metrics.cache.totalRequests}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={clearCache}
              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    componentMounts: 0,
    rerenders: 0,
  });

  const startRender = () => {
    return performance.now();
  };

  const endRender = (startTime) => {
    const renderTime = performance.now() - startTime;
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.round(renderTime * 100) / 100,
      rerenders: prev.rerenders + 1,
    }));
  };

  const trackMount = () => {
    setMetrics(prev => ({
      ...prev,
      componentMounts: prev.componentMounts + 1,
    }));
  };

  return {
    metrics,
    startRender,
    endRender,
    trackMount,
  };
};

// HOC for performance monitoring
export const withPerformanceMonitor = (WrappedComponent, componentName = 'Component') => {
  return React.memo((props) => {
    const { startRender, endRender, trackMount } = usePerformanceMonitor();

    useEffect(() => {
      trackMount();
    }, []);

    useEffect(() => {
      const startTime = startRender();
      return () => {
        endRender(startTime);
      };
    });

    return <WrappedComponent {...props} />;
  });
};

// Performance metrics context
const PerformanceContext = React.createContext();

export const PerformanceProvider = ({ children }) => {
  const [globalMetrics, setGlobalMetrics] = useState({
    pageLoads: 0,
    apiCalls: 0,
    cacheHits: 0,
    errors: 0,
  });

  const trackPageLoad = () => {
    setGlobalMetrics(prev => ({
      ...prev,
      pageLoads: prev.pageLoads + 1,
    }));
  };

  const trackApiCall = () => {
    setGlobalMetrics(prev => ({
      ...prev,
      apiCalls: prev.apiCalls + 1,
    }));
  };

  const trackCacheHit = () => {
    setGlobalMetrics(prev => ({
      ...prev,
      cacheHits: prev.cacheHits + 1,
    }));
  };

  const trackError = () => {
    setGlobalMetrics(prev => ({
      ...prev,
      errors: prev.errors + 1,
    }));
  };

  const value = {
    metrics: globalMetrics,
    trackPageLoad,
    trackApiCall,
    trackCacheHit,
    trackError,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
};

export default PerformanceMonitor;
