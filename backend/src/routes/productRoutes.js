const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Validation rules
const productValidation = [
  body('productId').trim().notEmpty().withMessage('Product ID is required'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .isIn(['t-shirts', 'pants', 'sneakers'])
    .withMessage('Invalid category'),
  body('releaseDate').isISO8601().withMessage('Valid release date is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

router.get('/featured', getFeaturedProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, admin, productValidation, createProduct);
router.put('/:id', protect, admin, productValidation, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;

