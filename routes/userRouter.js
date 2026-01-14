import express from 'express';
import { BlockOrUnblockUser, ChangePasswordViaOTP, createUser, GetallUsers, GetUsers, GoogLogin, loginUser, SendOTP } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
userRouter.get("/me",GetUsers)
userRouter.post("/google-login",GoogLogin)
userRouter.get("/all-users",GetallUsers)
userRouter.put("/block/:email",BlockOrUnblockUser)
userRouter.get("/send-otp/:email", SendOTP);
userRouter.post("/reset-password", ChangePasswordViaOTP);


export default userRouter;