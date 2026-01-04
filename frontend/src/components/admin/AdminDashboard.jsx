import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Loading from '../common/Loading';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    featuredProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/orders/all'),
      ]);

      const products = productsRes.data.products || [];
      const orders = ordersRes.data || [];

      const totalRevenue = orders
        .filter((o) => o.isPaid)
        .reduce((sum, o) => sum + o.totalPrice, 0);
      const pendingOrders = orders.filter((o) => o.status === 'pending').length;
      const lowStockProducts = products.filter((p) => p.stock < 10).length;
      const featuredProducts = products.filter((p) => p.featured).length;

      // Get recent orders (last 5)
      const sortedOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
        featuredProducts,
      });
      setRecentOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'primary',
      bg: 'bg-primary',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: '🛒',
      color: 'success',
      bg: 'bg-success',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: '💰',
      color: 'warning',
      bg: 'bg-warning',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: '⏳',
      color: 'info',
      bg: 'bg-info',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: '⚠️',
      color: 'danger',
      bg: 'bg-danger',
    },
    {
      title: 'Featured Products',
      value: stats.featuredProducts,
      icon: '⭐',
      color: 'secondary',
      bg: 'bg-secondary',
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4">Dashboard Overview</h2>
        
        <Row className="g-4 mb-4">
          {statCards.map((stat, index) => (
            <Col key={index} md={4} lg={2}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="text-center p-4">
                    <div className="mb-3" style={{ fontSize: '2.5rem' }}>
                      {stat.icon}
                    </div>
                    <Card.Title className="h5 mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
                      {stat.title}
                    </Card.Title>
                    <h2 className={`mb-0 text-${stat.color}`} style={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </h2>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        <Row>
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-dark text-white">
                <h5 className="mb-0">Recent Orders</h5>
              </Card.Header>
              <Card.Body>
                {recentOrders.length === 0 ? (
                  <p className="text-center text-muted py-4 mb-0">
                    No orders yet. Orders will appear here once customers start purchasing.
                  </p>
                ) : (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <code>{order._id.slice(-8)}</code>
                          </td>
                          <td>{order.user?.name || 'N/A'}</td>
                          <td>
                            <strong>${order.totalPrice?.toFixed(2) || '0.00'}</strong>
                          </td>
                          <td>
                            <Badge
                              bg={
                                order.status === 'completed'
                                  ? 'success'
                                  : order.status === 'pending'
                                  ? 'warning'
                                  : 'secondary'
                              }
                            >
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                            </Badge>
                          </td>
                          <td>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
