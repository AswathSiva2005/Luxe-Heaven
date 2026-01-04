import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductList from '../components/products/ProductList';
import Loading from '../components/common/Loading';
import { CATEGORIES } from '../utils/constants';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [category, page, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
      };
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await api.get('/products', { params });
      setProducts(response.data.products);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <Container className="my-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4">Our Products</h1>

        <Row className="mb-4">
          <Col md={6}>
            <Form onSubmit={handleSearch}>
              <Form.Group className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button type="submit" variant="dark" className="ms-2">
                  Search
                </Button>
              </Form.Group>
            </Form>
          </Col>
          <Col md={6}>
            <Form.Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {loading ? (
          <Loading />
        ) : (
          <>
            <ProductList products={products} />
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Button
                  variant="outline-dark"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="me-2"
                >
                  Previous
                </Button>
                <span className="align-self-center mx-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline-dark"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </Container>
  );
};

export default Products;

