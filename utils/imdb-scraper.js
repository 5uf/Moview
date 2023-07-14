//script to scrape latest movies from imdb for malaysia

var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var axios = require("axios").default;
const MongoClient = require('mongodb').MongoClient;
//import uri from env file
const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0";

// Create a new MongoClient
const client = new MongoClient(uri);


// Use connect method to connect to the Server
client.connect(err => {
    if (err) throw err;
    console.log("Connected successfully to server");
    // perform actions on the collection object
    client.close();
});

var app = express();

var headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Host': 'www.imdb.com',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
    }

function main() {
    
    //scrape the latest movies from imdb
    request({ url: `https://www.imdb.com/search/title/?country_of_origin=MY&view=advanced`, headers: headers }, function(error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var movieLink = "";

            //get all movies
            $('div.lister-item-content').each(function(i, element) {
                movieLink = $(this).find('h3.lister-item-header').find('a').attr('href');
                //extract the movie id for imdb id
                movieLink = movieLink.split("/")[2];
                if (movieLink != "") {
                 var options = {
                    method: 'GET',
                    url: 'http://www.omdbapi.com/',
                    params: { apikey: <YOUR_APIKEY>, i: movieLink },
                    };
                axios.request(options).then(function(response) {
                    createMovie(response.data);
                }).catch(function (error) {
                    console.error(error);}
                );
              }
            });

        }
    });

}

main();

async function createMovie(movies) {
    const result = await client.db("grprj").collection("movies").insertOne({movies});
    console.log(`A new movie created, ID: ${result.insertedId}`);
}





