import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { toast } from 'react-toastify';
import api from '../services/api';
import CheckoutForm from '../components/checkout/CheckoutForm';
import PaymentOptions from '../components/checkout/PaymentOptions';
import Loading from '../components/common/Loading';

const Checkout = () => {
  const { cart, loading: cartLoading, fetchCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    paymentMethod: 'cod',
  });
  const [processing, setProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (!cartLoading && (!cart.items || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  const calculateTotals = () => {
    const subtotal = cart.total || 0;
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;
    return { subtotal, tax, shipping, total };
  };

  const createOrder = async (paymentMethod) => {
    try {
      const orderData = {
        shippingAddress: formData.shippingAddress,
        paymentMethod: paymentMethod,
      };

      const orderResponse = await api.post('/orders', orderData);
      const order = orderResponse.data;
      setCurrentOrderId(order._id);
      setOrderCreated(true);
      return order;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
      throw error;
    }
  };

  const handlePaymentSuccess = async (method, paymentData) => {
    setProcessing(true);

    try {
      const { total } = calculateTotals();

      // Create order if not already created
      let orderId = currentOrderId;
      if (!orderCreated) {
        const order = await createOrder(method);
        orderId = order._id;
      }

      // Handle Cash on Delivery
      if (method === 'cod') {
        toast.success('Order placed successfully! You will pay on delivery.');
        navigate(`/profile`);
        return;
      }

      // Handle GPay
      if (method === 'gpay') {
        if (paymentData && paymentData.status === 'succeeded') {
          toast.success('Payment confirmed! Order placed successfully.');
          navigate(`/profile`);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process payment');
      setProcessing(false);
    }
  };

  const handleInitiatePayment = async (method) => {
    // Create order when user initiates payment
    if (!orderCreated) {
      try {
        await createOrder(method);
      } catch (error) {
        return; // Error already handled in createOrder
      }
    }
  };

  if (cartLoading) {
    return <Loading />;
  }

  if (!cart.items || cart.items.length === 0) {
    return null;
  }

  const { subtotal, tax, shipping, total } = calculateTotals();

  return (
    <Container className="my-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4">Checkout</h1>
        <Row>
          <Col md={8}>
            <Card className="shadow mb-4">
              <Card.Body>
                <CheckoutForm formData={formData} setFormData={setFormData} />
              </Card.Body>
            </Card>
            <Card className="shadow">
              <Card.Body>
                <h5 className="mb-3">Payment</h5>
                <PaymentOptions
                  amount={total}
                  orderId={currentOrderId}
                  onInitiatePayment={handleInitiatePayment}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow">
              <Card.Header>
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong>${total.toFixed(2)}</strong>
                </div>
                {processing && (
                  <Alert variant="info" className="mb-0">
                    Processing your order...
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default Checkout;

