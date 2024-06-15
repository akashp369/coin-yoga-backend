const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares");
const Wishlist = require("../model/wishlistModel");
const WishlistItem = require("../model/wishlistItemModel");
const AdminSettings = require("../model/adminSettingsModel");
const userDB = require("../model/userModel");

// Get Admin Settings
const getAdminSettings = async () => {
    const settings = await AdminSettings.findOne();
    return settings || { maxWishlistsPerUser: 5, maxItemsPerWishlist: 10 }; // Default values
};

// Create Wishlist
module.exports.createWishlist = asyncHandler(async (req, res) => {
    try {
        const userId =  req.userId
        const { name } = req.body;

        const user = await userDB.findById(userId);
        if (!user) {
            return response.validationError(res, "User not found");
        }

        const settings = await getAdminSettings();
        const userWishlists = await Wishlist.find({ userId });

        if (userWishlists.length >= settings.maxWishlistsPerUser) {
            return response.validationError(res, `User can only create up to ${settings.maxWishlistsPerUser} wishlists`);
        }

        const wishlist = await Wishlist.create({ userId, name });
        response.successResponse(res, wishlist, "Wishlist created successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

// Add Item to Wishlist
module.exports.addItemToWishlist = asyncHandler(async (req, res) => {
    try {
        const { wishlistId, name } = req.body;

        const wishlist = await Wishlist.findById(wishlistId).populate('items');
        if (!wishlist) {
            return response.validationError(res, "Wishlist not found");
        }

        const settings = await getAdminSettings();
        if (wishlist.items.length >= settings.maxItemsPerWishlist) {
            return response.validationError(res, `Wishlist can only have up to ${settings.maxItemsPerWishlist} items`);
        }

        const wishlistItem = await WishlistItem.create({ wishlistId, name });
        wishlist.items.push(wishlistItem._id);
        await wishlist.save();

        response.successResponse(res, wishlistItem, "Item added to wishlist successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});



module.exports.removeItemFromWishlist = asyncHandler(async (req, res) => {
    try {
        const { wishlistId, itemId } = req.body;

        const wishlist = await Wishlist.findById(wishlistId).populate('items');
        if (!wishlist) {
            return response.validationError(res, "Wishlist not found");
        }

        const itemIndex = wishlist.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return response.validationError(res, "Item not found in wishlist");
        }

        wishlist.items.splice(itemIndex, 1);
        await wishlist.save();

        await WishlistItem.findByIdAndDelete(itemId);

        response.successResponse(res, null, "Item removed from wishlist successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getWishlistByUserId = asyncHandler(async (req, res) => {
    try {
        const userId =  req.userId

        const wishlist = await Wishlist.find({ userId }).populate('items');
        if (!wishlist) {
            return response.validationError(res, "Wishlist not found for the user");
        }

        response.successResponse(res, wishlist, "Wishlist retrieved successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getWishlistItemsByWishlistId = asyncHandler(async (req, res) => {
    try {
        const { wishlistId } = req.params;

        const wishlist = await Wishlist.findById(wishlistId).populate('items');
        if (!wishlist) {
            return response.validationError(res, "Wishlist not found");
        }

        response.successResponse(res, wishlist.items, "Wishlist items retrieved successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.deleteWishlist = asyncHandler(async (req, res) => {
    try {
        const { wishlistId } = req.params;

        const wishlist = await Wishlist.findById(wishlistId).populate('items');
        if (!wishlist) {
            return response.validationError(res, "Wishlist not found");
        }

        // Delete all items in the wishlist
        await WishlistItem.deleteMany({ wishlistId });

        // Delete the wishlist itself
        await Wishlist.findByIdAndDelete(wishlistId);

        response.successResponse(res, null, "Wishlist deleted successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});