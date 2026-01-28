import express from 'express';
import { CancelOrder, createOrder, GetOrders, UpdateOrderStatus } from '../controllers/orderController.js';


const orderRouter = express.Router()

orderRouter.post("/",createOrder)

orderRouter.get("/",GetOrders)

orderRouter.put("/status/:orderID",UpdateOrderStatus)

orderRouter.delete("/:orderID",CancelOrder)

export default orderRouter;