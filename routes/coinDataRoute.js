const router = require("express").Router()
const coinmarket = require("../externalController/coinMarketController")

router.get("/coin", coinmarket.getCoinData)

module.exports= router;