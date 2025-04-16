const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/Item/ItemController');
const CategoryController = require('../controllers/Category/CategoryController');
const ListController = require('../controllers/List/ListController');


router.post("/add", ItemController.addToWishlist);
router.put("/addCart", ItemController.addToCart);
router.delete("/remove", ItemController.removeItem);

router.get("/categories", CategoryController.listAll);
router.get('/categories/:name', CategoryController.categoryInformations);

router.get("/total", ListController.totalPrice);
router.get("/finalized", ListController.finalize);
router.get("/report", ListController.generateReport);

module.exports = router;