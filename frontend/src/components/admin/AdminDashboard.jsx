import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import api from '../../services/api';
import Loading from '../common/Loading';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products?limit=1'),
        api.get('/orders/all'),
      ]);

      const orders = ordersRes.data;
      const totalRevenue = orders
        .filter((o) => o.isPaid)
        .reduce((sum, o) => sum + o.totalPrice, 0);
      const pendingOrders = orders.filter((o) => o.status === 'pending').length;

      setStats({
        totalProducts: productsRes.data.total || 0,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h3 className="mb-4">Dashboard Overview</h3>
      <Row>
        <Col md={3}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>Total Products</Card.Title>
              <h2>{stats.totalProducts}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>Total Orders</Card.Title>
              <h2>{stats.totalOrders}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>Total Revenue</Card.Title>
              <h2>${stats.totalRevenue.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center mb-4">
            <Card.Body>
              <Card.Title>Pending Orders</Card.Title>
              <h2>{stats.pendingOrders}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;

