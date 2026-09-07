/**
 * Midtrans Payment Gateway Integration
 * Secure server-side implementation for UpdatePTN
 * 
 * Features:
 * - Snap API for payment page
 * - Server-side token generation
 * - Webhook notification handling
 * - Transaction status checking
 * - Security validation
 */

import crypto from 'crypto';

// Environment variables
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Base URLs
const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://api.midtrans.com'
  : 'https://api.sandbox.midtrans.com';

const MIDTRANS_SNAP_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com'
  : 'https://app.sandbox.midtrans.com';

const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

/**
 * Generate authorization header
 */
function getAuthHeader(): string {
  const encoded = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');
  return `Basic ${encoded}`;
}

/**
 * Create Snap transaction token
 */
export async function createSnapToken(params: {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}): Promise<{ token: string; redirectUrl: string }> {
  try {
    // Validate environment variables
    if (!MIDTRANS_SERVER_KEY) {
      throw new Error('MIDTRANS_SERVER_KEY is not configured');
    }

    const payload = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      customer_details: {
        first_name: params.customerDetails.firstName,
        last_name: params.customerDetails.lastName || '',
        email: params.customerDetails.email,
        phone: params.customerDetails.phone,
      },
      item_details: params.itemDetails,
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/status`,
        error: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/status`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/status`,
      },
    };

    console.log('🔄 Creating Midtrans Snap token...');
    console.log('📍 Endpoint:', `${MIDTRANS_SNAP_BASE_URL}/snap/v1/transactions`);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${MIDTRANS_SNAP_BASE_URL}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    // Get response text first
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);

    if (!response.ok) {
      let errorMessage = 'Failed to create Midtrans transaction';
      
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.error_messages?.join(', ') || error.message || errorMessage;
      } catch (e) {
        // Response is not JSON, use status text
        errorMessage = `Midtrans API error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse Midtrans response as JSON');
      throw new Error('Invalid response from Midtrans API');
    }

    if (!data.token) {
      throw new Error('Midtrans response missing token');
    }

    console.log('✅ Snap token created successfully');

    return {
      token: data.token,
      redirectUrl: data.redirect_url,
    };
  } catch (error: any) {
    console.error('❌ Midtrans create token error:', error);
    throw error;
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(orderId: string): Promise<any> {
  try {
    const response = await fetch(`${MIDTRANS_API_URL}/v2/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get transaction status');
    }

    return await response.json();
  } catch (error) {
    console.error('Midtrans status check error:', error);
    throw error;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const input = orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY;
  const hash = crypto.createHash('sha512').update(input).digest('hex');
  return hash === signatureKey;
}

/**
 * Parse transaction status from webhook
 */
export function parseTransactionStatus(notification: any): {
  orderId: string;
  transactionStatus: string;
  fraudStatus: string;
  paymentType: string;
  grossAmount: string;
  signatureKey: string;
  statusCode: string;
} {
  return {
    orderId: notification.order_id,
    transactionStatus: notification.transaction_status,
    fraudStatus: notification.fraud_status,
    paymentType: notification.payment_type,
    grossAmount: notification.gross_amount,
    signatureKey: notification.signature_key,
    statusCode: notification.status_code,
  };
}

/**
 * Determine final transaction status
 */
export function getFinalStatus(
  transactionStatus: string,
  fraudStatus: string
): 'success' | 'pending' | 'failed' {
  if (transactionStatus === 'capture') {
    if (fraudStatus === 'accept') {
      return 'success';
    }
    return 'pending';
  } else if (transactionStatus === 'settlement') {
    return 'success';
  } else if (
    transactionStatus === 'cancel' ||
    transactionStatus === 'deny' ||
    transactionStatus === 'expire'
  ) {
    return 'failed';
  } else if (transactionStatus === 'pending') {
    return 'pending';
  }
  return 'pending';
}

/**
 * Get Snap.js URL for client-side
 */
export function getSnapJsUrl(): string {
  return MIDTRANS_SNAP_URL;
}

/**
 * Get client key for client-side
 */
export function getClientKey(): string {
  return MIDTRANS_CLIENT_KEY;
}

/**
 * Cancel transaction
 */
export async function cancelTransaction(orderId: string): Promise<void> {
  try {
    const response = await fetch(`${MIDTRANS_API_URL}/v2/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel transaction');
    }
  } catch (error) {
    console.error('Midtrans cancel error:', error);
    throw error;
  }
}

/**
 * Generate unique order ID
 */
export function generateOrderId(prefix: string = 'ORDER'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}
