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

// admin
const adminAuthController = require("./controllers/admin/authController");
const adminVerifyController = require("./controllers/admin/verifyController");
const adminGroupController = require("./controllers/admin/groupController");
const adminStudentController = require("./controllers/admin/studentController");
const adminPostController = require("./controllers/admin/postController");
const adminExportController = require("./controllers/admin/exportController");
const adminAuthentication = require("./middlewares/adminAuthentication");

dotenv.config();

const app = express();
const port = process.env.PORT;
const MongoClient = require("mongodb").MongoClient;

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({ createParentPath: true }));

app.get("/", (req, res) => {
  res.send("What are you doing?");
});

// admin
app.use("/api/admin", adminAuthController);
app.use("/api/admin", adminAuthentication, adminVerifyController);
app.use("/api/admin", adminAuthentication, adminGroupController);
app.use("/api/admin", adminAuthentication, adminStudentController);
app.use("/api/admin", adminAuthentication, adminPostController);
app.use("/api/admin", adminAuthentication, adminExportController);

app.use("/api", authController);
app.use("/api", postController);
app.use("/api", authentication, userController);
app.use("/api", authentication, signUpController);


MongoClient.connect(process.env.MONGODB_CONNECT_STRING, (err, client) => {
  if (err) return console.log(err);
  mgdb = client.db(process.env.MONGODB_DB);
  app.listen(port, () => {
    console.log(`??????[server]: Server is running at http://localhost:${port}`);
  });
});

