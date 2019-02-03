const express = require('express')
const mongoose = require('mongoose');

const app = express()
const port = 3000
const bodyParser = require('body-parser');

const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const url = process.env.MONGOLAB_URI;

const schema = new mongoose.Schema ({
movieName: String,
movieGenre: String,
movieYear: Number,
movieRating: { type: [Number] }
});
const Movie = mongoose.model("Movie", schema);

//mongoose.Promise = global.Promise();

mongoose.connect(url, {useNewUrlParser: true}).then(()=>console.log("connected!"));

app.get("/", (req, res) => {
res.render("index")
})

app.use("/", express.static("public"));

app.set('views', 'views');
app.set('view engine', 'ejs')

app.listen(port, () => console.log('example app on port '+ port))

app.post("/addmovie", (req, res) => {
const myData = new Movie(req.body);
Movie.findOne({'movieName': req.body.movieName},
function(err, Movie) {
if (Movie) {
res.send("<h2>Movie already exists!</h2><a href='/'><h2>Add a different movie</h2></a> ");
} else {
myData.save()
.then(moviename => {
res.send("<h2>Movie saved to database</h2><a href='/'>Home</a>");
})
.catch(err => {
res.status(400).send("Error! unable to save to database <br> <a href='/'>Home</a>");
});
}
})
})

app.post("/ratemovie", (req, res) => {
var rate = req.body.movieRating;
Movie.findOne({'movieName': req.body.movieName},
function(err, succ) {
if (succ) {
Movie.findOneAndUpdate(
{movieName: req.body.movieName},
{ $push: {"movieRating": rate}}, {new:true}, (error, doc) => {
if (error) console.log(error);
console.log(doc);
});
res.send("<h2>Movie Rating Saved!</h2><a href='/'>Home</a> ");
} else {
res.send("<h2>Movie Not Found!</h2><a href='/'>Home</a>");
}
}
)
})

app.post("/searchmovie", (req, res) => {
console.log(req.body);
Movie.find({movieGenre: req.body.movieGenre, movieYear: {$gte: req.body.startYear, $lte: req.body.endYear}}, "movieName movieRating", function(err, docs) {
if (docs){
console.log(docs[0]);
console.log(docs[0].movieRating);
var moviestoshow = [];
var ratingstocalc=[];
var ratingstoshow = [];
for (var i=0; i<docs.length; i++) {
moviestoshow[i]=""+(docs[i].movieName);
if (isNaN(docs[i].movieRating[0])){ 
ratingstoshow[i]=0;
continue;
}
ratingstocalc[i]=0;
for (var j=0; j<docs[i].movieRating.length; j++) {
ratingstocalc[i]+=docs[i].movieRating[j];
}
ratingstoshow[i] = ratingstocalc[i] / docs[i].movieRating.length;
}
console.log(moviestoshow);
var datatoshow = [];
for (var i=0; i<docs.length; i++) {
datatoshow[i] =`<br>The Movie ${moviestoshow[i]} has a rating of ${ratingstoshow[i]}`;
}
res.send(`${datatoshow}<br><a href='/'> Home </a>`);
}
else 
console.log("Error! Something went wrong <a href='/'>Back</a>");
}) 
})
