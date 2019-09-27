// * Requiring the modules we'll need
var cheerio = require("cheerio");
var axios = require("axios");
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var fs = require("fs");

mongoose.Promise = Promise;
var db = mongoose.connection;

// * Express config
var app = express();
var PORT = process.env.PORT || 8080;

// * Handlebars config
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// * Mongo config
var MONGODB_URI = process.env.MONGODB_URI || "Database: heroku_r9x7k2hr";

// * Connect to the db
mongoose.connect(MONGODB_URI, function(err, res){
    if(err){
        console.log("Failed to start the database");
        console.log("On:")
        console.log(date);
        console.log("At:")
        console.log(time)
        console.error(err);
        fs.writeFile("./logs/dbLog", "Database failed to start on "+ date +" at "+ time, function(err){
            if(err) throw err;
        })
    }
    // * Update log with a success message if connected
    fs.writeFile("./logs/dbLog", "Database successfully started on "+ date +" at "+ time, function(err){
        if(err) throw err;
    })

    app.get("/scrape", function(req, res){
        axios.get("https://old.reddit.com/r/news").then(function(response){
            var $ = cheerio.load(response.data);
            var result = {};
            $("p.title").each(function(i, element){
                result.title = $(this)
                    .children("a")
                    .text()
                result.link = $(this)
                    .children("a")
                    .attr("href");
                console.log("db res: "+ result);
                db.Article.create(result)
                    .then(function(dbArticle){
                        console.log(dbArticle);
                    })
                    .catch(function(err){
                        console.log(err);
                    })
            });
            
        })
    })

    app.get("/scrape", function(req, res){
        db.Article.find({})
            .then(function(dbArticle){
                res.json(dbArticle);
            })
            .catch(function(err){
                res.json(err);
            })
    })
    
    // Route for getting all Articles from the db
    app.get("/articles", function(req, res) {
        // Grab every document in the Articles collection
        db.Article.find({})
        .then(function(dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
    });

    app.get("/articles/:id", function(req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
          // ..and populate all of the notes associated with it
          .populate("note")
          .then(function(dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
          });
      });

      // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function(req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
        .then(function(dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function(dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
  });
});

// * Middleware config
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// * Getting date/time for logging
var today = new Date();
var date = today.getMonth() + "-" + today.getDate() + "-" + today.getFullYear();
var time = today.getHours() + ":" + today.getMinutes()+ ":" + today.getSeconds();

app.listen(PORT, function(){
    console.log("Application listening on localhost:"+ PORT);
    fs.writeFile("./logs/serverLog.txt", "Server successfully started on "+ date + " at " + time, function(err){
        if(err) throw err;
    })
});