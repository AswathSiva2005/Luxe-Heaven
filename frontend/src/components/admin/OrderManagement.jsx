import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Loading from '../common/Loading';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/all');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h3 className="mb-4">Order Management</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id.slice(-8)}</td>
              <td>
                {order.user?.name || 'N/A'}
                <br />
                <small className="text-muted">{order.user?.email}</small>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>
                {order.isPaid ? (
                  <Badge bg="success">Paid</Badge>
                ) : (
                  <Badge bg="danger">Unpaid</Badge>
                )}
              </td>
              <td>
                <Form.Select
                  size="sm"
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </td>
              <td>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => {
                    // View order details
                    alert(`Order Details:\nItems: ${order.items.length}\nTotal: $${order.totalPrice}`);
                  }}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {orders.length === 0 && (
        <p className="text-center text-muted mt-4">No orders found</p>
      )}
    </div>
  );
};

export default OrderManagement;

