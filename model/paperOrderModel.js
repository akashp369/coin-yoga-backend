const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Order schema
const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderType: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    cryptoSymbol: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'canceled', "cancelled"],
        default: 'pending'
    },
}, {
    timestamps: true
});



// Create the Order model
const Order = mongoose.model('PaperOrder', orderSchema);

module.exports = Order;
