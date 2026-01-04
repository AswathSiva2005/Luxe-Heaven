import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge, Form, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useCart } from '../../hooks/useCart';
import { SIZES, COLORS } from '../../utils/constants';
import Product3DView from './Product3DView';

const ProductDetail = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Check if product exists and is available
  const isProductAvailable = product && product.stock > 0;
  const isProductDeleted = !product;

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    if (!isProductAvailable) {
      toast.error('Product is not available');
      return;
    }

    try {
      await addToCart(product._id, quantity, selectedSize, selectedColor);
      toast.success('Product added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <Container className="my-5">
      <Row>
        <Col md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4">
              <img
                src={product.images[0] || '/placeholder.jpg'}
                alt={product.name}
                className="img-fluid rounded shadow"
                style={{ maxHeight: '500px', objectFit: 'cover', width: '100%' }}
              />
            </div>
            {product.category === 'sneakers' && (
              <div className="mt-4">
                <h5>3D View</h5>
                <Product3DView product={product} />
              </div>
            )}
          </motion.div>
        </Col>
        <Col md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-3">{product.name}</h1>
            <div className="mb-3">
              <Badge bg="secondary" className="me-2">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Badge>
              {product.featured && <Badge bg="warning" text="dark">Featured</Badge>}
            </div>
            <h3 className="mb-4 text-primary">${product.price}</h3>
            <p className="text-muted mb-4">{product.description}</p>

            {isProductDeleted ? (
              <Alert variant="danger">
                <Alert.Heading>Product Not Available</Alert.Heading>
                <p>This product has been removed from our catalog.</p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-100 mb-3"
                  disabled
                >
                  Stock Unavailable
                </Button>
              </Alert>
            ) : isProductAvailable ? (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Size</Form.Label>
                  <Form.Select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {SIZES[product.category]?.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    {product.colors?.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    style={{ maxWidth: '100px' }}
                  />
                  <Form.Text className="text-muted">
                    {product.stock} available
                  </Form.Text>
                </Form.Group>

                <Button
                  variant="dark"
                  size="lg"
                  className="w-100 mb-3"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </>
            ) : (
              <Alert variant="warning">
                <Alert.Heading>Out of Stock</Alert.Heading>
                <p>This product is currently out of stock.</p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-100 mb-3"
                  disabled
                >
                  Stock Unavailable
                </Button>
              </Alert>
            )}

            <div className="mt-4">
              <h5>Product Details</h5>
              <ul>
                <li>Available Sizes: {product.sizes?.join(', ')}</li>
                <li>Available Colors: {product.colors?.join(', ')}</li>
                <li>Stock: {product.stock} units</li>
                {product.rating > 0 && (
                  <li>Rating: {product.rating} / 5 ({product.numReviews} reviews)</li>
                )}
              </ul>
            </div>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;

