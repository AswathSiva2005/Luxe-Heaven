import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light mt-5 py-4">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Luxe Heaven</h5>
            <p className="text-muted">
              Premium fashion for the modern lifestyle. Discover our collection of
              t-shirts, pants, and sneakers.
            </p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-light text-decoration-none">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-light text-decoration-none">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-light text-decoration-none">
                  Cart
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact</h5>
            <p className="text-muted">
              Email: info@luxeheaven.com
              <br />
              Phone: +1 (555) 123-4567
            </p>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center text-muted">
            <p>&copy; 2024 Luxe Heaven. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;

