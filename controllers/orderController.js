import Order from "../models/order.js";

export async function createOrder(req, res) {

    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized User"
        });
    }

    try {
        let newOrderID = "CBC0000001";

        // Get last order to generate new ID
        const orderList = await Order.find().sort({ date: -1 }).limit(1);

        if (orderList.length !== 0) {
            let lastOrderID = orderList[0].orderID;
            let lastOrderNumber = parseInt(lastOrderID.replace("CBC", ""));
            let newOrderNumber = lastOrderNumber + 1;
            newOrderID = "CBC" + newOrderNumber.toString().padStart(7, "0");
        }

        const newOrder = new Order({
            orderID: newOrderID,
            items: [], // You can later populate items from req.body
            customerName: req.body.customerName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            total: req.body.total,
            status: "Pending"
        });

        const savedOrder = await newOrder.save();

        res.status(201).json({
            message: "Order created successfully",
            order: savedOrder
        });

    } catch (err) {
        console.error(err); // log the real error
        res.status(500).json({
            message: "Server Error"
        });
    }
}
