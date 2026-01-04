import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductCard from './ProductCard';

const ProductList = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No products found.</p>
      </div>
    );
  }

  return (
    <Row>
      {products.map((product) => (
        <Col key={product._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;

