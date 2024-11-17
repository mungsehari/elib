import express from "express";
import golbalErrorHandler from "./middlewares/globalErrorHandler";
import cors from "cors";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import { config } from "./config/config";

const app = express();
app.use(
  cors({
    origin: config.frontendDomin,
  })
);
app.use(express.json());
app.get("/", (req, res, next) => {
  res.json({ message: "welcome to elib apis" });
  next();
});
// Routes
app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

// Global Error Handler
app.use(golbalErrorHandler);
export default app;
