import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { trackPageView, setUserId, trackEvent } from '../../utils/analytics';

const AnalyticsTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  // Set user ID when user logs in
  useEffect(() => {
    if (user) {
      setUserId(user._id);
      trackEvent('user_login', {
        userId: user._id,
        userRole: user.role,
      });
    } else {
      setUserId(null);
    }
  }, [user]);

  // Track route changes
  useEffect(() => {
    const routeData = {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
    };

    trackEvent('route_change', routeData);
  }, [location]);

  return null; // This component doesn't render anything
};

export default AnalyticsTracker;
