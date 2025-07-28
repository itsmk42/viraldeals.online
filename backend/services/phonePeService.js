import crypto from 'crypto';
import axios from 'axios';

class PhonePeService {
  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID;
    this.saltKey = process.env.PHONEPE_SALT_KEY;
    this.saltIndex = process.env.PHONEPE_SALT_INDEX;
    this.baseUrl = process.env.PHONEPE_BASE_URL;
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL;
    this.callbackUrl = process.env.PHONEPE_CALLBACK_URL;
  }

  // Generate X-VERIFY header for PhonePe API
  generateXVerify(payload) {
    const string = payload + '/pg/v1/pay' + this.saltKey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    return sha256 + '###' + this.saltIndex;
  }

  // Generate X-VERIFY header for status check
  generateStatusXVerify(merchantTransactionId) {
    const string = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}` + this.saltKey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    return sha256 + '###' + this.saltIndex;
  }

  // Create payment request
  async createPayment(orderData) {
    try {
      const { orderId, amount, userPhone, userName, userEmail } = orderData;
      
      const merchantTransactionId = `VD_${orderId}_${Date.now()}`;
      
      const paymentPayload = {
        merchantId: this.merchantId,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: `USER_${Date.now()}`,
        amount: amount * 100, // Convert to paise
        redirectUrl: `${this.redirectUrl}?orderId=${orderId}&transactionId=${merchantTransactionId}`,
        redirectMode: 'POST',
        callbackUrl: this.callbackUrl,
        mobileNumber: userPhone,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      // Base64 encode the payload
      const base64Payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
      
      // Generate X-VERIFY header
      const xVerify = this.generateXVerify(base64Payload);

      const response = await axios.post(
        `${this.baseUrl}/pg/v1/pay`,
        {
          request: base64Payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        return {
          success: true,
          paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId: merchantTransactionId,
          paymentId: response.data.data.merchantTransactionId
        };
      } else {
        throw new Error(response.data.message || 'Payment initiation failed');
      }

    } catch (error) {
      console.error('PhonePe payment creation error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Payment creation failed');
    }
  }

  // Check payment status
  async checkPaymentStatus(merchantTransactionId) {
    try {
      const xVerify = this.generateStatusXVerify(merchantTransactionId);
      
      const response = await axios.get(
        `${this.baseUrl}/pg/v1/status/${this.merchantId}/${merchantTransactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      return {
        success: response.data.success,
        status: response.data.data?.state,
        paymentInstrument: response.data.data?.paymentInstrument,
        transactionId: response.data.data?.transactionId,
        amount: response.data.data?.amount,
        responseCode: response.data.data?.responseCode,
        responseMessage: response.data.message
      };

    } catch (error) {
      console.error('PhonePe status check error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Status check failed');
    }
  }

  // Verify callback signature
  verifyCallback(xVerify, response) {
    try {
      const [receivedHash, receivedSaltIndex] = xVerify.split('###');
      
      if (receivedSaltIndex !== this.saltIndex) {
        return false;
      }

      const string = response + this.saltKey;
      const expectedHash = crypto.createHash('sha256').update(string).digest('hex');
      
      return receivedHash === expectedHash;
    } catch (error) {
      console.error('Callback verification error:', error);
      return false;
    }
  }

  // Process refund
  async processRefund(originalTransactionId, refundAmount, refundId) {
    try {
      const merchantTransactionId = `REFUND_${refundId}_${Date.now()}`;
      
      const refundPayload = {
        merchantId: this.merchantId,
        merchantTransactionId: merchantTransactionId,
        originalTransactionId: originalTransactionId,
        amount: refundAmount * 100, // Convert to paise
        callbackUrl: this.callbackUrl
      };

      const base64Payload = Buffer.from(JSON.stringify(refundPayload)).toString('base64');
      const xVerify = this.generateXVerify(base64Payload);

      const response = await axios.post(
        `${this.baseUrl}/pg/v1/refund`,
        {
          request: base64Payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      return {
        success: response.data.success,
        refundTransactionId: merchantTransactionId,
        status: response.data.data?.state,
        message: response.data.message
      };

    } catch (error) {
      console.error('PhonePe refund error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Refund failed');
    }
  }
}

export default new PhonePeService();
