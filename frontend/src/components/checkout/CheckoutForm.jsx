import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const CheckoutForm = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({
      ...formData,
      shippingAddress: {
        ...formData.shippingAddress,
        [e.target.name]: e.target.value,
      },
    });
  };

  return (
    <Form>
      <h5 className="mb-3">Shipping Address</h5>
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Street Address</Form.Label>
            <Form.Control
              type="text"
              name="street"
              value={formData.shippingAddress.street}
              onChange={handleChange}
              required
              placeholder="123 Main St"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.shippingAddress.city}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>State</Form.Label>
            <Form.Control
              type="text"
              name="state"
              value={formData.shippingAddress.state}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Zip Code</Form.Label>
            <Form.Control
              type="text"
              name="zipCode"
              value={formData.shippingAddress.zipCode}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.shippingAddress.country}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default CheckoutForm;

