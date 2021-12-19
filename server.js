const express = require("express");
const errorHandler = require("./middleware/error");
const xss = require("xss-clean");
const dotenv = require("dotenv");
const cors = require("cors");
const hpp = require("hpp");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const path = require("path");

// load env variables

dotenv.config({ path: "./config/config.env" });

require("colors");

// route files
const weather = require("./api/weather");
const app = express();
// Body Parser

app.use(express.json());
// xss-clean

app.use(xss());
// Rate Limit

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 10000, // limit each IP to 1000 requests per windowMs
});
app.use(limiter);
// hpp

app.use(hpp());
// cors

app.use(cors());

app.options("*", cors());

// file Upload
app.use(fileUpload());
// set static folder
const options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html"],
  maxAge: "1d",
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set("x-timestamp", Date.now());
  },
};
app.use(express.static(path.join(__dirname, "./public"), options));

// Use Routes
app.use("/api/v1/weather", weather);

app.use(errorHandler);
const PORT = process.env.PORT || 5000;
if (process.argv.includes("worker")) {
  const { worker } = require("./util/worker");
  console.log("Worker is running...".green.bold);
  worker.on("completed", (job) => {
    console.log(`${job.id} has completed!`);
  });

  worker.on("failed", (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
  });
} else {
  app.listen(PORT, console.log(`Server running on port ${PORT}`.yellow.bold));
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

module.exports = app;
