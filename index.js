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
 * DB Variables
 */
const MongoClient = require('mongodb').MongoClient;
const dbURL = "mongodb://localhost:27017/"
const dbName = "sgfxdb"

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
  // find user
  MongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
      console.error('An error occurred connecting to MongoDB: ', err);
    } else {
      var dbo = client.db(dbName);
      console.log("database connected!");
      // query users collection
      var query = { email: "francis.nai@sgfx.com" };
      dbo.collection("users").find(query).toArray(function(err, result) {
        if (err) throw err;
        // render to page
        res.render("user", {
          title: "Profile",
          userProfile: result
        });
        // close db
        client.close();
      });
    }
  });
});

sgfx.get("/setup_db", (req, res) => {
  // create db if it's not already created
  MongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) throw err;
    console.log("Database created!");
    
    let dbo = client.db(dbName);
    // drop collection if exist
    dbo.collection("users").drop(function(err, res) {
      if (err) throw err;
      if (res) console.log("Collection deleted!");
      // create collection
      dbo.createCollection("users", function(err, res) {
        if (err) throw err;
        if (res) console.log("Collection created!");
      });
    });

    const usersObj = [
      { userId: 1, firstName: 'Francis', lastName: 'Nai', email: 'francis.nai@sgfx.com' },
      { userId: 2, firstName: 'Joni', lastName: 'Liu', email: 'joni.liu@sgfx.com' }
    ];
    // insert data into user collection
    dbo.collection("users").insertMany(usersObj, function(err, res) {
      if (err) throw err;
      // close db
      client.close();
    });
  });

  // redirect to index page
  res.redirect('/');
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
