const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
    maxWishlistsPerUser: {
        type: Number,
        default: 5
    },
    maxItemsPerWishlist: {
        type: Number,
        default: 10
    }
}, { timestamps: true });

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

module.exports = AdminSettings;
