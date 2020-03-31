// index.js for SGFX
// Written by Francis Nai, Joni Liu
// Date: 28 March 2020

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const axios = require("axios");
// MongoDB variables
const MongoClient = require("mongodb").MongoClient;
const dbURL = "mongodb://localhost:27017/";
const dbName = "sgfxdb";

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
 * Access index page
 */
sgfx.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

/**
 * Access user profile page
 */
sgfx.get("/user", (req, res) => {
  // find user
  MongoClient.connect(
    dbURL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        console.error("An error occurred connecting to MongoDB: ", err);
      } else {
        var dbo = client.db(dbName);
        console.log("database connected!");
        // query users collection
        var query = { email: "francis.nai@sgfx.com" };
        dbo
          .collection("users")
          .find(query)
          .toArray(function(err, result) {
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
    }
  );
});

/**
 * Audit logs page
 */
sgfx.get("/logs", (req, res) => {
  // find user
  MongoClient.connect(
    dbURL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        console.error("An error occurred connecting to MongoDB: ", err);
      } else {
        var dbo = client.db(dbName);
        console.log("database connected!");
        dbo
          .collection("logs")
          .find({})
          .toArray(function(err, result) {
            if (err) throw err;
            // render to page
            console.log(result)
            res.render("logs", {
              title: "Audit Logs",
              logs: result
            });
            // close db
            client.close();
          });
      }
    }
  );
});

/**
 * API for inserting log
 */
sgfx.post("/login", (req, res) => {
  // TODO: validate auth here

  // log user ip details
  logIP();

  // redirect to user page
  res.redirect("/user");
});


/**
 * API for inserting log
 */
function logIP() {
  // get ip details
  axios.get('http://ip-api.com/json')
    .then(function (response) {
      MongoClient.connect(
        dbURL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
          if (err) {
            console.error("An error occurred connecting to MongoDB: ", err);
          } else {
            var dbo = client.db(dbName);
            console.log("database connected!");
            // insert log
            const timestamp = new Date().getTime();
            const logObj = {
              ipAddress: response.data.query,
              country: response.data.country,
              countryCode: response.data.countryCode,
              lat: response.data.lat,
              lon: response.data.lon,
              isp: response.data.isp,
              timestamp: timestamp
            };
            dbo.collection("logs").insertOne(logObj, function(err, res) {
              if (err) throw err;
              console.log("Log inserted");
              // close db
              client.close();
            });
          }
        }
      );
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // always executed
    });
}

/**
 * API for setting up database
 */
sgfx.get("/api/setup_db", (req, res) => {
  // create db if it's not already created
  MongoClient.connect(
    dbURL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        console.error("An error occurred connecting to MongoDB: ", err);
      } else {
        console.log("Database created!");

        let dbo = client.db(dbName);
        // drop users collection if exist
        dbo.collection("users").drop(function(err, res) {
          if (err) throw err;
          if (res) console.log("User collection deleted!");
          // create users collection
          dbo.createCollection("users", function(err, res) {
            if (err) throw err;
            if (res) console.log("Users collection created!");
          });
        });

        // drop logs collection if exist
        dbo.collection("logs").drop(function(err, res) {
          if (err) throw err;
          if (res) console.log("Logs collection deleted!");
          // create logs collection
          dbo.createCollection("logs", function(err, res) {
            if (err) throw err;
            if (res) console.log("Logs collection created!");
          });
        });

        // insert data into users collection
        const usersObj = [
          {
            userId: 1,
            firstName: "Francis",
            lastName: "Nai",
            email: "francis.nai@sgfx.com"
          },
          {
            userId: 2,
            firstName: "Joni",
            lastName: "Liu",
            email: "joni.liu@sgfx.com"
          }
        ];
        dbo.collection("users").insertMany(usersObj, function(err, res) {
          if (err) throw err;
          // close db
          client.close();
        });
      }
    }
  );

  // redirect to index page
  res.redirect("/");
});

/**
 * Logout
 */
sgfx.get("/logout", (req, res) => {
  res.render("index", { title: "Home" });
});

/**
 * Server Activation
 */
sgfx.listen(port, () => {
  console.log("Server running at http://localhost:%d", port);
});
