const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/Item/ItemController');

router.post("/add", ItemController.addToWishlist);
router.put("/addCart", ItemController.addToCart);

module.exports = router;