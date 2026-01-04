import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductList from '../components/products/ProductList';
import Loading from '../components/common/Loading';
import HomeTShirt3D from '../components/products/TShirt3D/HomeTShirt3D';

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
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="display-3 fw-bold mb-4" style={{ color: '#2c3e50' }}>Luxe Heaven</h1>
                <p className="lead mb-4" style={{ color: '#34495e' }}>
                  Discover premium fashion for the modern lifestyle. Shop our
                  exclusive collection of t-shirts, pants, and sneakers.
                </p>
                <Button
                  as={Link}
                  to="/products"
                  variant="dark"
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
                <HomeTShirt3D />
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

