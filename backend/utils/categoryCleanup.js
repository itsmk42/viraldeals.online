import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// New categories to replace existing ones
const newCategories = [
  'Smart Home Gadgets',
  'Tech Accessories',
  'Wearable Tech',
  'Portable Electronics',
  'Kitchen Innovations',
  'Health & Wellness Devices',
  'Outdoor & Travel Gear',
  'Gaming & Entertainment',
  'Productivity & Office Gadgets',
  'Novelty & Fun Gadgets',
  'Eco-Friendly Tech',
  'Pet Tech',
  'Viral Picks',
  'Seasonal Collections'
];

// Category mapping from old to new categories
const categoryMapping = {
  'Electronics': 'Tech Accessories',
  'Fashion': 'Novelty & Fun Gadgets',
  'Home & Kitchen': 'Kitchen Innovations',
  'Beauty & Personal Care': 'Health & Wellness Devices',
  'Sports & Fitness': 'Outdoor & Travel Gear',
  'Books': 'Productivity & Office Gadgets',
  'Toys & Games': 'Gaming & Entertainment',
  'Health & Wellness': 'Health & Wellness Devices',
  'Automotive': 'Tech Accessories',
  'Grocery': 'Kitchen Innovations',
  'Other': 'Novelty & Fun Gadgets'
};

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viraldeals');
    console.log('MongoDB Connected for category cleanup');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Get products created through admin interface (likely the most recent ones)
const getAdminCreatedProducts = async () => {
  try {
    // Get all products sorted by creation date (newest first)
    const allProducts = await Product.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name email');
    
    console.log('\n=== ALL PRODUCTS IN DATABASE ===');
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Created: ${product.createdAt.toLocaleDateString()}`);
      console.log(`   Created by: ${product.createdBy?.name || 'Unknown'} (${product.createdBy?.email || 'Unknown'})`);
      console.log(`   Price: ₹${product.price}`);
      console.log('   ---');
    });

    // Identify products that are likely manually added (not from seeder)
    // These would typically be the ones created after the initial seed data
    const seedProductSKUs = ['SAM-S24U-256', 'APL-IP15P-128', 'SNY-WH1000XM5', 'LV-JEANS-32', 'NIK-AM270-9', 'IP-DUO-6QT'];
    
    const manualProducts = allProducts.filter(product => 
      !seedProductSKUs.includes(product.sku) && 
      !product.sku.startsWith('TEST') // Exclude test products
    );

    console.log('\n=== MANUALLY ADDED PRODUCTS (TO KEEP) ===');
    if (manualProducts.length === 0) {
      console.log('No manually added products found.');
    } else {
      manualProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (SKU: ${product.sku})`);
      });
    }

    return { allProducts, manualProducts, seedProductSKUs };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Clean up products - remove seed/dummy data, keep manually added ones
const cleanupProducts = async (manualProducts, seedProductSKUs) => {
  try {
    console.log('\n=== CLEANING UP PRODUCTS ===');
    
    // Delete seed products and test products
    const deleteResult = await Product.deleteMany({
      $or: [
        { sku: { $in: seedProductSKUs } },
        { sku: { $regex: '^TEST' } }
      ]
    });

    console.log(`Deleted ${deleteResult.deletedCount} seed/test products`);
    console.log(`Kept ${manualProducts.length} manually added products`);

    return manualProducts;
  } catch (error) {
    console.error('Error cleaning up products:', error);
    throw error;
  }
};

// Update remaining products with new categories
const updateProductCategories = async (products) => {
  try {
    console.log('\n=== UPDATING PRODUCT CATEGORIES ===');
    
    for (const product of products) {
      const oldCategory = product.category;
      const newCategory = categoryMapping[oldCategory] || 'Novelty & Fun Gadgets';
      
      if (oldCategory !== newCategory) {
        await Product.findByIdAndUpdate(product._id, { category: newCategory });
        console.log(`Updated "${product.name}": ${oldCategory} → ${newCategory}`);
      } else {
        console.log(`"${product.name}": Category unchanged (${oldCategory})`);
      }
    }
  } catch (error) {
    console.error('Error updating product categories:', error);
    throw error;
  }
};

// Main cleanup function
const performCleanup = async () => {
  try {
    await connectDB();
    
    console.log('Starting product catalog cleanup...');
    
    // Step 1: Analyze current products
    const { allProducts, manualProducts, seedProductSKUs } = await getAdminCreatedProducts();
    
    // Step 2: Ask for confirmation before proceeding
    console.log('\n=== CLEANUP PLAN ===');
    console.log(`Total products in database: ${allProducts.length}`);
    console.log(`Products to DELETE (seed/test data): ${allProducts.length - manualProducts.length}`);
    console.log(`Products to KEEP (manually added): ${manualProducts.length}`);
    console.log('\nNew categories will be:');
    newCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat}`);
    });
    
    // For safety, let's proceed with the cleanup
    console.log('\nProceeding with cleanup...');
    
    // Step 3: Clean up products
    const remainingProducts = await cleanupProducts(manualProducts, seedProductSKUs);
    
    // Step 4: Update categories for remaining products
    await updateProductCategories(remainingProducts);
    
    // Step 5: Show final summary
    const finalProducts = await Product.find({}).sort({ createdAt: -1 });
    console.log('\n=== CLEANUP COMPLETE ===');
    console.log(`Final product count: ${finalProducts.length}`);
    
    if (finalProducts.length > 0) {
      console.log('\nRemaining products:');
      finalProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.category})`);
      });
    }
    
    console.log('\n✅ Product catalog cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
};

// Run cleanup if called directly
if (process.argv[1].endsWith('categoryCleanup.js')) {
  performCleanup();
}

export { performCleanup, newCategories, categoryMapping };
