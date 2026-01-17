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

// GET product by productID
productRouter.get("/:productID", getProductId);

// SEARCH products
productRouter.get("/search", getProductsBySearch);

// UPDATE product
productRouter.put("/:productID", updateProduct);

export default productRouter;
