import express from 'express';
import { BlockOrUnblockUser, changePassword, ChangePasswordViaOTP, createUser, GetallUsers, GetUsers, GoogLogin, loginUser, SendOTP, updateUserData } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
userRouter.get("/me",GetUsers)
userRouter.post("/google-login",GoogLogin)
userRouter.get("/all-users",GetallUsers)
userRouter.put("/block/:email",BlockOrUnblockUser)
userRouter.get("/send-otp/:email", SendOTP);
userRouter.post("/reset-password", ChangePasswordViaOTP);
userRouter.put("/me",updateUserData)
userRouter.put("/me/password",changePassword)


export default userRouter;