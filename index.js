import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";
import Contactrouter from "./routes/contactRouter.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ================= JWT MIDDLEWARE =================
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return next();

  const token = auth.split(" ")[1];
  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected"))
  .catch(err => console.error(err));

// ================= ROUTES =================
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/contact", Contactrouter);

// ================= SERVER =================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
