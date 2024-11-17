import path from "node:path";
import express from "express";
import { createBook } from "./bookController";
import multer from "multer";
import authenticate from "../middlewares/authenticate";

const bookRouter = express.Router();

//file store local
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: {
    fileSize: 3e7,
  },
});

// Routes
bookRouter.post(
  "/",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

export default bookRouter;
