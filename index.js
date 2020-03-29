// index.js for SGFX
// Written by Francis Nai
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
sgfx.use(express.static(path.join(__dirname, "public")));

/**
 * Routes Definitions
 */
sgfx.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

sgfx.post("/user", (req, res) => {
  res.render("user", {
    title: "Profile",
    userProfile: { nickname: "Francis Nai" }
  });
});

sgfx.get("/logout", (req, res) => {
  res.render("index", { title: "Home" });
});

/**
 * Server Activation
 */
sgfx.listen(port, () => {
  console.log("Server running at http://localhost:%d", port);
});
