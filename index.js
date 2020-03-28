
// index.js for SGFX
// Written by Francis Nai (francisnai@gmail.com)
// Date: 28 March 2020

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");


/**
 * App Variables
 */
const sgfx = express();
const port = process.env.PORT || 1337;


/**
 *  App Configuration
 */
sgfx.set("views", path.join(__dirname, "views"));
sgfx.set("view engine", "pug");

/**
 * Routes Definitions
 */
sgfx.get("/", (req, res) => {
  res.status(200).send("SGFX: Singapore Forex Xchange");
});

app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

/**
 * Server Activation
 */
sgfx.listen(port, () => {
 console.log("Server running at http://localhost:%d", port);
});