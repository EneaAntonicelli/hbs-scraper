var express = require("express");
var app = express();
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var routes = require("./routing/routes.js");
var PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use("/", routes);
app.use("/scrape", routes);
app.use("/articles", routes);
app.use("/articles/:id", routes);
app.use("/save", routes);
app.use("/unsave", routes);
app.use("/saved", routes);
app.use("/add-comment/:id", routes);
app.use("/remove-comment/:id", routes);

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongo-scraper";
mongoose.connect(MONGODB_URI);

app.listen(PORT, function() {
  console.log("Server listening on port:" + PORT);
});
