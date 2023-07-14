//import the mongodb module
const { MongoClient, Int32, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const salt = 10;

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

/**
 * @param {MongoClient} client 
 * @param {string} nameOfMovie The name of the Movie you want to delete
 * 
 */

async function searchMovie(data) {
    await client.connect();
    const regex = new RegExp(data, 'igmu');
    const cursor = client.db("grprj").collection("movies").find({ $or: [
    { "movies.Title": regex }, 
    { "movies.Genre": regex },  
    { "movies.Director": regex }, 
    { "movies.Actors": regex }] });
    //sort by rating
    cursor.sort({ "movies.imdbRating": 1 });
    return await cursor.toArray();
}

async function addMovie(movies){
    const result = await client.db("grprj").collection("movies").insertOne({movies});
    console.log(`New Movie created with the following id: ${result.insertedId}`);
}

async function updateMovieByName(nameOfMovie, updatedMovie){
    const result = await client.db("grprj").collection("movies").updateOne({ name: nameOfMovie }, { $set: updatedMovie });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

//list all data in the collection
async function findAllMovies() {
    await client.connect();
    const cursor = client.db("grprj").collection("movies").find();
    const results = await cursor.toArray();
    return results;
}

async function findMovieById(id) {
    await client.connect();
    const cursor = client.db("grprj").collection("movies").find({ "movies.imdbID": id });
    const results = await cursor.toArray();
    return results;
}

async function findMovieByTitle(title) {
    await client.connect();
    //regex to find the title
    const regex = new RegExp(title, 'i');
    const cursor = client.db("grprj").collection("movies").find({ "movies.Title": regex });
    return await cursor.toArray();
}
//find popular movies
async function findPopularMovies() {
    await client.connect();
    const cursor = client.db("grprj").collection("movies").find({ "movies.imdbRating": Int32 });
    const results = await cursor.toArray();
    results.sort((a, b) => (a.movies.imdbRating < b.movies.imdbRating) ? -1 : 1);
    const top10 = results.slice(0, 10);
    return top10;
}

async function findWorstMovies() {
    await client.connect();
    const cursor = client.db("grprj").collection("movies").find({ "movies.imdbRating": Int32 });
    const results = await cursor.toArray();
    results.sort((a, b) => (a.movies.imdbRating > b.movies.imdbRating) ? -1 : 1);
    const top10 = results.slice(0, 10);
    return top10;
}

async function findLatestMovies() {
    await client.connect();
    //find movies released from 2020 to now
    const cursor = client.db("grprj").collection("movies").find({ "movies.Released": { $gte: "2021-01-01" } });
    const results = await cursor.toArray();
    results.sort((a, b) => (a.movies.Released < b.movies.Released) ? -1 : 1);
    const top10 = results.slice(0, 10);
    return top10;
}

async function findMoviesByGenre(genre) {
    await client.connect();
    //regex to find the genre
    genre = new RegExp(genre, 'i');
    const cursor = client.db("grprj").collection("movies").find({ "movies.Genre": genre });
    const results = await cursor.toArray();
    results.sort((a, b) => (a.movies.imdbRating < b.movies.imdbRating) ? -1 : 1);
    return results;
}

async function findMoviesByCountry(country) {
    await client.connect();
    //regex to find the country
    country = new RegExp(country, 'i');
    const cursor = client.db("grprj").collection("movies").find({ "movies.Country": country });
    const results = await cursor.toArray();
    return results;
}

async function findMoviesByLanguage(language) {
    await client.connect();
    //regex to find the language
    language = new RegExp(language, 'i');
    const cursor = client.db("grprj").collection("movies").find({ "movies.Language": language });
    const results = await cursor.toArray();
    return results;
}

async function findMoviesByYear(year) {
    await client.connect();
    //regex to find the year
    year = new RegExp(year, 'i');
    const cursor = client.db("grprj").collection("movies").find({ "movies.Year": year });
    const results = await cursor.toArray();
    return results;
}


async function findMoviesByDirector(director) {
    await client.connect();
    //regex to find the director
    director = new RegExp(director, 'i');
    const cursor = client.db("grprj").collection("movies").find({ "movies.Director": director });
    const results = await cursor.toArray();
    return results;
}

async function findMoviesByCast(actor) {
    await client.connect();
    //regex to find the actor
    actor = new RegExp(actor, 'i');
    const cursor = client.db("grprj").collection("movies").find({ "movies.Actors": actor });
    const results = await cursor.toArray();
    return results;
}

async function deleteMovieByName(client, nameOfMovie) {
    const result = await client.db("grprj").collection("movies").deleteOne({ name: nameOfMovie });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function checkUser(user, pass){
    //check if user exists
    const result = await client.db("grprj").collection("users").find().toArray();
    for (var i = 0; i < result.length; i++) {
        if (result[i].newUser.username == user) {
            if (await bcrypt.compare(pass, result[i].newUser.password)) {
                return true;
            }
        }
    }
}

async function checkAdmin(user){
    //check if user exists
    const result = await client.db("grprj").collection("users").find().toArray();
    for (var i = 0; i < result.length; i++) {
        if (result[i].newUser.username == user) {
         return result[i].newUser.priviledge;
        }
    }
}
  

async function findUser(user){
    //check if user exists
    const result = await client.db("grprj").collection("users").find().toArray();
    for (var i = 0; i < result.length; i++) {
        if (result[i].newUser.username == user) {
            return result[i];
        }
    }
}

async function updateUser(user, newPass){
    //check if user exists
    const result = await client.db("grprj").collection("users").find().toArray();
    for (var i = 0; i < result.length; i++) {
        if (result[i].newUser.username == user) {
            result[i].newUser.password = await bcrypt.hash(newPass, salt);
        }
    }
}


async function createUser(newUser){
    //hash the password
    await client.connect();
    newUser.password = await bcrypt.hash(newUser.password, salt);
    const result = await client.db("grprj").collection("users").insertOne({newUser});
    console.log(`New user created with the following id: ${result.insertedId}`);
}

async function listReviews(){
    await client.connect();
    var list = [];
    const result = await client.db("grprj").collection("movies").find().toArray();
    for (var i = 0; i < result.length; i++) {
        if (result[i].Comments != null && result[i].Comments.length > 0) {
            if (result[i].Comments[0].verified == false ) {
                list.push(result[i]);
            }
        }
    }
    return list;
}


async function updateRating(movieID, rating, comment, user) {
    await client.connect();
    //regex to find the movie
    const cursor = client.db("grprj").collection("movies").find({ "movies.imdbID": movieID });
    const results = await cursor.toArray();
    //generate the random reviewID
    const reviewID = Math.floor(Math.random() * 1000000000);
    //update the rating
    const newRating = (rating / (results[0].movies.imdbRating * results[0].movies.imdbVotes) + results[0].movies.imdbRating);
    const newVotes = parseInt(results[0].movies.imdbVotes) + 1;
    const newComment = { "reviewID": reviewID, "rating": rating, "comment": comment, "user": user, "verified": false };
    const result = await client.db("grprj").collection("movies")
    .updateOne({ "movies.imdbID": movieID },
    { $set: { "movies.imdbRating" : newRating, 
    "movies.imdbVotes": newVotes }, $push: { "Comments": newComment } });
    return result; 
}

async function deleteReview(movieID, reviewID) {
    await client.connect();
    const result = await client.db("grprj").collection("movies").findOne({ "movies.imdbID": movieID });
    for (var i = 0; i < result.Comments.length; i++) {
        if (result.Comments[i].reviewID == reviewID) {
            result.Comments.splice(i, 1);
        }
    }
    const result2 = await client.db("grprj").collection("movies").updateOne({ "movies.imdbID": movieID }, { $set: { "Comments": result.Comments } });
}

async function approveReview(movieID, reviewID) {
    await client.connect();
    const result = await client.db("grprj").collection("movies").findOne({ "movies.imdbID": movieID });
    for (var i = 0; i < result.Comments.length; i++) {
        if (result.Comments[i].reviewID == reviewID) {
            result.Comments[i].verified = true;
        }
    }
    const result2 = await client.db("grprj").collection("movies").updateOne({ "movies.imdbID": movieID }, { $set: { "Comments": result.Comments } });
}

//main().catch(console.error);

//export the module
module.exports = {
    updateMovieByName,
    findAllMovies,
    findPopularMovies,
    findWorstMovies,
    findLatestMovies,
    findMoviesByGenre,
    findMoviesByCountry,
    findMoviesByLanguage,
    findMoviesByDirector,
    findMoviesByCast,
    findMovieById,
    findMovieByTitle,
    findMoviesByYear,
    addMovie,
    searchMovie,
    deleteMovieByName,
    checkUser,
    checkAdmin,
    updateRating,
    createUser,
    findUser,
    updateUser,
    listReviews,
    deleteReview,
    approveReview
}

