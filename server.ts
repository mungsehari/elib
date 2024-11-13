import app from "./src/app";
const startServer = () => {
  const post = process.env.PORT || 3000;
  app.listen(post, () => {
    console.log(`server is running on port ${post}`);
  });
};

startServer();
