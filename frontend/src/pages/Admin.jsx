import React, { useState } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import { motion } from 'framer-motion';
import AdminDashboard from '../components/admin/AdminDashboard';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';

const Admin = () => {
  const [key, setKey] = useState('dashboard');

  return (
    <Container className="my-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4">Admin Panel</h1>
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-4">
          <Tab eventKey="dashboard" title="Dashboard">
            <AdminDashboard />
          </Tab>
          <Tab eventKey="products" title="Products">
            <ProductManagement />
          </Tab>
          <Tab eventKey="orders" title="Orders">
            <OrderManagement />
          </Tab>
        </Tabs>
      </motion.div>
    </Container>
  );
};

export default Admin;

