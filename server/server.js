const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const Movie = require("./models/Movie.js");

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
// app.use(cors({ origin: "https://localhost:5000" }));

const PORT = process.env.PORT || 5000;

//API endpoint connection/function..

// const option = {
// method : 'GET',
// headers: {
//   accept: 'application/json',
//   Authorization: `Bearer $(process.env.TMDB_API)`

// }
// }

// app.post('/addMovie', async(req, res) => {
// // const { id, platform,  watchDate} = req.body
// const getInfo = fetch('https://api.themoviedb.org/3/find/tt10366206?external_source=imdb_id',
// options)
//     .then(response => response.json())
//     .then(response => console.log(response))
//     .catch(err => console.error(err));
// });
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MmY5MzIxNGYwNWFkYjU0MWZjYmVkMjFhYTE4YzM1ZSIsInN1YiI6IjY0NjE5YTRjZTNmYTJmMDE0NWVjYjQwZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.a0e24nsroZOaI8mrggIWhu-QNCcx6xGXyZJlW0brPZo",
  },
};

app.post("/addMovie", async (req, res) => {
  const { id, platform, watchDate }  = req.body;
  if(!id || !platform || !watchDate) {
    res.status(400).send('Missing required information');
  }

  const getInfo = await fetch(
    `https://api.themoviedb.org/3/find/${id}?external_source=imdb_id`,
    options
  );
  // .then(response => response.json())
  // .then(response => console.log(response))
  // .catch(err => console.error(err));
  const data = await getInfo.json();
  console.log(data.movie_results[0].title);

  if (getInfo.ok) {
    if (data.movie_results.length === 0) {
      res.status(404).send("Movie not found");
    } else {
      const movie = new Movie({
        movieName: data.movie_results[0].title,
        platform,
        watchDate,
        overview: data.movie_results[0].overview,
        poster_path: data.movie_results[0].poster_path,
      });
      await movie.save();
    }
  }
});

app.get("/getMovies", async (req, res) => {
  const movies = await Movie.find();
  res.send(movies);
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to MongoDB"));

app.get("/", (req, res) => {
  console.log("Hello world");
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
