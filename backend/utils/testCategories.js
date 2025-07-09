import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viraldeals');
    console.log('MongoDB Connected for category testing');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Test category functionality
const testCategories = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Testing Category Functionality...\n');
    
    // Test 1: Get all categories
    console.log('1. Testing category retrieval...');
    const categories = await Product.distinct('category', { isActive: true });
    console.log('Available categories:', categories);
    
    // Test 2: Get category counts
    console.log('\n2. Testing category counts...');
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({ 
          category, 
          isActive: true 
        });
        return { name: category, count };
      })
    );
    console.log('Categories with counts:', categoriesWithCount);
    
    // Test 3: Filter products by category
    console.log('\n3. Testing category filtering...');
    for (const category of categories) {
      const products = await Product.find({ category, isActive: true });
      console.log(`${category}: ${products.length} products`);
      products.forEach(product => {
        console.log(`  - ${product.name} (₹${product.price})`);
      });
    }
    
    // Test 4: Verify all products have valid categories
    console.log('\n4. Testing category validation...');
    const allProducts = await Product.find({});
    const validCategories = [
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
    
    let validationPassed = true;
    allProducts.forEach(product => {
      if (!validCategories.includes(product.category)) {
        console.log(`❌ Invalid category found: ${product.name} has category "${product.category}"`);
        validationPassed = false;
      }
    });
    
    if (validationPassed) {
      console.log('✅ All products have valid categories');
    }
    
    // Test 5: Test creating a product with new category
    console.log('\n5. Testing product creation with new categories...');
    try {
      const testProduct = new Product({
        name: 'Test Smart Watch',
        description: 'A test smart watch for category validation',
        price: 2999,
        category: 'Wearable Tech',
        brand: 'TestBrand',
        sku: 'TEST-WATCH-001',
        stock: 5,
        images: [{ url: '/test-watch.jpg', alt: 'Test Watch' }],
        createdBy: new mongoose.Types.ObjectId() // Dummy ObjectId
      });
      
      await testProduct.validate();
      console.log('✅ Product validation passed for "Wearable Tech" category');
      
      // Don't save the test product, just validate
    } catch (error) {
      console.log('❌ Product validation failed:', error.message);
    }
    
    // Test 6: Test invalid category
    console.log('\n6. Testing invalid category rejection...');
    try {
      const invalidProduct = new Product({
        name: 'Test Invalid Product',
        description: 'A test product with invalid category',
        price: 999,
        category: 'Invalid Category',
        brand: 'TestBrand',
        sku: 'TEST-INVALID-001',
        stock: 5,
        images: [{ url: '/test-invalid.jpg', alt: 'Test Invalid' }],
        createdBy: new mongoose.Types.ObjectId()
      });
      
      await invalidProduct.validate();
      console.log('❌ Validation should have failed for invalid category');
    } catch (error) {
      console.log('✅ Invalid category correctly rejected:', error.message);
    }
    
    console.log('\n🎉 Category testing completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Total products: ${allProducts.length}`);
    console.log(`- Active categories: ${categories.length}`);
    console.log(`- Category validation: ${validationPassed ? 'PASSED' : 'FAILED'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Category testing failed:', error);
    process.exit(1);
  }
};

// Run tests if called directly
if (process.argv[1].endsWith('testCategories.js')) {
  testCategories();
}

export { testCategories };
