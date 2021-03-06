"use strict";


require('dotenv').config();

const PORT          = process.env.PORT || 8080;
const ENV           = process.env.ENV || "development";
const express       = require("express");
const bodyParser    = require("body-parser");
const sass          = require("node-sass-middleware");
const app           = express();

const knexConfig    = require("./knexfile");
const knex          = require("knex")(knexConfig[ENV]);
const morgan        = require('morgan');
const knexLogger    = require('knex-logger');
const cookieSession = require('cookie-session');

// Query functions object with knex injection
const db = require('./db/queries')(knex);


// Seperated Routes for each Resource
const resources = require("./routes/resources")
const login = require("./routes/login")
const logout = require("./routes/logout")
const register = require("./routes/register")
const users = require("./routes/users")


// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
// The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));

// Factoring commonalities
app.use("/*", (req, res, next) => {
  req.user = req.session.user;
  req.templateVars = {user: req.user};
  next()
})

app.use(express.static("public"));

// Mount all resource routes
app.use("/resources", resources(db));
app.use("/login", login(db));
app.use("/logout", logout(knex));
app.use("/register", register(knex));
app.use("/users", users(knex));


// Home page
app.get("/", (req, res) => {
      console.log('req.templateVars', req.templateVars);

  if (req.session.error_message) {

    req.templateVars.error_message = req.session.error_message;
    console.log('error:', req.session.error_message);

    req.session.error_message = null;
  } else {

    req.templateVars.error_message = '';

  }

    db.getAllResources(function(resources) {
      req.templateVars.resources = resources;
      res.render("index", req.templateVars);
    });
});


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
