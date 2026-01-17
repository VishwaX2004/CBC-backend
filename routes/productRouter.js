import express from 'express';
import { createProduct, deleteProduct, getProductId, getProducts, getProductsBySearch, updateProduct } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.get("/",getProducts)
productRouter.post("/", createProduct)
productRouter.delete("/:productID", deleteProduct);
productRouter.get("/search", getProductsBySearch)
productRouter.get("/:productID", getProductId)
productRouter.put("/:productID",updateProduct)



export default productRouter; 