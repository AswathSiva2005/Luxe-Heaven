import React from 'react';
import { Row, Col, Button, Form, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart();

  // Check if product exists and is available
  const productExists = item.productExists !== false && item.product;
  const isAvailable = item.isAvailable !== false && productExists;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) {
      return;
    }
    
    if (!isAvailable) {
      toast.error('This product is no longer available');
      return;
    }

    try {
      await updateCartItem(item._id, newQuantity);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart item');
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
      <Row className={`align-items-center py-3 border-bottom ${!isAvailable ? 'bg-light' : ''}`}>
        <Col md={2}>
          <img
            src={item.product?.images?.[0] || '/placeholder.jpg'}
            alt={item.product?.name || 'Product'}
            className="img-fluid rounded"
            style={{ 
              maxHeight: '100px', 
              objectFit: 'cover',
              opacity: isAvailable ? 1 : 0.5
            }}
          />
        </Col>
        <Col md={4}>
          <h6>{item.product?.name || 'Product No Longer Available'}</h6>
          <p className="text-muted small mb-1">
            Size: {item.size} | Color: {item.color}
          </p>
          {!productExists && (
            <Badge bg="danger" className="mt-1">Product Removed</Badge>
          )}
          {productExists && !isAvailable && (
            <Badge bg="warning" text="dark" className="mt-1">Out of Stock</Badge>
          )}
        </Col>
        <Col md={2}>
          <Form.Control
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
            style={{ maxWidth: '80px' }}
            disabled={!isAvailable}
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

