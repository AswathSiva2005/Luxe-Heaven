import React from 'react';
import { Container } from 'react-bootstrap';

const Product3DView = ({ product }) => {
  // For sneakers, show a placeholder for 3D view
  // Note: Full 3D functionality can be enabled after resolving dependency conflicts
  const isSneaker = product.category === 'sneakers';

  if (!isSneaker) {
    return (
      <Container className="text-center py-5">
        <p className="text-muted">3D view available for sneakers only</p>
      </Container>
    );
  }

  return (
    <Container className="text-center py-5" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <div>
        <h5 className="mb-3">3D Product View</h5>
        <p className="text-muted mb-3">
          Interactive 3D visualization coming soon!
        </p>
        <div style={{ 
          width: '200px', 
          height: '200px', 
          margin: '0 auto',
          backgroundColor: '#e9ecef',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #dee2e6'
        }}>
          <span style={{ fontSize: '48px' }}>👟</span>
        </div>
        <p className="text-muted mt-3 small">
          Rotate, zoom, and explore products in 3D
        </p>
      </div>
    </Container>
  );
};

export default Product3DView;

