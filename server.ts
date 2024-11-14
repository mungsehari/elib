import app from "./src/app";
import { config } from "./src/config/config";
const startServer = () => {
  console.log("PORT: ", config.port);
  const port = config.port;
  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
};

startServer();
