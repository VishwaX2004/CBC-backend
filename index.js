import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";
import productRouter from "./routes/productRouter.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

/* ✅ FIXED AUTH MIDDLEWARE */
app.use((req, res, next) => {
    let token = req.header("Authorization");

    if (!token) {
        next(); // public route
        return;
    }

    token = token.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || !decoded) {
            return res.status(401).json({
                message: "Invalid token please login again",
            });
        }

        req.user = decoded;
        next(); // ✅ only called once
    });
});

/* DATABASE */
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Database connected"))
    .catch(() => console.log("Database connection failed"));

/* ROUTES */
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);

/* SERVER */
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
