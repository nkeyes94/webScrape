// * Requiring the modules we'll need
var cheerio = require("cheerio")(app);
var axios = require("axios");
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var fs = require("fs");

// * Express config
var app = express();
var PORT = process.env.PORT || 8080;

// * Handlebars config
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// * Middleware config
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// * Getting date/time for logging
var today = new Date();
var date = today.getMonth() + "-" + today.getDate() + "-" + today.getFullYear();
var time = today.getHours() + ":" + today.getMinutes()+ ":" + today.getSeconds();

// * Requiring the router
const routes = require("./routes/routes.js")(app);

app.listen(PORT, function(){
    console.log("Application listening on localhost:"+ PORT);
    fs.writeFile("./logs/serverLog.txt", "Server successfully started on "+ date + " at " + time, function(err){
        if(err) throw err;
    })
})