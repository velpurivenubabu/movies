const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
      SELECT
      movie_name
      FROM movie
      ORDER BY 
      movie_id;`;
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  const moviesarray = await db.all(getMovieQuery);
  response.send(
    moviesarray.map((eachmovie) => convertDbObjectToResponseObject(eachmovie))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    SELECT
    *
    FROM
    movie
    WHERE 
    movie_id = ${movieId};`;
  const convertDbObject = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };
  const movie = await db.get(getMovie);
  let v = convertDbObject(movie);
  response.send(v);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const add = `
  INSERT INTO
   movie (director_id, movie_name, lead_actor)
   VALUES
   (
       ${directorId},
       '${movieName}',
       '${leadActor}'
   );`;
  const dbResponse = await db.run(add);
  response.send("Movie Successfully Added");
});
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const update = `
  UPDATE
  movie
  SET
  ${directorId},
  '${movieName}',
'${leadActor}'
  WHERE 
  movie_id = ${movieId}
  `;
  await db.run(update);
  response.send("Movie Details Updated");
});

app.delete("/movies/:bookId/", async (request, response) => {
  const { movieId } = request.params;
  const del = `
    DELETE FROM 
    movie
    WHERE 
    movie_id = ${movieId};`;
  await db.run(del);
  response.send("Movie Removed");
});

module.exports = app;
