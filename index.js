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
 * Function for inserting log
 */
async function logIP() {
  // get ip details
  try {
    const response = await axios.get("http://ip-api.com/json");
    const data = await response.data;
    if (data) {
      // insert record into logs collection
      const timestampNow = new Date().getTime();
      const logObj = {
        ipAddress: data.query,
        country: data.country,
        countryCode: data.countryCode,
        lat: data.lat,
        lon: data.lon,
        isp: data.isp,
        timestamp: timestampNow
      };
      insertOneDBCollection("logs", logObj)
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Function for dropping DB collection by name
 */
async function dropDBCollection(collectionName) {
  const client = await MongoClient.connect(dbURL, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    return;
  }

  try {
    // create collection
    let dbo = client.db(dbName);
    let res = await dbo.collection(collectionName).drop();
    // console.log(res);
  } catch (err) {
    // console.log(err);
  } finally {
    client.close();
  }
}

/**
 * Function for creating DB collection by name
 */
async function createDBCollection(collectionName) {
  const client = await MongoClient.connect(dbURL, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    return;
  }

  try {
    // drop collection
    let dbo = client.db(dbName);
    let res = await dbo.createCollection(collectionName);
    // console.log(res);
  } catch (err) {
    // console.log(err);
  } finally {
    client.close();
  }
}

/**
 * Function for inserting 1 DB collection record
 */
async function insertOneDBCollection(collectionName, jsonObj) {
  const client = await MongoClient.connect(dbURL, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    return;
  }

  try {
    // drop users collection if exist
    let dbo = client.db(dbName);
    let res = await dbo.collection(collectionName).insertOne(jsonObj);
    // console.log(res);
  } catch (err) {
    // console.log(err);
  } finally {
    client.close();
  }
}

/**
 * Function for inserting many DB collection records
 */
async function insertManyDBCollection(collectionName, jsonArr) {
  const client = await MongoClient.connect(dbURL, { useNewUrlParser: true }).catch(err => { console.log(err); });
  if (!client) {
    return;
  }

  try {
    // drop users collection if exist
    let dbo = client.db(dbName);
    let res = await dbo.collection(collectionName).insertMany(jsonArr);
    // console.log(res);
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}

/**
 * API for setting up database
 */
sgfx.get("/api/setup_db", (req, res) => {
  // db will be auto created if it's not exist

  // drop collection if exist
  dropDBCollection("users");
  dropDBCollection("logs");

  // create collection
  createDBCollection("users");
  createDBCollection("logs");

  // insert record into users collection
  const usersJson = [
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
  insertManyDBCollection("users", usersJson);
  
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
