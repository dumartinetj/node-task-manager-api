const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;

app
  .use(express.json())
  .use(userRouter)
  .use(taskRouter);

app.listen(port, () => {
  console.log("Express server launched on port " + port);
});
