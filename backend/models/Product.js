import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxLength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    required: [true, 'Product category is required'],
    index: true
  },
  brand: {
    type: String,
    required: [true, 'Product brand is required'],
    index: true
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be a whole number'
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      maxLength: 500
    },
    reviewerName: {
      type: String,
      required: true,
      maxLength: 100
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  features: [{
    type: String,
    maxLength: 200
  }],
  specifications: [{
    key: {
      type: String,
      required: true,
      maxLength: 100
    },
    value: {
      type: String,
      required: true,
      maxLength: 200
    }
  }],
  tags: [{
    type: String,
    maxLength: 50
  }],
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      sparse: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Set timeout for all operations
productSchema.set('maxTimeMS', 5000);

// Ensure indexes
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ 'seo.slug': 1 }, { unique: true, sparse: true });
productSchema.index({ name: 'text', description: 'text' });

// Handle timeouts gracefully
productSchema.pre(['find', 'findOne'], function() {
  this.maxTimeMS(5000);
});

// Handle aggregate timeouts separately
productSchema.pre('aggregate', function() {
  this.options = this.options || {};
  this.options.maxTimeMS = 5000;
});

// Method to update rating based on reviews
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.rating.count = this.reviews.length;
  }
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
