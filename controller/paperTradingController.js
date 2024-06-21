const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares");
const Order = require("../model/paperOrderModel");


module.exports.createOrder = asyncHandler(async (req, res) => {
    try {
        const { orderType, cryptoSymbol, amount, price, status, qty } = req.body;
        const userId =  req.userId
        const newOrder = await Order.create({
            userId,
            orderType,
            cryptoSymbol,
            amount,
            price,
            status, 
            qty
        });

        response.successResponse(res, newOrder, "Order created successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.updateOrder = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId =  req.userId
        const { orderType, cryptoSymbol, amount, price, status, qty } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(id, {
            userId,
            orderType,
            cryptoSymbol,
            amount,
            price,
            status, 
            qty
        }, { new: true });

        if (!updatedOrder) {
            return response.validationError(res, "Order not found");
        }

        response.successResponse(res, updatedOrder, "Order updated successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getAllOrders = asyncHandler(async (req, res) => {
    try {
        const userId =  req.userId
        const orders = await Order.find({userId});
        response.successResponse(res, orders, "Orders fetched successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});


module.exports.getSingleOrder = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) {
            return response.validationError(res, "Order not found");
        }

        response.successResponse(res, order, "Order fetched successfully");
    } catch (error) {
        response.internalServerError(res, error.message);
    }
});

