import express from "express";
import golbalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();
app.get("/", (req, res, next) => {
  res.json({ message: "welcome to elib apis" });
  next();
});
// Routes
app.use("/api/users", userRouter);

// Global Error Handler
app.use(golbalErrorHandler);
export default app;
