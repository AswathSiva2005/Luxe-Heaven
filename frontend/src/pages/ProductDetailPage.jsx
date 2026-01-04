import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductDetail from '../components/products/ProductDetail';
import Loading from '../components/common/Loading';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          // Product was deleted or doesn't exist
          setProduct(null);
        } else {
          toast.error('Failed to load product');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!product && !loading) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Product Not Found</Alert.Heading>
          <p>This product may have been removed or does not exist.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ProductDetail product={product} />
    </motion.div>
  );
};

export default ProductDetailPage;

