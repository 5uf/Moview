//script to scrape latest movies
//and store them in a database

var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var d = new Date();
var year = d.getFullYear();

//connect to database
mongoose.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0');

//scrape imdb
function scrape() {
    //scrape the latest movies from wikipedia
    request(`https://en.wikipedia.org/wiki/${year}_in_film`, function(error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var movies = [];
            var movie = {};
            var movieName = "";
           
            //get all movies and links in the first table only
            $('table.wikitable').first().find('tr').each(function(i, element) {

                //get the movie name
                movieName = $(this).find('td:nth-child(2)').text().trim();
                movieLink = $(this).find('td:nth-child(2)').find('a').attr('href');
                if (movieName != "") {
                    movie = {
                        link: movieLink,
                    };
                    movies.push(movie);
                }
            });
            //loop through the movies and get the details
            for (var i = 0; i < movies.length; i++) {
                getMovieDetails(movies[i].link);
            }
        }
    });
}

//get the movie details
function getMovieDetails(link) {
    request(`https://en.wikipedia.org${link}`, function(error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var movie = {};
            var movieName = "";
            var movieLink = "";
            var movieImage = "";
            var movieDescription = "";
            var movieDirector = "";
            var movieProducer = "";
            var movieWriter = "";
            var movieStarring = "";
            var movieMusic = "";
            var movieCinematography = "";
            var movieEditing = "";
            var movieDistributedBy = "";
            var movieReleaseDate = "";
            var movieRunningTime = "";
            var movieCountry = "";
            var movieLanguage = "";
            var movieBudget = "";
            var movieBoxOffice = "";

            //get the movie name
            movieName = $('h1').text().trim();
            movieLink = link;
            movieImage = $('table.infobox').find('tr:nth-child(1)').find('td.infobox-image').find('img').attr('src');
            movieDescription = $('table.infobox').find('tr:nth-child(2)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieDirector = $('table.infobox').find('tr:nth-child(3)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieProducer = $('table.infobox').find('tr:nth-child(4)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieWriter = $('table.infobox').find('tr:nth-child(5)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieStarring = $('table.infobox').find('tr:nth-child(6)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieMusic = $('table.infobox').find('tr:nth-child(7)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieCinematography = $('table.infobox').find('tr:nth-child(8)').find('td').text().trim();
            movieEditing = $('table.infobox').find('tr:nth-child(9)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieDistributedBy = $('table.infobox').find('tr:nth-child(10)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieReleaseDate = $('table.infobox').find('tr:nth-child(11)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieRunningTime = $('table.infobox').find('tr:nth-child(12)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieCountry = $('table.infobox').find('tr:nth-child(13)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieLanguage = $('table.infobox').find('tr:nth-child(14)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieBudget = $('table.infobox').find('tr:nth-child(15)').find('td').text().replace(/\[.*?\]/g, '').trim();
            movieBoxOffice = $('table.infobox').find('tr:nth-child(16)').find('td').text().replace(/\[.*?\]/g, '').trim();

            //create a new movie object
            movie = {
                name: movieName,
                link: movieLink,
                image: movieImage,
                description: movieDescription,
                director: movieDirector,
                producer: movieProducer,
                writer: movieWriter,
                starring: movieStarring,
                music: movieMusic,
                cinematography: movieCinematography,
                editing: movieEditing,
                distributedBy: movieDistributedBy,
                releaseDate: movieReleaseDate,
                runningTime: movieRunningTime,
                country: movieCountry,
                language: movieLanguage,
                budget: movieBudget,
                boxOffice: movieBoxOffice
            };
            //print the movie object
            console.log(movie);
    
          } 
    });
}

//show all movies
router.get('/movies', function(req, res) {
    Movie.find(function(err, movies) {
        if (err) throw err;
        res.json(movies);
    });
});

module.exports = router;

//test the function
scrape();
