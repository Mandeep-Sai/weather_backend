const express = require("express");
const userRoutes = require("./users");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const mongoose = require("mongoose");
dotenv.config();

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
const server = express();
server.use(cookieParser());
server.use(cors(corsOptions));
// server.use()
server.use(express.json());
server.use("/users", userRoutes);
// server.use("/reviews")

mongoose
  .connect("mongodb://localhost:27017/weather", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(3002, () => {
      console.log("Running on 3002");
    })
  );
