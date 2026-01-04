import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Badge, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { CATEGORIES, SIZES, COLORS } from '../../utils/constants';
import Loading from '../common/Loading';
import ImageUpload from '../common/ImageUpload';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    description: '',
    price: '',
    category: 't-shirts',
    releaseDate: '',
    images: [],
    stock: '',
    sizes: [],
    colors: [],
    featured: false,
    rating: 0,
    numReviews: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=100');
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSizesChange = (e) => {
    const selectedSizes = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, sizes: selectedSizes });
  };

  const handleColorsChange = (e) => {
    const selectedColors = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, colors: selectedColors });
  };

  const handleImageChange = (images) => {
    setFormData({ ...formData, images });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    try {
      const productData = {
        ...formData,
        productId: formData.productId.toUpperCase().trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        rating: parseFloat(formData.rating) || 0,
        numReviews: parseInt(formData.numReviews) || 0,
        images: formData.images,
        releaseDate: formData.releaseDate,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', productData);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productId: product.productId || '',
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      releaseDate: product.releaseDate ? new Date(product.releaseDate).toISOString().split('T')[0] : '',
      images: product.images || [],
      stock: product.stock,
      sizes: product.sizes || [],
      colors: product.colors || [],
      featured: product.featured || false,
      rating: product.rating || 0,
      numReviews: product.numReviews || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      name: '',
      description: '',
      price: '',
      category: 't-shirts',
      releaseDate: '',
      images: [],
      stock: '',
      sizes: [],
      colors: [],
      featured: false,
      rating: 0,
      numReviews: 0,
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Product Management</h3>
        <Button
          variant="dark"
          size="lg"
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New Product
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive className="mb-0">
            <thead className="table-dark">
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Release Date</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No products found. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <Badge bg="info">{product.productId || 'N/A'}</Badge>
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <Badge bg="secondary">
                        {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                      </Badge>
                    </td>
                    <td><strong>${product.price.toFixed(2)}</strong></td>
                    <td>
                      <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td>
                      {product.releaseDate
                        ? new Date(product.releaseDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      {product.featured ? (
                        <Badge bg="warning" text="dark">Yes</Badge>
                      ) : (
                        <Badge bg="secondary">No</Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Product ID <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., TSH-001, PAN-001, SNK-001"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <Form.Text className="text-muted">
                    Unique product identifier (will be converted to uppercase)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Product Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Enter detailed product description"
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Price ($) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Category <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Release Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Stock Quantity <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="0.0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Reviews</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="numReviews"
                    value={formData.numReviews}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <ImageUpload
              images={formData.images}
              onChange={handleImageChange}
              maxImages={5}
            />

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Available Sizes <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    multiple
                    size="5"
                    value={formData.sizes}
                    onChange={handleSizesChange}
                    required
                    style={{ minHeight: '120px' }}
                  >
                    {SIZES[formData.category]?.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Hold Ctrl/Cmd to select multiple sizes
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Available Colors <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    multiple
                    size="5"
                    value={formData.colors}
                    onChange={handleColorsChange}
                    required
                    style={{ minHeight: '120px' }}
                  >
                    {COLORS.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Hold Ctrl/Cmd to select multiple colors
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="featured"
                label="Mark as Featured Product"
                checked={formData.featured}
                onChange={handleInputChange}
              />
              <Form.Text className="text-muted">
                Featured products will be highlighted on the homepage
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button variant="dark" type="submit">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductManagement;
