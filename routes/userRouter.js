import express from 'express';
import { createUser, GetUsers, GoogLogin, loginUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
userRouter.get("/me",GetUsers)
userRouter.post("/google-login",GoogLogin)

export default userRouter;