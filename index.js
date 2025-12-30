import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";
import productRouter from "./routes/productRouter.js";
import cors from "cors";
import dotenv from "dotenv";



const app = express()

dotenv.config()
app.use(express.json())

app.use(cors())

app.use(
    (req,res,next)=>{

        let token = req.header("Authorization")

        if(token != null){
            token = token.replace("Bearer ","")
            jwt.verify(token,"jwt-secret",
                (err, decoded)=>{
                    if(decoded == null){
                        res.json({
                            message: "Invalid token please login again"
                        })
                        return
                    }else{
                        req.user = decoded
                    }
                }
            )

        }
        next()
    }
)

const connectionString = process.env.MONGO_URI


mongoose.connect(connectionString).then(
    ()=>{
        console.log("Database connected")
    }
).catch(
    ()=>{
        console.log("Database connection failed")
    }
)




app.use("/users",userRouter)
app.use("/products", productRouter)


app.listen(5000, 
    ()=>{
        console.log("Server is running on port 5000")
    }
)