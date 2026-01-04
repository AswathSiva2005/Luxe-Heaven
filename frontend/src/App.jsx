import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnimatedPage from './components/common/AnimatedPage';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetailPage from './pages/ProductDetailPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';

function AppContent() {
  const location = useLocation();

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route 
              path="/" 
              element={
                <AnimatedPage>
                  <Home />
                </AnimatedPage>
              } 
            />
            <Route 
              path="/products" 
              element={
                <AnimatedPage>
                  <Products />
                </AnimatedPage>
              } 
            />
            <Route 
              path="/products/:id" 
              element={
                <AnimatedPage>
                  <ProductDetailPage />
                </AnimatedPage>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <AnimatedPage>
                  <Cart />
                </AnimatedPage>
              } 
            />
            <Route 
              path="/login" 
              element={
                <AnimatedPage>
                  <Login />
                </AnimatedPage>
              } 
            />
            <Route 
              path="/register" 
              element={
                <AnimatedPage>
                  <Register />
                </AnimatedPage>
              } 
            />
            <Route
              path="/checkout"
              element={
                <AnimatedPage>
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                </AnimatedPage>
              }
            />
            <Route
              path="/profile"
              element={
                <AnimatedPage>
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                </AnimatedPage>
              }
            />
            <Route
              path="/admin"
              element={
                <AnimatedPage>
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                </AnimatedPage>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

