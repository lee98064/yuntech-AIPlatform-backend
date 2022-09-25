const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authController = require("./controllers/authController.js");
const postController = require("./controllers/postController.js");
const signUpController = require("./controllers/signUpController.js");
const authentication = require("./middlewares/authentication");

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("What are you doing?");
});

app.use("/api", authController);
app.use("/api", postController);
app.use("/api", authentication, signUpController);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
