import { connectDB } from './db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

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
