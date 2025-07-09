// Analytics and tracking utilities for ViralDeals.online

class Analytics {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.events = [];
    this.pageViews = [];
    this.performanceMetrics = [];
    
    // Initialize analytics
    this.init();
  }

  init() {
    // Track page load performance
    this.trackPageLoadPerformance();
    
    // Track user interactions
    this.setupEventListeners();
    
    // Send analytics data periodically
    this.startPeriodicSync();
    
    // Track page visibility changes
    this.trackVisibilityChanges();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setUserId(userId) {
    this.userId = userId;
  }

  // Track page views
  trackPageView(path, title = document.title) {
    const pageView = {
      id: this.generateEventId(),
      type: 'page_view',
      path,
      title,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    this.pageViews.push(pageView);
    this.sendEvent(pageView);
  }

  // Track custom events
  trackEvent(eventName, properties = {}) {
    const event = {
      id: this.generateEventId(),
      type: 'custom_event',
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      path: window.location.pathname,
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track e-commerce events
  trackEcommerce(action, data) {
    const ecommerceEvent = {
      id: this.generateEventId(),
      type: 'ecommerce',
      action, // 'view_product', 'add_to_cart', 'purchase', etc.
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      path: window.location.pathname,
    };

    this.events.push(ecommerceEvent);
    this.sendEvent(ecommerceEvent);
  }

  // Track performance metrics
  trackPerformance(metric, value, context = {}) {
    const performanceEvent = {
      id: this.generateEventId(),
      type: 'performance',
      metric,
      value,
      context,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      path: window.location.pathname,
    };

    this.performanceMetrics.push(performanceEvent);
    this.sendEvent(performanceEvent);
  }

  // Track errors
  trackError(error, context = {}) {
    const errorEvent = {
      id: this.generateEventId(),
      type: 'error',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      path: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    this.events.push(errorEvent);
    this.sendEvent(errorEvent);
  }

  // Track page load performance
  trackPageLoadPerformance() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          
          if (navigation) {
            this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.navigationStart);
            this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.navigationStart);
            this.trackPerformance('first_paint', navigation.responseEnd - navigation.requestStart);
            this.trackPerformance('dns_lookup', navigation.domainLookupEnd - navigation.domainLookupStart);
            this.trackPerformance('tcp_connection', navigation.connectEnd - navigation.connectStart);
          }

          // Track Core Web Vitals
          this.trackCoreWebVitals();
        }, 0);
      });
    }
  }

  // Track Core Web Vitals
  trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackPerformance('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.trackPerformance('fid', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.trackPerformance('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  // Setup event listeners for user interactions
  setupEventListeners() {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target;
      const tagName = target.tagName.toLowerCase();
      
      if (tagName === 'button' || tagName === 'a' || target.role === 'button') {
        this.trackEvent('click', {
          element: tagName,
          text: target.textContent?.trim().substring(0, 100),
          className: target.className,
          id: target.id,
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      this.trackEvent('form_submit', {
        formId: form.id,
        formClass: form.className,
        action: form.action,
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 100].includes(scrollDepth)) {
          this.trackEvent('scroll_depth', { depth: scrollDepth });
        }
      }
    });
  }

  // Track page visibility changes
  trackVisibilityChanges() {
    let startTime = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const timeSpent = Date.now() - startTime;
        this.trackEvent('page_exit', { timeSpent });
      } else {
        startTime = Date.now();
        this.trackEvent('page_enter');
      }
    });

    // Track when user leaves the page
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - startTime;
      this.trackEvent('page_unload', { timeSpent });
      this.flush(); // Send any remaining events
    });
  }

  // Start periodic sync of analytics data
  startPeriodicSync() {
    setInterval(() => {
      this.flush();
    }, 30000); // Send data every 30 seconds
  }

  // Send event to analytics endpoint
  async sendEvent(event) {
    if (!this.isEnabled) {
      console.log('Analytics Event:', event);
      return;
    }

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
      // Store in localStorage for retry
      this.storeEventForRetry(event);
    }
  }

  // Store events for retry when network is available
  storeEventForRetry(event) {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('analytics_retry') || '[]');
      storedEvents.push(event);
      localStorage.setItem('analytics_retry', JSON.stringify(storedEvents));
    } catch (error) {
      console.error('Failed to store event for retry:', error);
    }
  }

  // Retry failed events
  async retryFailedEvents() {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('analytics_retry') || '[]');
      
      for (const event of storedEvents) {
        await this.sendEvent(event);
      }
      
      localStorage.removeItem('analytics_retry');
    } catch (error) {
      console.error('Failed to retry events:', error);
    }
  }

  // Flush all pending events
  flush() {
    // Send any stored events for retry
    this.retryFailedEvents();
  }

  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get analytics summary
  getSummary() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      totalEvents: this.events.length,
      totalPageViews: this.pageViews.length,
      totalPerformanceMetrics: this.performanceMetrics.length,
    };
  }
}

// Create singleton instance
const analytics = new Analytics();

// Export convenience methods
export const trackPageView = (path, title) => analytics.trackPageView(path, title);
export const trackEvent = (eventName, properties) => analytics.trackEvent(eventName, properties);
export const trackEcommerce = (action, data) => analytics.trackEcommerce(action, data);
export const trackPerformance = (metric, value, context) => analytics.trackPerformance(metric, value, context);
export const trackError = (error, context) => analytics.trackError(error, context);
export const setUserId = (userId) => analytics.setUserId(userId);
export const getAnalyticsSummary = () => analytics.getSummary();

export default analytics;
