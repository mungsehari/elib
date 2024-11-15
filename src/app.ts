import express from "express";
import golbalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();
app.get("/", (req, res, next) => {
  res.json({ message: "welcome to elib apis" });
  next();
});

// Global Error Handler
app.use(golbalErrorHandler);
export default app;
