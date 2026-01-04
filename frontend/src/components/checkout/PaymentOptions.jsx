import React, { useState } from 'react';
import { Form, Button, Card, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FiCreditCard, FiSmartphone } from 'react-icons/fi';
import api from '../../services/api';

// Simple QR Code Component (using canvas)
const QRCode = ({ value, size = 200 }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const qrSize = size;
    const moduleSize = 10;
    const modules = qrSize / moduleSize;

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, qrSize, qrSize);

    // Simple QR-like pattern (in production, use a proper QR library)
    ctx.fillStyle = '#000000';
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add text
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Scan with GPay', qrSize / 2, qrSize + 20);
  }, [value, size]);

  return (
    <div className="d-flex flex-column align-items-center">
      <canvas ref={canvasRef} width={size} height={size} style={{ border: '2px solid #000' }} />
      <div className="mt-3 p-3 bg-light rounded" style={{ maxWidth: '300px', wordBreak: 'break-all' }}>
        <strong>UPI ID:</strong> yourbusiness@paytm
        <br />
        <strong>Amount:</strong> ₹{value}
      </div>
    </div>
  );
};

const PaymentOptions = ({ amount, orderId, onInitiatePayment, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showQRCode, setShowQRCode] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleCashOnDelivery = async () => {
    setProcessing(true);
    try {
      if (onInitiatePayment) {
        await onInitiatePayment('cod');
      }
      // For COD, order is created and marked as pending
      await onPaymentSuccess('cod', { status: 'pending' });
      toast.success('Order placed successfully! You will pay on delivery.');
    } catch (error) {
      toast.error('Failed to place order');
      setProcessing(false);
    }
  };

  const handleGPayClick = async () => {
    try {
      if (onInitiatePayment) {
        await onInitiatePayment('gpay');
      }
      setShowQRCode(true);
    } catch (error) {
      toast.error('Failed to initialize GPay payment');
    }
  };

  const handleGPayConfirm = async () => {
    setProcessing(true);
    try {
      // Confirm GPay payment with backend
      if (orderId) {
        await api.put(`/orders/${orderId}/confirm-gpay`);
        await onPaymentSuccess('gpay', { status: 'succeeded' });
        setShowQRCode(false);
        toast.success('Payment confirmed! Order placed successfully.');
      } else {
        throw new Error('Order ID not found');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment verification failed');
      setProcessing(false);
    }
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>Select Payment Method</Form.Label>
        <Form.Select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="cod">Cash on Delivery</option>
          <option value="gpay">Google Pay (GPay)</option>
        </Form.Select>
      </Form.Group>

      {paymentMethod === 'cod' ? (
        <Card className="p-3 mb-3 border-primary">
          <div className="d-flex align-items-center mb-3">
            <FiCreditCard size={24} className="text-primary me-2" />
            <div>
              <h6 className="mb-0">Cash on Delivery</h6>
              <small className="text-muted">Pay when you receive your order</small>
            </div>
          </div>
          <Alert variant="info" className="mb-3">
            <small>
              <strong>Note:</strong> Cash on delivery orders may take 3-5 business days to process.
              Please keep exact change ready.
            </small>
          </Alert>
          <Button
            variant="dark"
            className="w-100"
            onClick={handleCashOnDelivery}
            disabled={processing}
          >
            {processing ? 'Placing Order...' : `Place Order - $${amount.toFixed(2)}`}
          </Button>
        </Card>
      ) : (
        <Card className="p-3 mb-3 border-success">
          <div className="d-flex align-items-center mb-3">
            <FiSmartphone size={24} className="text-success me-2" />
            <div>
              <h6 className="mb-0">Google Pay</h6>
              <small className="text-muted">Scan QR code to pay</small>
            </div>
          </div>
          <Button
            variant="success"
            className="w-100 mb-3"
            onClick={handleGPayClick}
            disabled={processing}
          >
            Generate QR Code
          </Button>
        </Card>
      )}

      {/* GPay QR Code Modal */}
      <Modal show={showQRCode} onHide={() => !processing && setShowQRCode(false)} centered size="lg">
        <Modal.Header closeButton={!processing}>
          <Modal.Title>Scan to Pay with GPay</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="mb-3">
            <QRCode value={amount.toFixed(2)} size={256} />
          </div>
          <Alert variant="info">
            <strong>Amount:</strong> ${amount.toFixed(2)}
            <br />
            <small>Scan this QR code with your GPay app to complete the payment</small>
            <br />
            <small className="text-muted mt-2 d-block">
              <strong>UPI ID:</strong> yourbusiness@paytm (Update this with your actual UPI ID)
            </small>
          </Alert>
          <div className="mt-3">
            <Button
              variant="success"
              className="w-100"
              onClick={handleGPayConfirm}
              disabled={processing}
            >
              {processing ? 'Verifying Payment...' : 'I have Paid'}
            </Button>
            <Button
              variant="outline-secondary"
              className="w-100 mt-2"
              onClick={() => setShowQRCode(false)}
              disabled={processing}
            >
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PaymentOptions;
