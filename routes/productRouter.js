import express from 'express';
import {
    createProduct,
    deleteProduct,
    getProductId,
    getProducts,
    getProductsBySearch,
    updateProduct
} from '../controllers/productController.js';

const productRouter = express.Router();

// GET all products
productRouter.get("/", getProducts);

// CREATE product
productRouter.post("/", createProduct);

// DELETE product
productRouter.delete("/:productID", deleteProduct);

// SEARCH products
productRouter.get("/search", getProductsBySearch);

// GET product by productID
productRouter.get("/:productID", getProductId);

// UPDATE product
productRouter.put("/:productID", updateProduct);

export default productRouter;
