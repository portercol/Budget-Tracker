// Require npm packages
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

// Require dotenv package to use environment variables
require('dotenv').config();

// Create PORT to run on whatever is available OR PORT 3000
const PORT = process.env.PORT || 3000;

// Create express server
const app = express();

// Use logger middleware
app.use(logger("dev"));

// Parse request body as JSON
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static content for the app
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/budget", {
  useNewUrlParser: true,
  useFindAndModify: false
});

// Use routes being brought in
app.use(require("./routes/api.js"));

// Create server listener on PORT
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});