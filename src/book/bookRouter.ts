import path from "node:path";
import express, { NextFunction, Request, Response } from "express";
import {
  createBook,
  deleteBook,
  getSingleBook,
  listBooks,
  updateBook,
} from "./bookController";
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

bookRouter.patch(
  "/:bookId",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);

bookRouter.get("/", listBooks);
bookRouter.get("/:bookId", getSingleBook);
bookRouter.delete(
  "/:bookId",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteBook(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default bookRouter;
