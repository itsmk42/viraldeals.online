// GST Calculation Utilities
export const calculateGST = (amount, rate = 18) => {
  return Math.round((amount * rate) / 100);
};

export const calculateGSTBreakdown = (amount, rate = 18) => {
  const gstAmount = calculateGST(amount, rate);
  const cgst = Math.round(gstAmount / 2); // Central GST
  const sgst = gstAmount - cgst; // State GST
  
  return {
    total: gstAmount,
    cgst,
    sgst,
    rate,
    baseAmount: amount,
    totalWithGST: amount + gstAmount
  };
};

// Indian State List
export const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

// Pincode Validation
export const validatePincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// Phone Number Validation (Indian)
export const validateIndianPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Format Indian Currency
export const formatIndianCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format Indian Numbers (with lakhs and crores)
export const formatIndianNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Shipping Cost Calculation
export const calculateShippingCost = (amount, weight = 0, distance = 0) => {
  // Free shipping for orders above ₹499
  if (amount >= 499) {
    return 0;
  }
  
  // Base shipping cost
  let shippingCost = 49;
  
  // Additional cost for heavy items (above 2kg)
  if (weight > 2) {
    shippingCost += Math.ceil((weight - 2) / 0.5) * 10;
  }
  
  // Additional cost for long distance (above 500km)
  if (distance > 500) {
    shippingCost += 20;
  }
  
  return shippingCost;
};

// Generate Indian Invoice Number
export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `VD-INV-${year}${month}${day}-${random}`;
};

// HSN Code Mapping for common product categories
export const hsnCodes = {
  'Electronics': {
    'Smartphones': '85171200',
    'Laptops': '84713000',
    'Headphones': '85183000',
    'Cameras': '85258000',
    'Tablets': '84713000'
  },
  'Fashion': {
    'Clothing': '62034200',
    'Shoes': '64039900',
    'Bags': '42029200',
    'Watches': '91011900'
  },
  'Home & Kitchen': {
    'Appliances': '84198100',
    'Furniture': '94036000',
    'Cookware': '73239300',
    'Bedding': '63049200'
  },
  'Books': '49019900',
  'Toys & Games': '95030000',
  'Sports & Fitness': '95069900',
  'Beauty & Personal Care': '33049900',
  'Health & Wellness': '30049099',
  'Automotive': '87089900',
  'Grocery': '21069099'
};

// Get HSN Code for product
export const getHSNCode = (category, subcategory = null) => {
  if (subcategory && hsnCodes[category] && hsnCodes[category][subcategory]) {
    return hsnCodes[category][subcategory];
  }
  
  if (typeof hsnCodes[category] === 'string') {
    return hsnCodes[category];
  }
  
  // Return default HSN code for goods
  return '99999999';
};

// Calculate delivery estimate based on pincode
export const calculateDeliveryEstimate = (fromPincode, toPincode) => {
  // Simplified delivery estimation
  // In real application, you would use a logistics API
  
  const from = parseInt(fromPincode.substring(0, 2));
  const to = parseInt(toPincode.substring(0, 2));
  
  const distance = Math.abs(from - to);
  
  let deliveryDays = 2; // Base delivery time
  
  if (distance > 10) {
    deliveryDays += 1; // Inter-state delivery
  }
  
  if (distance > 20) {
    deliveryDays += 1; // Long distance delivery
  }
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
  
  return {
    estimatedDays: deliveryDays,
    estimatedDate: deliveryDate,
    isExpress: deliveryDays <= 2
  };
};

// Popular Indian Banks for Net Banking
export const indianBanks = [
  { code: 'sbi', name: 'State Bank of India', popular: true },
  { code: 'hdfc', name: 'HDFC Bank', popular: true },
  { code: 'icici', name: 'ICICI Bank', popular: true },
  { code: 'axis', name: 'Axis Bank', popular: true },
  { code: 'kotak', name: 'Kotak Mahindra Bank', popular: true },
  { code: 'pnb', name: 'Punjab National Bank', popular: false },
  { code: 'bob', name: 'Bank of Baroda', popular: false },
  { code: 'canara', name: 'Canara Bank', popular: false },
  { code: 'union', name: 'Union Bank of India', popular: false },
  { code: 'indian', name: 'Indian Bank', popular: false }
];

// UPI Apps
export const upiApps = [
  { code: 'gpay', name: 'Google Pay', icon: 'gpay' },
  { code: 'phonepe', name: 'PhonePe', icon: 'phonepe' },
  { code: 'paytm', name: 'Paytm', icon: 'paytm' },
  { code: 'bhim', name: 'BHIM', icon: 'bhim' },
  { code: 'amazonpay', name: 'Amazon Pay', icon: 'amazonpay' }
];

// Generate UPI Payment Link
export const generateUPILink = (upiId, amount, orderNumber, merchantName = 'ViralDeals') => {
  const params = new URLSearchParams({
    pa: upiId, // Payee Address
    pn: merchantName, // Payee Name
    am: amount.toString(), // Amount
    cu: 'INR', // Currency
    tn: `Order-${orderNumber}` // Transaction Note
  });
  
  return `upi://pay?${params.toString()}`;
};
