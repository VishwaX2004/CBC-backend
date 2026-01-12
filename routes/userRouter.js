import express from 'express';
import { createUser, GetUsers, loginUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
userRouter.get("/me",GetUsers)

export default userRouter;