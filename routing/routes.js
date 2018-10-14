var express = require('express');
var router = express.Router();
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");
var fs = require("fs");

router.get("/scrape", function (req, res) {

    axios.get("https://www.breitbart.com/big-government/").then(function (response) {

        fs.writeFile("output.html", response.data, function (err) { console.log(err) });

        var $ = cheerio.load(response.data);

        $(".article-list article").each(function (i, element) {

            var result = {};

            result.title = $(this)
                .children("a")
                .attr("title");

            result.link = $(this)
                .children("a")
                .attr("href");

            result.summary = $(this)
                .children("div")
                .children("div")
                .children("p")
                .text();

            result.img = $(this)
                .children("a")
                .children("img")
                .attr("src");

            result.author = $(this)
                .children("div")
                .children("footer")
                .children("address")
                .attr("data-aname");

            // console.log(result);
            // return;

            db.Article.insertMany(result)

                .then(function (dbArticle) {

                    console.log(dbArticle);
                })
                .catch(function (err) {

                    return res.json(err);
                });
        });

        res.send("Scrape Complete");

    });

});

router.get("/", function (req, res) {
    db.Article.find({})
        .then(function (article) {
            res.render("index", {
                title: "Home",
                Article: article
            })
        
    });
});

router.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.get("/articles/:id", function(req, res) {
    db.Article.findOne({ "_id": req.params.id })
    .populate("comment")
    .exec(function(err, res) {
      if (err) {
        console.log(err);
      }
      else {
        res.json(res);
      }
    });
  });

router.post("/save", function (req, res) {
    db.Article.findOneAndUpdate({ "_id": (req.body._id) }, { saved: true })
        .then(function () {
            res.redirect('back');
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.post("/unsave", function (req, res) {
    db.Article.findOneAndUpdate({ "_id": (req.body._id) }, { saved: false })
        .then(function () {
            res.redirect('back');
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.get("/saved", function (req, res) {
    db.Article.find({ saved: true }).sort({ updatedAt: -1 }).populate("comment")
        .then(function (article) {
            res.render("saved", {
                title: "SAVED",
                Article: article
            })
        .catch(function (err) {
            res.json(err);
        });
    });
});

router.post("/add-comment/:id", (req, res) => {
    const newComment = new db.Comment(req.body);
    newComment.save(function (err, res) {
        if (err) {
            console.log(err);
        }
        else {
            db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "comment": res._id } })
                .exec(function (err, res) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect('/saved');
                    }
                });
        }
    });
});

router.post("/remove-comment/:id", (req, res) => {
    db.Comment.remove({ "_id": req.params.id }, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('../../saved');
        }
    });
});

module.exports = router;