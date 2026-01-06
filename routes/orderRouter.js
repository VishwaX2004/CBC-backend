import express from 'express';
import { createOrder, GetOrders, UpdateOrderStatus } from '../controllers/orderController.js';

const orderRouter = express.Router()

orderRouter.post("/",createOrder)

orderRouter.get("/",GetOrders)

orderRouter.put("/status/:orderID",UpdateOrderStatus)

export default orderRouter;