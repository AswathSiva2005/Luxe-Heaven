import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductList from '../components/products/ProductList';
import Loading from '../components/common/Loading';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products/featured');
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-dark text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="display-3 fw-bold mb-4">Luxe Heaven</h1>
                <p className="lead mb-4">
                  Discover premium fashion for the modern lifestyle. Shop our
                  exclusive collection of t-shirts, pants, and sneakers.
                </p>
                <Button
                  as={Link}
                  to="/products"
                  variant="light"
                  size="lg"
                  className="mt-3"
                >
                  Shop Now
                </Button>
              </motion.div>
            </Col>
            <Col md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div
                  className="rounded position-relative overflow-hidden"
                  style={{
                    height: '400px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="text-center text-white position-relative" style={{ zIndex: 2 }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: 1, display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                      <motion.span
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                        style={{ display: 'inline-block' }}
                      >
                        👔
                      </motion.span>
                      <motion.span
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        style={{ display: 'inline-block' }}
                      >
                        👖
                      </motion.span>
                      <motion.span
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                        style={{ display: 'inline-block' }}
                      >
                        👟
                      </motion.span>
                    </div>
                    <h3 className="fw-bold mb-2" style={{ fontSize: '1.8rem' }}>Premium Collection</h3>
                    <p className="mb-0 opacity-75" style={{ fontSize: '1.1rem' }}>Style Meets Quality</p>
                    <div className="mt-4 d-flex gap-3 justify-content-center flex-wrap">
                      <span className="badge bg-light text-dark px-3 py-2" style={{ fontSize: '0.9rem' }}>T-Shirts</span>
                      <span className="badge bg-light text-dark px-3 py-2" style={{ fontSize: '0.9rem' }}>Pants</span>
                      <span className="badge bg-light text-dark px-3 py-2" style={{ fontSize: '0.9rem' }}>Sneakers</span>
                    </div>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Products */}
      <section className="py-5">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-center mb-5">Featured Products</h2>
            {loading ? (
              <Loading />
            ) : (
              <ProductList products={featuredProducts} />
            )}
            {!loading && featuredProducts.length > 0 && (
              <div className="text-center mt-4">
                <Button as={Link} to="/products" variant="outline-dark" size="lg">
                  View All Products
                </Button>
              </div>
            )}
          </motion.div>
        </Container>
      </section>
    </>
  );
};

export default Home;

