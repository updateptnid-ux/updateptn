/**
 * Midtrans Connection Test Script
 * Run: npx tsx scripts/test-midtrans.ts
 */

import { createSnapToken } from '../lib/midtrans';

async function testMidtransConnection() {
  console.log('🧪 Testing Midtrans Connection...\n');
  
  console.log('📋 Environment Check:');
  console.log('- SERVER_KEY:', process.env.MIDTRANS_SERVER_KEY ? '✅ Set' : '❌ Missing');
  console.log('- CLIENT_KEY:', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? '✅ Set' : '❌ Missing');
  console.log('- IS_PRODUCTION:', process.env.MIDTRANS_IS_PRODUCTION || 'false');
  console.log('- SNAP_URL:', process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js');
  console.log('');

  // Test data
  const testOrderId = `TEST-${Date.now()}`;
  
  console.log('🔄 Creating test Snap token...');
  console.log('Order ID:', testOrderId);
  console.log('');

  try {
    const result = await createSnapToken({
      orderId: testOrderId,
      grossAmount: 10000,
      customerDetails: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@updateptn.com',
        phone: '081234567890',
      },
      itemDetails: [
        {
          id: 'test-item',
          name: 'Test Payment',
          price: 10000,
          quantity: 1,
        },
      ],
    });

    console.log('✅ SUCCESS! Midtrans connection working!');
    console.log('');
    console.log('📦 Response:');
    console.log('- Token:', result.token.substring(0, 30) + '...');
    console.log('- Redirect URL:', result.redirectUrl);
    console.log('');
    console.log('🎉 Payment integration is ready!');
    
    return true;
  } catch (error: any) {
    console.error('❌ FAILED! Midtrans connection error:');
    console.error(error.message);
    console.log('');
    console.log('🔍 Troubleshooting:');
    console.log('1. Check if SERVER_KEY is correct in .env.local');
    console.log('2. Verify you\'re using sandbox credentials for testing');
    console.log('3. Check Midtrans dashboard for API status');
    console.log('4. Ensure no firewall blocking the connection');
    
    return false;
  }
}

// Run test
testMidtransConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
