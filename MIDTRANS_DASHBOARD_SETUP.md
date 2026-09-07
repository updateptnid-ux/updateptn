# 🔧 Midtrans Dashboard Configuration

## 📍 Langkah Setup di Midtrans Dashboard

### 1. Login ke Midtrans
- **URL:** https://dashboard.midtrans.com
- **Environment:** Pilih **PRODUCTION** (kiri atas)

---

## ⚙️ Configuration Settings

### A. Webhook / Payment Notification URL

**Path:** Settings → Configuration → **Payment Notification URL**

```
https://updateptn.id/api/midtrans/webhook
```

**⚠️ PENTING:**
- URL ini **HARUS HTTPS** (production)
- Midtrans akan POST notification ke URL ini setiap ada perubahan status payment
- Jangan lupa save!

**Test webhook:**
- Setelah save, Midtrans bisa send test notification
- Klik "Send Test Notification"
- Pastikan return 200 OK

---

### B. Redirect URLs

**Path:** Settings → **Snap Preferences** → Redirect URL

#### 1. **Finish Redirect URL** (Payment Success)
```
https://updateptn.id/payment/status
```

#### 2. **Unfinish Redirect URL** (Payment Pending/Incomplete)
```
https://updateptn.id/payment/status
```

#### 3. **Error Redirect URL** (Payment Failed)
```
https://updateptn.id/payment/status
```

**Note:** Semua redirect ke page yang sama, nanti di page tersebut kita handle status dari query params.

---

### C. Enable Payment Methods

**Path:** Settings → **Payment Channels**

Centang payment methods berikut:

#### 💳 Credit/Debit Card
- [x] Visa
- [x] Mastercard
- [x] JCB
- [x] Amex (optional)

#### 🏦 Bank Transfer
- [x] BCA Virtual Account
- [x] Mandiri Bill Payment
- [x] BNI Virtual Account
- [x] BRI Virtual Account
- [x] Permata Virtual Account
- [x] CIMB Niaga Virtual Account (optional)

#### 📱 E-Wallet
- [x] GoPay
- [x] ShopeePay
- [x] QRIS
- [x] DANA (optional)
- [x] OVO (optional)

#### 🏪 Convenience Store
- [x] Indomaret
- [x] Alfamart

**Note:** Setiap payment method mungkin ada fee/requirement dari Midtrans. Confirm dengan account manager.

---

### D. Security Settings

**Path:** Settings → **Access Keys**

#### Production Keys (Already Set):
```
Server Key:  Mid-server-a6z2QQMxh7JJPetfwKMlY_8n
Client Key:  Mid-client-7O6I9Fp-C3WU4G9t
```

**⚠️ JANGAN SHARE SERVER KEY KE SIAPA PUN!**

#### Enable Security Features:
- [x] **3D Secure** - Extra security for card payments
- [x] **Fraud Detection** - Auto-detect suspicious transactions
- [x] **Signature Key Verification** - Verify webhook authenticity

---

### E. Email & SMS Notifications

**Path:** Settings → **Notifications**

#### Customer Notifications:
- [x] Payment success email
- [x] Payment pending reminder
- [x] Payment expired notification

#### Merchant Notifications (to you):
- [x] Daily transaction summary
- [x] Settlement report
- [x] Failed transaction alert

---

## 🧪 Testing Webhook

### Test dari Midtrans Dashboard:

1. Go to: Settings → Configuration
2. Scroll to "Payment Notification URL"
3. Click **"Send Test Notification"**
4. Expected response: **200 OK**

### Test dengan Real Transaction (Sandbox):

**Untuk testing di Preview/Development environment:**

1. **Switch to Sandbox mode** di Vercel environment variables:
   ```
   MIDTRANS_SERVER_KEY=Mid-server-YOUR_SANDBOX_KEY
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-YOUR_SANDBOX_KEY
   MIDTRANS_IS_PRODUCTION=false
   NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
   NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
   ```

2. **Test card:**
   ```
   Card Number: 4811 1111 1111 1114
   CVV: 123
   Exp: 01/25
   3D Secure OTP: 112233
   ```

3. **Check webhook logs** di Midtrans Dashboard → Transactions

---

## 📊 Monitoring & Reports

### Daily Checks:

1. **Transaction List**
   - Path: Home → Transactions
   - Check settlement status
   - Look for failed transactions

2. **Webhook Delivery**
   - Path: Settings → Webhook Logs
   - Check delivery success rate (should be >99%)
   - Look for failed webhooks (retry if needed)

3. **Settlement Report**
   - Path: Reports → Settlement
   - Check daily settlement amount
   - Verify matches with database

---

## 🔍 Troubleshooting

### Issue: Webhook not received

**Check:**
1. URL correct: `https://updateptn.id/api/midtrans/webhook`
2. Server returns 200 OK
3. No firewall blocking Midtrans IPs
4. Check Vercel function logs

**Midtrans IP Whitelist (if needed):**
```
103.127.16.0/23
103.127.17.0/23
103.208.23.0/24
```

---

### Issue: Payment success but subscription not activated

**Check:**
1. Webhook received (check Midtrans logs)
2. Database commission created
3. Subscription status updated
4. Check Vercel function logs for errors

**Debug query:**
```sql
SELECT 
  p.order_id,
  p.status as payment_status,
  s.status as subscription_status,
  c.commission_amount
FROM payments p
LEFT JOIN subscriptions s ON s.id = (p.metadata->>'subscription_id')::uuid
LEFT JOIN commissions c ON c.order_id = p.order_id
WHERE p.order_id = 'YOUR-ORDER-ID';
```

---

### Issue: Customer redirected to wrong page

**Check:**
1. Redirect URLs in Midtrans: Settings → Snap Preferences
2. Should be: `https://updateptn.id/payment/status`
3. Page should handle query params: `?status=settlement&order_id=XXX`

---

## 📞 Midtrans Support

### Contact Info:
- **Email:** support@midtrans.com
- **Phone:** +62 21 2921 6000
- **WhatsApp:** Available in dashboard
- **Docs:** https://docs.midtrans.com

### When to contact:
- Payment method issues
- Settlement delays
- High fraud rate
- Technical integration problems

---

## ✅ Configuration Checklist

- [ ] Webhook URL set to `https://updateptn.id/api/midtrans/webhook`
- [ ] Test webhook sent successfully (200 OK)
- [ ] Redirect URLs configured (all to `/payment/status`)
- [ ] Payment methods enabled (cards, banks, e-wallets, stores)
- [ ] 3D Secure enabled
- [ ] Fraud detection enabled
- [ ] Email notifications enabled
- [ ] Production keys added to Vercel
- [ ] Test transaction successful
- [ ] Webhook received and commission created

---

## 🎉 Ready for Production!

Setelah semua checklist di atas done, Midtrans integration siap digunakan untuk real transactions!

**Final test:**
1. Real payment dengan kartu kecil (Rp 10,000)
2. Check webhook received
3. Check commission created
4. Check customer redirected properly

**Last Updated:** 2026-01-07
