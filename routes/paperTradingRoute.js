const express = require('express');
const { createOrder, updateOrder, getAllOrders, getSingleOrder} = require('../controller/paperTradingController');
const { checkUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/orders', checkUser, createOrder);
router.put('/orders/:id', checkUser, updateOrder);
router.get('/orders', checkUser,  getAllOrders);
router.get('/orders/:id', checkUser, getSingleOrder);

module.exports = router;
