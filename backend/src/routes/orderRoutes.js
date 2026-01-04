const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  confirmGPayPayment,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(protect);

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/all', admin, getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', admin, updateOrderStatus);
router.put('/:id/confirm-gpay', confirmGPayPayment);

module.exports = router;

