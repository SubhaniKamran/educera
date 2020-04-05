const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const error = require("./middleware/error");

//Load env var
dotenv.config({ path: "./config/config.env" });

//connect database
connectDB();
//routes
const bootcamp = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const review = require("./routes/review");
const user = require("./routes/user");

const app = express();
app.use(express.json());

//sanitize data
app.use(mongoSanitize());
//set security headers
app.use(helmet());
//prevent xss atacks
app.use(xss());
//limit the rate
const limit = rateLimit({
  windowMs: 10 * 60 * 1000, //10 min
  max: 50
});
app.use(limit);
//prevent http param polution
app.use(hpp());

app.use(cookieParser());
app.use(fileupload());
app.use(express.static(path.join(__dirname, "public")));
//mount routes
app.use("/api/v1/bootcamps", bootcamp);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/reviews", review);
app.use("/api/v1/admin/user", user);
app.use(error);
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

//handle unhandled promis rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error ${err.messege}`);
  //close server and exit process
  server.close(() => process.exit(1));
});
