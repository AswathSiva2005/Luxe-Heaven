import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const CartSummary = ({ cart }) => {
  const subtotal = cart.total || 0;
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <Card className="shadow">
      <Card.Header>
        <h5 className="mb-0">Order Summary</h5>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Tax (10%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Shipping:</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <hr />
        <div className="d-flex justify-content-between mb-3">
          <strong>Total:</strong>
          <strong>${total.toFixed(2)}</strong>
        </div>
        {cart.items?.length > 0 && (
          <Button
            as={Link}
            to="/checkout"
            variant="dark"
            className="w-100"
          >
            Proceed to Checkout
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default CartSummary;

