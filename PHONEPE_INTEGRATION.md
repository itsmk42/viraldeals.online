# PhonePe Payment Gateway Integration

## Overview

This document outlines the complete PhonePe payment gateway integration for the ViralDeals e-commerce application. The integration provides secure payment processing using PhonePe's API with support for UPI, Cards, Wallets, and other payment methods.

## Features

- ✅ **Secure Payment Processing**: Uses PhonePe's sandbox environment for testing
- ✅ **Multiple Payment Methods**: UPI, Credit/Debit Cards, Wallets, Net Banking
- ✅ **Real-time Status Updates**: Automatic payment status polling and updates
- ✅ **Callback Handling**: Secure webhook processing for payment confirmations
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Mobile Responsive**: Optimized for both desktop and mobile devices
- ✅ **Order Integration**: Seamless integration with existing order management system

## Architecture

### Backend Components

1. **PhonePe Service** (`backend/services/phonePeService.js`)
   - Handles PhonePe API communication
   - Generates secure signatures for API requests
   - Manages payment creation, status checking, and refunds

2. **Payment Controller** (`backend/controllers/paymentController.js`)
   - New endpoints for PhonePe payment processing
   - Callback handling for payment status updates
   - Integration with existing order management

3. **Payment Routes** (`backend/routes/payments.js`)
   - RESTful API endpoints for PhonePe operations
   - Public callback endpoint for PhonePe webhooks
   - Protected endpoints for payment initiation and status checks

### Frontend Components

1. **PhonePe Payment Component** (`frontend/src/components/PhonePePayment.jsx`)
   - Interactive payment interface
   - Real-time status updates
   - Payment window management and polling

2. **Updated Checkout Flow** (`frontend/src/pages/Checkout.jsx`)
   - PhonePe as primary payment option
   - Multi-step checkout process with payment step
   - Seamless integration with existing cart system

3. **Payment Success Page** (`frontend/src/pages/PaymentSuccess.jsx`)
   - Payment confirmation and order details
   - Error handling for failed payments
   - User-friendly success/failure messaging

## API Endpoints

### PhonePe Payment Endpoints

```
POST /api/payments/phonepe
- Create new PhonePe payment
- Requires: orderId
- Returns: paymentUrl, merchantTransactionId, paymentId

POST /api/payments/phonepe/callback
- Handle PhonePe payment callbacks (public endpoint)
- Verifies signature and updates order status
- Automatically called by PhonePe servers

GET /api/payments/phonepe/status/:transactionId
- Check payment status
- Returns: current payment status and order details
- Used for real-time status polling
```

## Configuration

### Environment Variables

```bash
# PhonePe Configuration (Sandbox)
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_REDIRECT_URL=http://localhost:5173/payment/success
PHONEPE_CALLBACK_URL=http://localhost:5001/api/payments/phonepe/callback
```

### Production Configuration

For production deployment, update the following:

1. **Get Production Credentials** from PhonePe merchant dashboard
2. **Update Environment Variables**:
   ```bash
   PHONEPE_MERCHANT_ID=your_production_merchant_id
   PHONEPE_SALT_KEY=your_production_salt_key
   PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
   PHONEPE_REDIRECT_URL=https://your-domain.com/payment/success
   PHONEPE_CALLBACK_URL=https://your-backend-domain.com/api/payments/phonepe/callback
   ```

## Payment Flow

### 1. Payment Initiation
```javascript
// User selects PhonePe payment method
// Frontend calls backend to create payment
POST /api/payments/phonepe
{
  "orderId": "order_123456789"
}

// Backend creates PhonePe payment request
// Returns payment URL for user redirection
```

### 2. Payment Processing
```javascript
// User is redirected to PhonePe payment page
// Completes payment using preferred method (UPI/Card/Wallet)
// PhonePe processes payment and sends callback to backend
```

### 3. Payment Confirmation
```javascript
// PhonePe sends callback to backend
POST /api/payments/phonepe/callback
{
  "response": "base64_encoded_response",
  "X-VERIFY": "signature_hash"
}

// Backend verifies signature and updates order status
// Frontend polls for status updates
// User is redirected to success/failure page
```

## Testing

### Test Credentials (Sandbox)
- **Merchant ID**: PGTESTPAYUAT
- **Salt Key**: 099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
- **Environment**: Sandbox/Preprod

### Test Payment Methods
- **UPI**: Use any UPI ID for testing
- **Cards**: Use PhonePe test card numbers
- **Wallets**: Test with PhonePe wallet

### Testing Checklist
- [ ] Payment initiation works correctly
- [ ] Payment window opens and loads PhonePe interface
- [ ] Successful payment updates order status
- [ ] Failed payment handling works properly
- [ ] Callback signature verification works
- [ ] Status polling updates UI correctly
- [ ] Payment success page displays correctly
- [ ] Error handling provides user feedback

## Security Features

1. **Signature Verification**: All API requests use SHA256 signatures
2. **Callback Verification**: Webhook signatures are verified before processing
3. **Secure Redirects**: Payment URLs are generated securely by PhonePe
4. **Environment Isolation**: Separate sandbox and production configurations
5. **Error Handling**: Sensitive information is not exposed in error messages

## Troubleshooting

### Common Issues

1. **Payment Window Not Opening**
   - Check popup blockers
   - Verify PHONEPE_BASE_URL is correct
   - Ensure payment URL is valid

2. **Callback Not Received**
   - Verify PHONEPE_CALLBACK_URL is accessible
   - Check firewall settings
   - Ensure callback endpoint is public

3. **Signature Verification Failed**
   - Verify PHONEPE_SALT_KEY is correct
   - Check PHONEPE_SALT_INDEX matches
   - Ensure payload encoding is correct

4. **Payment Status Not Updating**
   - Check status polling interval
   - Verify transaction ID is correct
   - Ensure API endpoints are accessible

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will log detailed information about:
- Payment creation requests
- Callback processing
- Status check responses
- Error details

## Production Deployment

### Prerequisites
1. PhonePe merchant account with production credentials
2. SSL certificate for callback URL
3. Domain verification with PhonePe
4. Production environment variables configured

### Deployment Steps
1. Update environment variables with production values
2. Deploy backend with callback URL accessible
3. Test payment flow in production environment
4. Monitor payment transactions and callbacks
5. Set up monitoring and alerting for payment failures

## Support

For PhonePe integration support:
- **Documentation**: https://developer.phonepe.com/
- **Support**: PhonePe merchant support
- **API Reference**: PhonePe API documentation

For ViralDeals specific issues:
- Check application logs for detailed error information
- Verify environment configuration
- Test in sandbox environment first
