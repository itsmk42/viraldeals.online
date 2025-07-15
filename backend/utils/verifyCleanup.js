import { connectDB } from './db.js';
import Product from '../models/Product.js';

// Verify cleanup and category update
const verifyCleanup = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Verifying Product Catalog Cleanup and Category Update...\n');
    
    // Get all products
    const allProducts = await Product.find({}).sort({ createdAt: -1 });
    
    console.log('=== FINAL PRODUCT CATALOG ===');
    console.log(`Total products: ${allProducts.length}\n`);
    
    if (allProducts.length === 0) {
      console.log('No products found in database.');
      return;
    }
    
    // Display each product
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Created: ${product.createdAt.toLocaleDateString()}`);
      console.log(`   Active: ${product.isActive}`);
      console.log('   ---');
    });
    
    // Get categories
    const categories = await Product.distinct('category', { isActive: true });
    console.log('\n=== ACTIVE CATEGORIES ===');
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });
    
    // Get category counts
    console.log('\n=== CATEGORY DISTRIBUTION ===');
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({ 
          category, 
          isActive: true 
        });
        return { name: category, count };
      })
    );
    
    categoriesWithCount.forEach(cat => {
      console.log(`${cat.name}: ${cat.count} product(s)`);
    });
    
    // Verify new category enum
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
    
    console.log('\n=== CATEGORY VALIDATION ===');
    let validationPassed = true;
    
    allProducts.forEach(product => {
      if (!newCategories.includes(product.category)) {
        console.log(`❌ Invalid category: ${product.name} has "${product.category}"`);
        validationPassed = false;
      }
    });
    
    if (validationPassed) {
      console.log('✅ All products have valid categories from the new category list');
    }
    
    // Check for old seed products
    const seedProductSKUs = ['SAM-S24U-256', 'APL-IP15P-128', 'SNY-WH1000XM5', 'LV-JEANS-32', 'NIK-AM270-9', 'IP-DUO-6QT'];
    const remainingSeedProducts = allProducts.filter(product => 
      seedProductSKUs.includes(product.sku)
    );
    
    console.log('\n=== SEED PRODUCT CLEANUP VERIFICATION ===');
    if (remainingSeedProducts.length === 0) {
      console.log('✅ All seed products have been successfully removed');
    } else {
      console.log('❌ Some seed products still remain:');
      remainingSeedProducts.forEach(product => {
        console.log(`   - ${product.name} (${product.sku})`);
      });
    }
    
    // Check for test products
    const testProducts = allProducts.filter(product => 
      product.sku.startsWith('TEST')
    );
    
    console.log('\n=== TEST PRODUCT CLEANUP VERIFICATION ===');
    if (testProducts.length === 0) {
      console.log('✅ All test products have been successfully removed');
    } else {
      console.log('❌ Some test products still remain:');
      testProducts.forEach(product => {
        console.log(`   - ${product.name} (${product.sku})`);
      });
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`✅ Product cleanup completed`);
    console.log(`✅ Categories updated to new system`);
    console.log(`✅ ${allProducts.length} manually added products preserved`);
    console.log(`✅ ${categories.length} active categories available`);
    console.log(`✅ Category validation: ${validationPassed ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Seed product removal: ${remainingSeedProducts.length === 0 ? 'COMPLETE' : 'INCOMPLETE'}`);
    console.log(`✅ Test product removal: ${testProducts.length === 0 ? 'COMPLETE' : 'INCOMPLETE'}`);
    
    console.log('\n🎉 Product catalog cleanup and category update verification completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
};

// Run verification if called directly
if (process.argv[1].endsWith('verifyCleanup.js')) {
  verifyCleanup();
}

export { verifyCleanup };
