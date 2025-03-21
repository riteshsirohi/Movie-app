import React, { useState, useEffect } from "react";
import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import MovieDetails from "./components/MovieDetails";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";
import Spinner from "./components/Spinner.jsx";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  const fetchMovies = async (query = " ") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      const data = await response.json();
      if (data.response === "False") {
        setErrorMessage(data.Error || "Error fetching movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error("error fetching movies", { error });
      setErrorMessage("Error fetching movies");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error("error fetching trending movies", { error });
    }
  };

  useEffect(() => {
    setSelectedMovieId(null);
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);


  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Background-img" />
          <h1>
            {" "}
            Find <span className="text-gradient">Movies</span> you'll enjoy
            without any hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

{selectedMovieId ? (
  <MovieDetails movieId={selectedMovieId} onBack={() => setSelectedMovieId(null)} />
) : (
  <section className="all-movies">
    <h2>All Movies</h2>
    {isLoading ? (
      <Spinner />
    ) : errorMessage ? (
      <p className='text-red-500'>{errorMessage}</p>
    ) : (
      <ul>
        {movieList.map((movie) => (
          <li key={movie.id} className="movie-card-wrapper" onClick={() => setSelectedMovieId(movie.id)}>
            <MovieCard movie={movie} />
          </li>
        ))}
      </ul>
    )}
  </section>
)}
      </div>
    </main>
  );
};

export default App;
