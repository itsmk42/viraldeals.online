import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // General Settings
  general: {
    siteName: {
      type: String,
      default: 'ViralDeals'
    },
    siteDescription: {
      type: String,
      default: 'Your trusted e-commerce platform'
    },
    contactEmail: {
      type: String,
      default: 'support@viraldeals.online'
    },
    contactPhone: {
      type: String,
      default: '+91-9876543210'
    },
    address: {
      type: String,
      default: 'Mumbai, Maharashtra, India'
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },

  // Business Settings
  business: {
    gstNumber: {
      type: String,
      default: ''
    },
    panNumber: {
      type: String,
      default: ''
    },
    businessName: {
      type: String,
      default: 'ViralDeals Private Limited'
    },
    businessType: {
      type: String,
      default: 'Private Limited Company',
      enum: [
        'Sole Proprietorship',
        'Partnership',
        'Private Limited Company',
        'Public Limited Company',
        'LLP'
      ]
    },
    registrationNumber: {
      type: String,
      default: ''
    }
  },

  // Shipping Settings
  shipping: {
    freeShippingThreshold: {
      type: Number,
      default: 500
    },
    standardShippingRate: {
      type: Number,
      default: 50
    },
    expressShippingRate: {
      type: Number,
      default: 100
    },
    codCharges: {
      type: Number,
      default: 25
    },
    maxCodAmount: {
      type: Number,
      default: 5000
    },
    processingDays: {
      type: Number,
      default: 2
    }
  },

  // Notification Settings
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    orderUpdates: {
      type: Boolean,
      default: true
    },
    lowStockAlerts: {
      type: Boolean,
      default: true
    },
    newUserRegistrations: {
      type: Boolean,
      default: true
    },
    paymentAlerts: {
      type: Boolean,
      default: true
    }
  },

  // Security Settings
  security: {
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 30 // minutes
    },
    passwordPolicy: {
      type: String,
      default: 'medium',
      enum: ['low', 'medium', 'high']
    },
    loginAttempts: {
      type: Number,
      default: 5
    },
    accountLockDuration: {
      type: Number,
      default: 15 // minutes
    }
  },

  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updateData, userId) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      ...updateData,
      lastUpdatedBy: userId
    });
  } else {
    // Merge the update data with existing settings
    Object.keys(updateData).forEach(section => {
      if (typeof updateData[section] === 'object' && updateData[section] !== null) {
        settings[section] = {
          ...settings[section],
          ...updateData[section]
        };
      } else {
        settings[section] = updateData[section];
      }
    });
    
    settings.lastUpdatedBy = userId;
    settings.version += 1;
    await settings.save();
  }
  return settings;
};

// Index for efficient queries
settingsSchema.index({ version: 1 });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
