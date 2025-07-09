import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  CpuChipIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    pageLoad: { value: 0, trend: 0 },
    apiResponse: { value: 0, trend: 0 },
    cacheHitRate: { value: 0, trend: 0 },
    errorRate: { value: 0, trend: 0 },
    activeUsers: { value: 0, trend: 0 },
    conversionRate: { value: 0, trend: 0 },
  });

  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your analytics API
      const response = await fetch('/api/admin/performance-metrics');
      const data = await response.json();
      
      setMetrics(data.metrics);
      setRecentEvents(data.recentEvents || []);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      // Mock data for demonstration
      setMetrics({
        pageLoad: { value: 1.2, trend: -5.2 },
        apiResponse: { value: 245, trend: 12.3 },
        cacheHitRate: { value: 87.5, trend: 3.1 },
        errorRate: { value: 0.8, trend: -15.6 },
        activeUsers: { value: 1247, trend: 8.9 },
        conversionRate: { value: 3.4, trend: 2.1 },
      });
      
      setRecentEvents([
        { id: 1, type: 'error', message: 'API timeout on /products endpoint', timestamp: Date.now() - 300000 },
        { id: 2, type: 'performance', message: 'Page load time increased by 15%', timestamp: Date.now() - 600000 },
        { id: 3, type: 'cache', message: 'Cache hit rate improved to 87%', timestamp: Date.now() - 900000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, unit, trend, icon: Icon, color = 'blue' }) => {
    const isPositive = trend > 0;
    const trendColor = title === 'Error Rate' ? (isPositive ? 'text-red-600' : 'text-green-600') : (isPositive ? 'text-green-600' : 'text-red-600');
    const TrendIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
              <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
            </p>
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
        
        <div className="mt-4 flex items-center">
          <TrendIcon className={`h-4 w-4 ${trendColor} mr-1`} />
          <span className={`text-sm font-medium ${trendColor}`}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      </div>
    );
  };

  const EventItem = ({ event }) => {
    const getEventColor = (type) => {
      switch (type) {
        case 'error': return 'text-red-600 bg-red-100';
        case 'warning': return 'text-yellow-600 bg-yellow-100';
        case 'performance': return 'text-blue-600 bg-blue-100';
        case 'cache': return 'text-green-600 bg-green-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const formatTime = (timestamp) => {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'Just now';
    };

    return (
      <div className="flex items-start space-x-3 py-3">
        <div className={`w-2 h-2 rounded-full mt-2 ${getEventColor(event.type).split(' ')[1]}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">{event.message}</p>
          <p className="text-xs text-gray-500">{formatTime(event.timestamp)}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
          {event.type}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
        <button
          onClick={fetchPerformanceData}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Avg Page Load Time"
          value={metrics.pageLoad.value}
          unit="s"
          trend={metrics.pageLoad.trend}
          icon={ClockIcon}
          color="blue"
        />
        
        <MetricCard
          title="API Response Time"
          value={metrics.apiResponse.value}
          unit="ms"
          trend={metrics.apiResponse.trend}
          icon={SignalIcon}
          color="green"
        />
        
        <MetricCard
          title="Cache Hit Rate"
          value={metrics.cacheHitRate.value}
          unit="%"
          trend={metrics.cacheHitRate.trend}
          icon={CpuChipIcon}
          color="purple"
        />
        
        <MetricCard
          title="Error Rate"
          value={metrics.errorRate.value}
          unit="%"
          trend={metrics.errorRate.trend}
          icon={ExclamationTriangleIcon}
          color="red"
        />
        
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers.value}
          unit=""
          trend={metrics.activeUsers.trend}
          icon={ChartBarIcon}
          color="indigo"
        />
        
        <MetricCard
          title="Conversion Rate"
          value={metrics.conversionRate.value}
          unit="%"
          trend={metrics.conversionRate.trend}
          icon={ArrowTrendingUpIcon}
          color="emerald"
        />
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
        </div>
        
        <div className="px-6 py-4">
          {recentEvents.length > 0 ? (
            <div className="space-y-1">
              {recentEvents.map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent events</p>
          )}
        </div>
      </div>

      {/* Performance Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Performance Recommendations</h2>
        </div>
        
        <div className="px-6 py-4">
          <div className="space-y-4">
            {metrics.pageLoad.value > 2 && (
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Slow Page Load Time</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Consider optimizing images, enabling compression, and implementing lazy loading.
                  </p>
                </div>
              </div>
            )}
            
            {metrics.cacheHitRate.value < 80 && (
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <CpuChipIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Low Cache Hit Rate</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Review caching strategies and consider increasing cache TTL for static content.
                  </p>
                </div>
              </div>
            )}
            
            {metrics.errorRate.value > 1 && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">High Error Rate</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Investigate recent errors and implement better error handling and monitoring.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
