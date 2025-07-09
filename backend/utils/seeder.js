import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Load environment variables
dotenv.config();

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@viraldeals.online',
    password: 'Admin123!',
    phone: '9876543210',
    role: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'User123!',
    phone: '9876543211',
    role: 'user',
    isEmailVerified: true,
    addresses: [{
      type: 'home',
      name: 'John Doe',
      phone: '9876543211',
      addressLine1: '123 MG Road',
      addressLine2: 'Near Metro Station',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      isDefault: true
    }]
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'User123!',
    phone: '9876543212',
    role: 'user',
    isEmailVerified: true
  }
];

const products = [
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Latest flagship smartphone with advanced AI features, 200MP camera, and S Pen support. Perfect for photography enthusiasts and professionals.',
    shortDescription: 'Flagship smartphone with 200MP camera and S Pen',
    price: 124999,
    originalPrice: 134999,
    category: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'Samsung',
    sku: 'SAM-S24U-256',
    images: [
      {
        url: '/images/samsung-s24-ultra-1.jpg',
        alt: 'Samsung Galaxy S24 Ultra Front View',
        isPrimary: true
      },
      {
        url: '/images/samsung-s24-ultra-2.jpg',
        alt: 'Samsung Galaxy S24 Ultra Back View'
      }
    ],
    stock: 50,
    specifications: [
      { name: 'Display', value: '6.8" Dynamic AMOLED 2X' },
      { name: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { name: 'RAM', value: '12GB' },
      { name: 'Storage', value: '256GB' },
      { name: 'Camera', value: '200MP + 50MP + 12MP + 10MP' },
      { name: 'Battery', value: '5000mAh' }
    ],
    features: ['S Pen Support', 'IP68 Water Resistant', '45W Fast Charging', 'Wireless Charging'],
    tags: ['smartphone', 'android', 'flagship', 'camera'],
    isFeatured: true,
    gst: { rate: 18, hsn: '85171200' }
  },
  {
    name: 'Apple iPhone 15 Pro',
    description: 'Revolutionary iPhone with titanium design, A17 Pro chip, and pro camera system. Experience the future of mobile technology.',
    shortDescription: 'Premium iPhone with titanium design and A17 Pro chip',
    price: 134900,
    originalPrice: 139900,
    category: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'Apple',
    sku: 'APL-IP15P-128',
    images: [
      {
        url: '/images/iphone-15-pro-1.jpg',
        alt: 'iPhone 15 Pro Front View',
        isPrimary: true
      }
    ],
    stock: 30,
    specifications: [
      { name: 'Display', value: '6.1" Super Retina XDR' },
      { name: 'Processor', value: 'A17 Pro' },
      { name: 'Storage', value: '128GB' },
      { name: 'Camera', value: '48MP + 12MP + 12MP' },
      { name: 'Battery', value: 'Up to 23 hours video playback' }
    ],
    features: ['Titanium Design', 'Action Button', 'USB-C', 'Face ID'],
    tags: ['iphone', 'ios', 'premium', 'titanium'],
    isFeatured: true,
    gst: { rate: 18, hsn: '85171200' }
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling wireless headphones with exceptional sound quality and 30-hour battery life.',
    shortDescription: 'Premium noise-canceling wireless headphones',
    price: 29990,
    originalPrice: 34990,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'Sony',
    sku: 'SNY-WH1000XM5',
    images: [
      {
        url: '/images/sony-wh1000xm5-1.jpg',
        alt: 'Sony WH-1000XM5 Headphones',
        isPrimary: true
      }
    ],
    stock: 75,
    specifications: [
      { name: 'Driver', value: '30mm' },
      { name: 'Battery Life', value: '30 hours' },
      { name: 'Charging', value: 'USB-C Quick Charge' },
      { name: 'Weight', value: '250g' }
    ],
    features: ['Active Noise Canceling', 'Touch Controls', 'Voice Assistant', 'Multipoint Connection'],
    tags: ['headphones', 'wireless', 'noise-canceling', 'premium'],
    isFeatured: true,
    gst: { rate: 18, hsn: '85183000' }
  },
  {
    name: 'Levi\'s 511 Slim Jeans',
    description: 'Classic slim-fit jeans made from premium denim. Perfect for everyday wear with a modern, streamlined look.',
    shortDescription: 'Classic slim-fit denim jeans',
    price: 3999,
    originalPrice: 4999,
    category: 'Fashion',
    subcategory: 'Jeans',
    brand: 'Levi\'s',
    sku: 'LEV-511-32-34',
    images: [
      {
        url: '/images/levis-511-1.jpg',
        alt: 'Levi\'s 511 Slim Jeans',
        isPrimary: true
      }
    ],
    stock: 100,
    specifications: [
      { name: 'Fit', value: 'Slim' },
      { name: 'Material', value: '99% Cotton, 1% Elastane' },
      { name: 'Waist', value: '32 inches' },
      { name: 'Length', value: '34 inches' }
    ],
    features: ['Slim Fit', 'Premium Denim', 'Classic 5-Pocket Design'],
    tags: ['jeans', 'denim', 'casual', 'slim-fit'],
    gst: { rate: 12, hsn: '62034200' }
  },
  {
    name: 'Nike Air Max 270',
    description: 'Lifestyle sneakers with the largest Max Air unit yet, delivering exceptional comfort and style for everyday wear.',
    shortDescription: 'Comfortable lifestyle sneakers with Max Air technology',
    price: 12995,
    originalPrice: 14995,
    category: 'Fashion',
    subcategory: 'Shoes',
    brand: 'Nike',
    sku: 'NIK-AM270-9',
    images: [
      {
        url: '/images/nike-air-max-270-1.jpg',
        alt: 'Nike Air Max 270 Sneakers',
        isPrimary: true
      }
    ],
    stock: 60,
    specifications: [
      { name: 'Size', value: '9 UK' },
      { name: 'Material', value: 'Mesh and Synthetic' },
      { name: 'Sole', value: 'Rubber with Max Air' },
      { name: 'Closure', value: 'Lace-up' }
    ],
    features: ['Max Air Technology', 'Breathable Mesh', 'Durable Rubber Sole'],
    tags: ['sneakers', 'sports', 'casual', 'air-max'],
    gst: { rate: 18, hsn: '64039900' }
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Multi-functional electric pressure cooker that replaces 7 kitchen appliances. Perfect for Indian cooking with preset programs.',
    shortDescription: '7-in-1 electric pressure cooker for versatile cooking',
    price: 8999,
    originalPrice: 12999,
    category: 'Home & Kitchen',
    subcategory: 'Appliances',
    brand: 'Instant Pot',
    sku: 'IP-DUO-6QT',
    images: [
      {
        url: '/images/instant-pot-duo-1.jpg',
        alt: 'Instant Pot Duo 7-in-1',
        isPrimary: true
      }
    ],
    stock: 40,
    specifications: [
      { name: 'Capacity', value: '6 Quart (5.7L)' },
      { name: 'Functions', value: '7-in-1' },
      { name: 'Material', value: 'Stainless Steel' },
      { name: 'Power', value: '1000W' }
    ],
    features: ['Pressure Cook', 'Slow Cook', 'Rice Cooker', 'Steamer', 'Sauté', 'Yogurt Maker', 'Warmer'],
    tags: ['kitchen', 'pressure-cooker', 'appliance', 'cooking'],
    isFeatured: true,
    gst: { rate: 18, hsn: '84198100' }
  }
];

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viraldeals');
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Import data
const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    console.log('Existing data cleared');

    // Create admin user first
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);

    // Add createdBy field to products
    const adminUser = createdUsers.find(user => user.role === 'admin');
    const productsWithCreator = products.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));

    // Create products
    const createdProducts = await Product.create(productsWithCreator);
    console.log(`${createdProducts.length} products created`);

    console.log('Data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    console.log('Data deleted successfully');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}
