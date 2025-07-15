import { validationResult } from 'express-validator';

// @desc    Track analytics events
// @route   POST /api/analytics/events
// @access  Public
export const trackEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const event = req.body;

    // Here you would typically:
    // 1. Validate the event structure
    // 2. Store it in a database or send to analytics service
    // 3. For now, we'll just log it
    console.log('Analytics Event:', event);

    res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Track analytics event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking event'
    });
  }
}; 