import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin, isCustomer } from "./userController.js";

export async function createOrder(req, res) {

    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized User"
        });
    }

    try {
        const user = req.user;

        if (user == null) {
            return res.status(401).json({
                message: "Unauthorized User"
            });
        }

        let newOrderID = "CBC0000001";

        // Get last order to generate new ID
        const orderList = await Order.find().sort({ date: -1 }).limit(1);

        if (orderList.length !== 0) {
            let lastOrderID = orderList[0].orderID;
            let lastOrderNumber = parseInt(lastOrderID.replace("CBC", ""));
            let newOrderNumber = lastOrderNumber + 1;
            newOrderID = "CBC" + newOrderNumber.toString().padStart(7, "0");
        }

        let customerName = req.body.customerName;

        if (customerName == null) {
            customerName = user.firstName + " " + user.lastName;
        }

        let phone = req.body.phone;

        if (phone == null) {
            phone = "Not Provided";
        }

        const itemsInRequest = req.body.items;

        if (itemsInRequest == null) {
            return res.status(400).json({
                message: "Items are Required to place Order"
            });
        }

        if (!Array.isArray(itemsInRequest)) {
            return res.status(400).json({
                message: "Items should be an Array"
            });
        }

        const itemtobeAdded = [];
        let total = 0;

        for (let i = 0; i < itemsInRequest.length; i++) {
            const item = itemsInRequest[i];

            const product = await Product.findOne({ productID: item.productID });

            if (product == null) {
                return res.status(400).json({
                    code: "not found",
                    message: "Product with ID " + item.productID + " not found",
                    productID: item.productID
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    code: "stock",
                    message: "Insufficient stock for product with ID " + item.productID,
                    productID: item.productID,
                    availableStock: product.stock
                });
            }

            itemtobeAdded.push({
                productID: product.productID,
                quantity: item.quantity,
                name: product.name,
                price: product.price,
                image: product.images[0]
            });

            total += product.price * item.quantity;
        }

        const newOrder = new Order({
            orderID: newOrderID,
            items: itemtobeAdded,
            customerName:customerName,
            email: user.email,
            phone: phone,
            address: req.body.address,
            total: total,
            status: "Pending"
        });

        const savedOrder = await newOrder.save();

        for (let i = 0; i < itemtobeAdded; i++) {
            const item = itemtobeAdded[i]

            await Product.updateOne(
                { productID: item.productID },
                { $inc: { stock: -item.quantity } }
            )
        }

        res.status(201).json({
            message: "Order created successfully",
            order: savedOrder
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

export async function GetOrders(req, res) {

    if (isAdmin(req)) {
        const orders = await Order.find().sort({ date: -1 })
        res.json(orders)

    } else if (isCustomer(req)) {
        const user = req.user
        const orders = await Order.find({ email: user.email }).sort({ date: -1 })
        res.json(orders)

    } else {
        return res.status(401).json(
            {
                message: "Unauthorized User"
            }
        )
    }

}


export async function UpdateOrderStatus(req,res) {

    if(!isAdmin(req)){
         res.status(403).json(
            {
                message: "You are not Authorized to change Status"
            }
        )
        return
    }

    const orderID = req.params.orderID
    const newstatus = req.body.status

    try{
        
    await Order.updateOne(
        {orderID : orderID},
        {status : newstatus}
    )

    res.json({
        message : "Order Status Updated Successfully"
    })


    }catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to update Status"
        })
        return
    }
    
}