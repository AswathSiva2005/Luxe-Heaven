const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');
const Order = require('../models/Order');

// Configure PayPal
paypal.configure({
  mode: 'sandbox', // Change to 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// @desc    Create Stripe payment intent
// @route   POST /api/payments/stripe/create-intent
// @access  Private
const createStripeIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString(),
        orderId: req.body.orderId || '',
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/stripe/webhook
// @access  Public
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
          email_address: paymentIntent.receipt_email,
        };
        await order.save();
      }
    }
  }

  res.json({ received: true });
};

// @desc    Create PayPal payment
// @route   POST /api/payments/paypal/create
// @access  Private
const createPayPalPayment = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: `${process.env.FRONTEND_URL}/checkout/success?orderId=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: 'Luxe Heaven Order',
                sku: orderId,
                price: amount.toFixed(2),
                currency: 'USD',
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: 'USD',
            total: amount.toFixed(2),
          },
          description: 'Luxe Heaven E-commerce Purchase',
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, payment) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      } else {
        // Find approval URL
        const approvalUrl = payment.links.find(
          (link) => link.rel === 'approval_url'
        );

        res.json({
          paymentId: payment.id,
          approvalUrl: approvalUrl.href,
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Execute PayPal payment
// @route   POST /api/payments/paypal/execute
// @access  Private
const executePayPalPayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    const execute_payment_json = {
      payer_id: payerId,
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async (error, payment) => {
        if (error) {
          return res.status(500).json({ message: error.message });
        } else {
          // Update order
          const order = await Order.findById(orderId);
          if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
              id: payment.id,
              status: payment.state,
              update_time: new Date().toISOString(),
              email_address: payment.payer.payer_info.email,
            };
            await order.save();
          }

          res.json({
            success: true,
            payment,
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStripeIntent,
  stripeWebhook,
  createPayPalPayment,
  executePayPalPayment,
};

