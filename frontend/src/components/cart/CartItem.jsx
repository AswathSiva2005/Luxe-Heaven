import React from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart();

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) {
      return;
    }
    try {
      await updateCartItem(item._id, newQuantity);
    } catch (error) {
      toast.error('Failed to update cart item');
    }
  };

  const handleRemove = async () => {
    try {
      await removeFromCart(item._id);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Row className="align-items-center py-3 border-bottom">
        <Col md={2}>
          <img
            src={item.product?.images?.[0] || '/placeholder.jpg'}
            alt={item.product?.name}
            className="img-fluid rounded"
            style={{ maxHeight: '100px', objectFit: 'cover' }}
          />
        </Col>
        <Col md={4}>
          <h6>{item.product?.name}</h6>
          <p className="text-muted small mb-0">
            Size: {item.size} | Color: {item.color}
          </p>
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
            style={{ maxWidth: '80px' }}
          />
        </Col>
        <Col md={2}>
          <strong>${(item.price * item.quantity).toFixed(2)}</strong>
        </Col>
        <Col md={2}>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleRemove}
          >
            Remove
          </Button>
        </Col>
      </Row>
    </motion.div>
  );
};

export default CartItem;

