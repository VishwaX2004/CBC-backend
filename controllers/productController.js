import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

/* =========================
   CREATE PRODUCT
========================= */
export async function createProduct(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized to create a product"
        });
    }

    try {
        const productData = req.body;

        const product = new Product(productData);
        await product.save();

        res.json({
            message: "Product created successfully",
            product
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to create product"
        });
    }
}

/* =========================
   GET ALL PRODUCTS
========================= */
export async function getProducts(req, res) {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to retrieve products"
        });
    }
}

/* =========================
   DELETE PRODUCT
========================= */
export async function deleteProduct(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized to delete a product"
        });
    }

    try {
        const productID = req.params.productID;

        // Use _id if you are using Mongo default ObjectId
        const result = await Product.deleteOne({ productID : productID });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to delete product"
        });
    }
}

/* =========================
   UPDATE PRODUCT
========================= */
export async function updateProduct(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized to update a product"
        });
    }

    try {
        const productID = req.params.productID;
        const updatedData = req.body;

        const result = await Product.updateOne({ _id: productID }, updatedData);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to update product"
        });
    }
}

// GET PRODUCT BY productID
export async function getProductId(req, res) {
  try {
    const { productID } = req.params;
    const product = await Product.findOne({ productID }); // find by productID string

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve product by ID" });
  }
}


/* =========================
   SEARCH PRODUCTS
========================= */
export async function getProductsBySearch(req, res) {
    try {
        const query = req.query.query || "";

        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { altNames: { $regex: query, $options: "i" } }
            ]
        });

        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to search products"
        });
    }
}
