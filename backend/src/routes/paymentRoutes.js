const express = require('express');
const router = express.Router();
const {
  createStripeIntent,
  stripeWebhook,
  createPayPalPayment,
  executePayPalPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Stripe webhook is handled at server level with raw body
router.post('/stripe/webhook', stripeWebhook);
router.post('/stripe/create-intent', protect, createStripeIntent);
router.post('/paypal/create', protect, createPayPalPayment);
router.post('/paypal/execute', protect, executePayPalPayment);

module.exports = router;

