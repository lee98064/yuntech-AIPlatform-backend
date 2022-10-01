const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const authController = require("./controllers/authController.js");
const postController = require("./controllers/postController.js");
const userController = require("./controllers/userController.js");
const signUpController = require("./controllers/signUpController.js");
const authentication = require("./middlewares/authentication");

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({ createParentPath: true }));

app.get("/", (req, res) => {
  res.send("What are you doing?");
});

app.use("/api", authController);
app.use("/api", postController);
app.use("/api", authentication, userController);
app.use("/api", authentication, signUpController);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
