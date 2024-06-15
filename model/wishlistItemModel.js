const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
    wishlistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wishlist',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    // other fields for wishlist item if needed
}, { timestamps: true });

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);

module.exports = WishlistItem;
