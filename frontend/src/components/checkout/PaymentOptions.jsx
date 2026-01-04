import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripeCheckoutForm = ({ amount, orderId, onInitiatePayment, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      // Create order if not already created
      let currentOrderId = orderId;
      if (!currentOrderId && onInitiatePayment) {
        await onInitiatePayment('stripe');
        // OrderId will be available after order creation
        // For now, we'll create payment intent without orderId
        // The webhook will handle it when payment succeeds
      }

      // Create payment intent
      const { data } = await api.post('/payments/stripe/create-intent', {
        amount,
        orderId: currentOrderId,
      });

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess('stripe', paymentIntent);
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Card className="p-3 mb-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </Card>
      <Button
        type="submit"
        variant="dark"
        className="w-100"
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : `Pay $${amount.toFixed(2)} with Stripe`}
      </Button>
    </Form>
  );
};

const PaymentOptions = ({ amount, orderId, onInitiatePayment, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [paypalProcessing, setPaypalProcessing] = useState(false);

  const handlePayPalPayment = async () => {
    setPaypalProcessing(true);
    try {
      if (onInitiatePayment) {
        await onInitiatePayment('paypal');
      }
      // This will be handled after order creation
      onPaymentSuccess('paypal', null);
    } catch (error) {
      toast.error('PayPal payment failed');
      setPaypalProcessing(false);
    }
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>Select Payment Method</Form.Label>
        <Form.Select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="stripe">Stripe (Credit Card)</option>
          <option value="paypal">PayPal</option>
        </Form.Select>
      </Form.Group>

      {paymentMethod === 'stripe' ? (
        <Elements stripe={stripePromise}>
          <StripeCheckoutForm 
            amount={amount} 
            orderId={orderId} 
            onInitiatePayment={onInitiatePayment}
            onSuccess={onPaymentSuccess} 
          />
        </Elements>
      ) : (
        <Button
          variant="dark"
          className="w-100"
          onClick={handlePayPalPayment}
          disabled={paypalProcessing}
        >
          {paypalProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)} with PayPal`}
        </Button>
      )}
    </div>
  );
};

export default PaymentOptions;

