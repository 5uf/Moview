const path = require('path');
const axios = require('axios');
const express = require('express');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const database = require('./src/database');

//import the mongodb module
const { MongoClient } = require('mongodb');
const { capitalize } = require('lodash');
const uri = "mongodb://127.0.0.1:27017";

// Create a new MongoClient
const client = new MongoClient(uri);

// Use connect method to connect to the Server
client.connect(err => {
    if (err) throw err;
    console.log("Connected successfully to server");
    // perform actions on the collection object
    client.close();
});

const port = 8000;
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'views/public')));
app.use(flash());
//session
app.use(session({
    secret: 'moview',
    resave: false,
    saveUninitialized: true
  }))

//user authentication
function isAuth(req, res, next){
    if(req.session && req.session.user){
        next();
    }else{
        req.flash('message', 'Please login to view this page.');
        res.redirect('/login');
    }
}


app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    res.locals.admin = req.session.admin;
    next();
  });
      

//login process
app.get('/login', function(req, res){
    const message = req.flash('message');
    res.render('login', {message});
});
app.post('/login', async function(req, res){ 
    var name = req.body.username;
    var pass = req.body.password;
    // query the mongodb for the given username and validate the password
    await database.checkUser(name,pass)
      .then(function(result){
          return result;
      })
      .then(function(result){
        if (result) {
          //create session globally
          req.session.regenerate( async function(err){
            if(err){ return res.send(500); }
            req.session.user = name;
            req.session.admin = await database.checkAdmin(name);
            req.session.save(function (err) {
                if (err) { return next(err) }
              req.flash('message', 'Login successful, Welcome ' + capitalize(name) + '!');
              res.redirect('/');
            })
          })
          console.log(name + " logged in");  
        } else {
          req.flash('message', 'Authentication failed, please check your username and password.');
          res.redirect('/login');
          console.log("User not logged in");
        }
      })
      .catch(function(err){
        console.log(err);
      })
    });
    app.get('/logout', function(req, res){
        req.session.destroy();
        res.redirect('/login');
    });

//user profile
app.get('/profile', isAuth, async function(req, res){
    let result = await database.findUser(req.session.user);
    res.render('profile', {result: result});
});
app.post('/profile', isAuth, async function(req, res){
    let user = req.session.user;
    let password = req.body.password;
    let password2 = req.body.password2;

    if(password != password2){
        req.flash('message', 'Passwords do not match.');
        res.redirect('/profile');
    }else{
        await database.updateUser(user, password);
        req.flash('message', 'Password updated.');
        res.redirect('/profile');
    }
});

//user registeration
app.get('/register', function(req, res){
    const message = req.flash('message');
    res.render('register', {message});
});
app.post('/register', async function(req, res){
    
    var user = req.body.username;
    var pass = req.body.password;
    var pass2 = req.body.password2;
    var email = req.body.email;
    var phone = req.body.phonenum;
    var priviledge = false;
    
    //check if passwords match      
      if (pass != pass2) {
        req.flash('message', 'Passwords do not match.');
        res.redirect('/register');
      } else {
        //insert user, pass, image into mongodb
        var newUser = {
            username: user,
            password: pass,
            email: email,
            phone: phone,
            priviledge: priviledge
        };
        database.createUser(newUser);
        req.flash('message', 'Registration successful, please login.');
        res.redirect('/login');
      } 
});

//main page
app.get('/', async function(req, res){
    let popular = await database.findPopularMovies();
    let newest = await database.findLatestMovies();
    let negative = await database.findWorstMovies();
    const message = req.flash('message');
    res.render('index', {
        popular: popular, 
        newest: newest, 
        negative: negative, 
        message: message });
});


/*
app.get('/', async function(req, res){
    let result = await database.findAllMovies();
    res.render('grid', {result: result});

});*/


//viewing a movie
app.get('/view/:id', async function(req, res){
    let id = req.params.id;
    let result = await database.findMovieById(id);
    const message = req.flash('message');
    res.render('view', {result: result, message: message});
});

//adding a movie
app.get('/add', function(req, res){
    const message = req.flash('message');
    res.render('add', {message: message});
});
app.post('/add', function(req, res){
    let link = req.body.link;
    var id = link.split('/')[4];
    var options = {
        method: 'GET',
        url: 'http://www.omdbapi.com/',
        params: { apikey: "c1dbeebb", i: id },
        };
    axios.request(options).then(async function(response) {
        await database.addMovie(response.data);
        console.log(response.data);
    }).catch(function (error) {
        console.error(error);}
    );
    
    req.flash('message', 'Movie added.');
    res.redirect('/add');
});
app.post('/add2', async function(req, res){
    let title = req.body.title;
    let year = req.body.year;
    let genre = req.body.genre;
    let country = req.body.country;
    let language = req.body.language;
    let director = req.body.director;
    let writer = req.body.writer;
    let actors = req.body.actors;
    let plot = req.body.plot;
    let poster = req.body.poster;
    let runtime = req.body.runtime;
    let type = req.body.type;
    let imdbVotes = req.body.imdbvotes;
    let imdbID = req.body.imdbid;
    let imdbRating = req.body.imdbrating;
    let website = req.body.website;
    let boxoffice = req.body.boxoffice;
    let production = req.body.production;
    let awards = req.body.awards;

 
    //create new JSON object
    let newMovie = {
        "Title": title,
        "Year": year,
        "Genre": genre,
        "Country": country,
        "Language": language,
        "Director": director,
        "Writer": writer,
        "Actors": actors,
        "Plot": plot,
        "Poster": poster,
        "Runtime": runtime,
        "Type": type,
        "imdbVotes": imdbVotes,
        "imdbID": imdbID,
        "imdbRating": imdbRating,
        "Website": website,
        "BoxOffice": boxoffice,
        "Production": production,
        "Awards": awards,
        "imdbID": imdbID,
        "imdbRating": imdbRating,
        "Website": website,
        "BoxOffice": boxoffice,
        "Production": production
        };
    console.log(newMovie);
    //insert new movie into mongodb
    await database.addMovie(newMovie);
    req.flash('message', 'Movie added successfully.');
    res.redirect('/');
});

//gps
app.get('/gps', function(req, res){
    res.render('gps');
});

app.get('/qr', async function(req, res){
    res.render('qr');
});

//searching by genre
app.get('/genre', async function(req, res){
    res.render('genre');
});
app.get('/genre/:g', async function(req, res){
    let genre = req.params.g;
    let result = await database.findMoviesByGenre(genre);
    res.render('grid', {result: result});

});

//searching by year
app.get('/year/:y', async function(req, res){
    let year = req.params.y;
    let result = await database.findMoviesByYear(year);
    res.render('grid', {result: result});
});

//searching country
app.get('/country/:c', async function(req, res){
    let country = req.params.c;
    let result = await database.findMoviesByCountry(country);
    res.render('grid', {result: result});
});

//searching language
app.get('/language/:l', async function(req, res){
    let language = req.params.l;
    let result = await database.findMoviesByLanguage(language);
    res.render('grid', {result: result});
});

//searching director
app.get('/director/:d', async function(req, res){
    let director = req.params.d;
    let result = await database.findMoviesByDirector(director);
    res.render('grid', {result: result});
});

//searching cast or actor
app.get('/cast/:c', async function(req, res){
    let cast = req.params.c;
    let result = await database.findMoviesByCast(cast);
    res.render('grid', {result: result});
});

//searching for movies
app.post('/search', async function(req, res){  
    var search = await req.body.search;
    let result = await database.searchMovie(search);
    res.render('grid', {result: result});
});

app.get('/reviews', isAuth, async function(req, res){
    let result = await database.listReviews();
    const message = req.flash('message');
    res.render('reviews', {result: result, message: message});
});

app.post('/approve', async function(req, res){
    let id1 = req.body.movieid;
    let id2 = req.body.reviewid;
    await database.approveReview(id1, id2);
    req.flash('message', 'Review approved.');
    res.redirect('/reviews');
});

app.post('/delete', async function(req, res){
    let id1 = req.body.movieid;
    let id2 = req.body.reviewid;
    await database.deleteReview(id1, id2);
    req.flash('message', 'Review deleted.');
    res.redirect('/reviews');
});

//rating
app.post('/rating',  async function(req, res){
    let movie = req.body.movie;
    let star = req.body.radio;
    let comment = req.body.comment;
    let user = req.session.user;
    if (comment === undefined) {
        comment = "";
    }if (user === undefined) {
        user = "Anonymous";
    }
    await database.updateRating(movie, star, comment,user);
    req.flash('message', 'Rating submitted and will be reviewed by an handsome admin.');
    res.redirect('/view/'+movie);
});

//rerouting any unknown request to error page
app.get('*', function(req, res){
    res.render('error');
});

app.listen(port, function(){
    console.log('Moview by Azri started at http://localhost:' + port);
});

