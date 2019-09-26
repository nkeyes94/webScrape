var axios = require("axios");
var cheerio = require("cheerio");

// * Exporting the router
module.exports = function(app){
    
    // * First route for the home page
    app.get("/", function(req, res){               // ? When the route is hit...
        console.log("Hit the home page");          // ? Console log that the route was hit (for verification)
        res.render("home");                        // ? Render the handlebars page
    });

    // * Scrape
    app.get("/scrape", function(req, res){
        axios.get("https://old.reddit.com/r/news").then(function(response){
            var $ = cheerio.load(response.data);
            var results = [];
            $("p.title").each(function(i, element){
                var title = $(element).text();
                var link = $(element).children().attr("href");

                results.push({
                    title,
                    link
                });
            });
            console.log(results);
        })
    })

}; 