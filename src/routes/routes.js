const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/Item/ItemController');
const CategoryController = require('../controllers/Category/CategoryController');


router.post("/add", ItemController.addToWishlist);
router.put("/addCart", ItemController.addToCart);
router.delete("/remove", ItemController.removeItem);

router.get("/categories", CategoryController.listAll);
router.get('/categories/:name', CategoryController.categoryInformations);

module.exports = router;