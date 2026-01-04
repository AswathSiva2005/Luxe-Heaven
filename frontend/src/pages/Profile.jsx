import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/myorders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: profileData.name,
        email: profileData.email,
      };
      if (profileData.password) {
        updateData.password = profileData.password;
      }

      const updatedUser = await api.put('/auth/profile', updateData);
      updateUser(updatedUser.data);
      toast.success('Profile updated successfully!');
      setProfileData({
        ...profileData,
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4">My Profile</h1>
        <Tabs defaultActiveKey="profile" className="mb-4">
          <Tab eventKey="profile" title="Profile">
            <Card className="shadow">
              <Card.Body className="p-4">
                {message && (
                  <Alert variant={message.includes('success') ? 'success' : 'danger'}>
                    {message}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password (leave blank to keep current)</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={profileData.password}
                      onChange={handleChange}
                      minLength={6}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={profileData.confirmPassword}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Button variant="dark" type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Tab>
          <Tab eventKey="orders" title="My Orders">
            <Card className="shadow">
              <Card.Body>
                {ordersLoading ? (
                  <Loading />
                ) : orders.length === 0 ? (
                  <p className="text-muted">No orders yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td>{order._id.slice(-8)}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>${order.totalPrice.toFixed(2)}</td>
                            <td>
                              <span className={`badge bg-${
                                order.status === 'delivered' ? 'success' :
                                order.status === 'cancelled' ? 'danger' :
                                'warning'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              {order.isPaid ? (
                                <span className="badge bg-success">Paid</span>
                              ) : (
                                <span className="badge bg-danger">Unpaid</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </motion.div>
    </Container>
  );
};

export default Profile;

