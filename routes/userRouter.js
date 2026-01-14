import express from 'express';
import { BlockOrUnblockUser, createUser, GetallUsers, GetUsers, GoogLogin, loginUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
userRouter.get("/me",GetUsers)
userRouter.post("/google-login",GoogLogin)
userRouter.get("/all-users",GetallUsers)
userRouter.put("/block/:email",BlockOrUnblockUser)

export default userRouter;