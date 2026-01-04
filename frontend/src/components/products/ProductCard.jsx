import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-100 shadow-sm">
        <div className="position-relative" style={{ height: '300px', overflow: 'hidden' }}>
          <Card.Img
            variant="top"
            src={product.images[0] || '/placeholder.jpg'}
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
          />
          {product.featured && (
            <Badge
              bg="warning"
              text="dark"
              className="position-absolute top-0 end-0 m-2"
            >
              Featured
            </Badge>
          )}
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title className="text-truncate">{product.name}</Card.Title>
          <Card.Text className="text-muted small mb-2">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Card.Text>
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">${product.price}</h5>
              {product.stock > 0 ? (
                <Badge bg="success">In Stock</Badge>
              ) : (
                <Badge bg="danger">Out of Stock</Badge>
              )}
            </div>
            <Button
              as={Link}
              to={`/products/${product._id}`}
              variant="dark"
              className="w-100"
            >
              View Details
            </Button>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ProductCard;

