import express from "express";
import { createUser } from "./userController";

const userRouter = express.Router();

// Routes
userRouter.get("/register", createUser);

export default userRouter;
