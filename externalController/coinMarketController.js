const axios = require("axios");
const asyncHandler = require("express-async-handler");
const response = require("../middleware/responseMiddlewares")

module.exports.getCoinData = asyncHandler(async (req, res) => {
    const { start = 1, limit = 100, sort = "market_cap", sort_dir = "desc", cryptocurrency_type = "coins", convert = "USD" } = req.query;

    try {
        const data = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
            params: {
                start,
                limit,
                sort,
                sort_dir,
                cryptocurrency_type,
                convert
            },
            headers: {
                'X-CMC_PRO_API_KEY': 'ef723533-40ed-4e83-b820-b26f6b3e65f1'
            }
        });

        response.successResponse(res, data.data, "All Data here.")
    } catch (error) {
        response.internalServerError(res, error.message)
        // res.status(500).json({ message: error.message });
    }
});
