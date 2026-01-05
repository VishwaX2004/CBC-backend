import Order from "../models/order.js";
import Product from "../models/product.js";

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

        let cusname = req.body.customerName;

        if (cusname == null) {
            cusname = user.firstName + " " + user.lastName;
        }

        let phoneNum = req.body.phone;

        if (phoneNum == null) {
            phoneNum = "Not Provided";
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
            customerName: cusname,
            email: user.email,
            phone: phoneNum,
            address: req.body.address,
            total: total,
            status: "Pending"
        });

        const savedOrder = await newOrder.save();

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
