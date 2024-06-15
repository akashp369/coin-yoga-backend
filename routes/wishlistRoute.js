const express = require('express');
const { createWishlist, addItemToWishlist, removeItemFromWishlist, getWishlistByUserId, getWishlistItemsByWishlistId, deleteWishlist } = require('../controller/wishlistController');
const { checkUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-wishlist', checkUser, createWishlist);
router.post('/add-item', checkUser, addItemToWishlist);
router.post('/remove-item', checkUser, removeItemFromWishlist);
router.get('/user', checkUser, getWishlistByUserId);
router.get('/:wishlistId/items', checkUser, getWishlistItemsByWishlistId);
router.delete('/:wishlistId', checkUser, deleteWishlist);

module.exports = router;
