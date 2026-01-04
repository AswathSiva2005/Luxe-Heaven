import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const handleImageHover = () => {
    if (product.images && product.images.length > 1) {
      setImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ height: '100%' }}
    >
      <Card 
        className="h-100 shadow-sm border-0"
        style={{ 
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        <motion.div 
          className="position-relative" 
          style={{ height: '300px', overflow: 'hidden' }}
          onMouseEnter={handleImageHover}
        >
          <motion.img
            src={product.images?.[imageIndex] || product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            style={{ 
              objectFit: 'cover', 
              height: '100%', 
              width: '100%',
              transition: 'transform 0.5s ease',
            }}
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: isHovered ? 0 : 20,
                opacity: isHovered ? 1 : 0 
              }}
              transition={{ delay: 0.1 }}
            >
              <Button
                as={Link}
                to={`/products/${product._id}`}
                variant="light"
                size="lg"
                className="shadow"
              >
                Quick View
              </Button>
            </motion.div>
          </motion.div>

          {product.featured && (
            <Badge
              bg="warning"
              text="dark"
              className="position-absolute top-0 end-0 m-2"
              style={{ zIndex: 2 }}
            >
              ⭐ Featured
            </Badge>
          )}
          
          {/* Image indicator dots */}
          {product.images && product.images.length > 1 && (
            <div 
              className="position-absolute bottom-0 start-50 translate-middle-x mb-2"
              style={{ zIndex: 2 }}
            >
              <div className="d-flex gap-1">
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: index === imageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => setImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <Card.Body className="d-flex flex-column">
          <Card.Title className="text-truncate mb-2">{product.name}</Card.Title>
          <Card.Text className="text-muted small mb-2">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1).replace('-', ' ')}
          </Card.Text>
          
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <motion.h5 
                className="mb-0 text-primary"
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                ${product.price.toFixed(2)}
              </motion.h5>
              {product.stock > 0 ? (
                <Badge bg="success" pill>
                  In Stock
                </Badge>
              ) : (
                <Badge bg="danger" pill>
                  Out of Stock
                </Badge>
              )}
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                as={Link}
                to={`/products/${product._id}`}
                variant="dark"
                className="w-100"
                size="lg"
              >
                View Details
              </Button>
            </motion.div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
