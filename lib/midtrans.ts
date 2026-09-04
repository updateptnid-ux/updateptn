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
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://api.midtrans.com'
  : 'https://api.sandbox.midtrans.com';

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
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/finish`,
        error: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/error`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/pending`,
      },
    };

    const response = await fetch(`${MIDTRANS_BASE_URL}/v2/snap/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_messages?.join(', ') || 'Failed to create transaction');
    }

    const data = await response.json();

    return {
      token: data.token,
      redirectUrl: data.redirect_url,
    };
  } catch (error) {
    console.error('Midtrans create token error:', error);
    throw error;
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(orderId: string): Promise<any> {
  try {
    const response = await fetch(`${MIDTRANS_BASE_URL}/v2/${orderId}/status`, {
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
    const response = await fetch(`${MIDTRANS_BASE_URL}/v2/${orderId}/cancel`, {
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
