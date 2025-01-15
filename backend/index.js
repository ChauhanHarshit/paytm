const express = require("express");
const rootRouter = require("./routes/index.js");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/v1" , rootRouter);

console.log("The server is listening on port 3000");
app.listen(3000);
