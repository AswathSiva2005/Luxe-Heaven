import React, { useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Loading from '../components/common/Loading';
import { Button } from 'react-bootstrap';

const Cart = () => {
  const { cart, loading, fetchCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Container className="my-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4">Shopping Cart</h1>

        {cart.items?.length === 0 ? (
          <Alert variant="info">
            <Alert.Heading>Your cart is empty</Alert.Heading>
            <p>Start shopping to add items to your cart.</p>
            <Button as={Link} to="/products" variant="dark">
              Browse Products
            </Button>
          </Alert>
        ) : (
          <Row>
            <Col md={8}>
              {cart.items?.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </Col>
            <Col md={4}>
              <CartSummary cart={cart} />
            </Col>
          </Row>
        )}
      </motion.div>
    </Container>
  );
};

export default Cart;

