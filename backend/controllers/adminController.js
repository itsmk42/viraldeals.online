import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Get current date ranges
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // User statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const newUsersToday = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfToday }
    });
    const newUsersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfMonth }
    });

    // Product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Revenue statistics
    const revenueToday = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday },
          'payment.status': 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' }
        }
      }
    ]);

    const revenueThisMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          'payment.status': 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' }
        }
      }
    ]);

    const revenueThisYear = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear },
          'payment.status': 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          productName: { $first: '$items.name' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .select('orderNumber status pricing.total createdAt user');

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          newThisMonth: newUsersThisMonth
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts
        },
        orders: {
          total: totalOrders,
          today: ordersToday,
          thisMonth: ordersThisMonth,
          statusBreakdown: orderStatusBreakdown
        },
        revenue: {
          today: revenueToday[0]?.total || 0,
          thisMonth: revenueThisMonth[0]?.total || 0,
          thisYear: revenueThisYear[0]?.total || 0
        },
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.paymentStatus) {
      filter['payment.status'] = req.query.paymentStatus;
    }
    if (req.query.search) {
      filter.orderNumber = { $regex: req.query.search, $options: 'i' };
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, courierName } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    
    if (trackingNumber) {
      order.tracking.trackingNumber = trackingNumber;
    }
    if (courierName) {
      order.tracking.courierName = courierName;
    }

    // Add tracking update
    order.tracking.updates.push({
      status,
      message: `Order ${status.toLowerCase()}`,
      timestamp: new Date()
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get orders in date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: now }
    }).populate('items.product');

    // Calculate metrics
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Sales by category
    const categoryStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product?.category || 'Unknown';
        if (!categoryStats[category]) {
          categoryStats[category] = { amount: 0, count: 0 };
        }
        categoryStats[category].amount += item.price * item.quantity;
        categoryStats[category].count += item.quantity;
      });
    });

    const salesByCategory = Object.entries(categoryStats).map(([name, stats]) => ({
      name,
      amount: stats.amount,
      count: stats.count,
      percentage: totalSales > 0 ? (stats.amount / totalSales) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    // Top products
    const productStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product?._id?.toString();
        if (productId) {
          if (!productStats[productId]) {
            productStats[productId] = {
              _id: productId,
              name: item.product.name,
              category: item.product.category,
              soldCount: 0,
              revenue: 0
            };
          }
          productStats[productId].soldCount += item.quantity;
          productStats[productId].revenue += item.price * item.quantity;
        }
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate growth rates (mock data for now)
    const revenueGrowth = Math.random() * 20 - 10; // -10% to +10%
    const ordersGrowth = Math.random() * 15 - 7.5;
    const customersGrowth = Math.random() * 25 - 12.5;
    const aovGrowth = Math.random() * 10 - 5;

    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        avgOrderValue,
        conversionRate: Math.random() * 5 + 2, // Mock conversion rate
        revenueGrowth,
        ordersGrowth,
        customersGrowth,
        aovGrowth,
        salesByCategory,
        topProducts,
        productPerformance: topProducts.map(product => ({
          ...product,
          views: Math.floor(Math.random() * 1000) + 100,
          orders: product.soldCount
        }))
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};

// @desc    Export analytics data
// @route   GET /api/admin/analytics/export
// @access  Private/Admin
export const exportAnalytics = async (req, res) => {
  try {
    const { type = 'sales', period = '30d' } = req.query;

    // Generate CSV content based on type
    let csvContent = '';
    let filename = `${type}-analytics-${period}.csv`;

    if (type === 'sales') {
      csvContent = 'Date,Revenue,Orders,Average Order Value\n';
      // Add mock daily data
      for (let i = 30; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const revenue = Math.floor(Math.random() * 50000) + 10000;
        const orders = Math.floor(Math.random() * 50) + 10;
        const aov = revenue / orders;

        csvContent += `${date.toISOString().split('T')[0]},${revenue},${orders},${aov.toFixed(2)}\n`;
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data'
    });
  }
};

// @desc    Get application settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: {
        settings: {
          general: settings.general,
          business: settings.business,
          shipping: settings.shipping,
          notifications: settings.notifications,
          security: settings.security
        },
        lastUpdated: settings.updatedAt,
        version: settings.version
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings'
    });
  }
};

// @desc    Update application settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const { general, business, shipping, notifications, security } = req.body;

    // Validate required fields
    if (!general && !business && !shipping && !notifications && !security) {
      return res.status(400).json({
        success: false,
        message: 'At least one settings section must be provided'
      });
    }

    const updateData = {};
    if (general) updateData.general = general;
    if (business) updateData.business = business;
    if (shipping) updateData.shipping = shipping;
    if (notifications) updateData.notifications = notifications;
    if (security) updateData.security = security;

    const settings = await Settings.updateSettings(updateData, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: {
          general: settings.general,
          business: settings.business,
          shipping: settings.shipping,
          notifications: settings.notifications,
          security: settings.security
        },
        lastUpdated: settings.updatedAt,
        version: settings.version
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings'
    });
  }
};
