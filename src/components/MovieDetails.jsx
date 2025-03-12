import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const getImageUrl = (path) => {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : '/default_image.png';
};

const MovieDetails = ({ movieId, onBack }) => {
  const [movieData, setMovieData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE_URL}/movie/${movieId}?append_to_response=credits,images,videos,reviews,keywords`;
        console.log("Fetching from URL:", url);
        const response = await fetch(url, API_OPTIONS);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Full Movie Data:", {
          title: data.title,
          overview: data.overview,
          release_date: data.release_date,
          runtime: data.runtime,
          genres: data.genres,
          credits: data.credits,
          videos: data.videos,
          reviews: data.reviews,
          keywords: data.keywords
        });
        setMovieData(data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!movieData) return <div>No data available</div>;

  console.log("Rendering with movieData:", movieData);

  return (
    <div className="movieDetails">
      <div className="movieDetailsHeader">
        <button className="backButton" onClick={onBack}>Back</button>
        <h1>{movieData.title || 'No Title'}</h1>
      </div>
      <div className="movieDetailsContent">
        <div className="poster">
          <img src={getImageUrl(movieData.poster_path)} alt={movieData.title || 'Poster'} />
        </div>
        <div className="info">
          <div className="basicInfo">
            <p>Release Date: {movieData.release_date ? new Date(movieData.release_date).toLocaleDateString() : 'Not available'}</p>
            <p>Runtime: {movieData.runtime ? `${movieData.runtime} minutes` : 'Not available'}</p>
            <p>Genres: {movieData.genres && movieData.genres.length > 0 ? movieData.genres.map(genre => genre.name).join(', ') : 'Not available'}</p>
            <p>Rating: {movieData.vote_average ? `${movieData.vote_average}/10` : 'Not available'}</p>
          </div>
          <div className="plotSummary">
            <h2>Plot Summary</h2>
            <p>{movieData.overview || 'No plot summary available'}</p>
          </div>
          <div className="castList">
            <h2>Cast</h2>
            {movieData.credits && movieData.credits.cast && movieData.credits.cast.length > 0 ? (
              <ul>
                {movieData.credits.cast.slice(0, 5).map(actor => (
                  <li key={actor.id}>
                    {actor.name} as {actor.character || 'Unknown Role'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No cast information available.</p>
            )}
          </div>
          <div className="directors">
            <h2>Directors</h2>
            {movieData.credits && movieData.credits.crew && movieData.credits.crew.length > 0 ? (
              <p>
                {movieData.credits.crew
                  .filter(crewMember => crewMember.job === 'Director')
                  .map(director => director.name)
                  .join(', ') || 'No directors listed'}
              </p>
            ) : (
              <p>No directors listed</p>
            )}
          </div>
          <div className="trailers">
            <h2>Trailers</h2>
            {movieData.videos && movieData.videos.results && movieData.videos.results.length > 0 ? (
              movieData.videos.results
                .filter(trailer => trailer.type === 'Trailer')
                .map(trailer => (
                  <div key={trailer.key} className="trailerItem">
                    <h3>{trailer.name}</h3>
                    <div className="videoContainer">
                      <iframe
                        width="560"
                        height="315"
                        src={`https://www.youtube.com/embed/${trailer.key}`}
                        title={trailer.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))
            ) : (
              <p>No trailers available.</p>
            )}
          </div>
          <div className="reviews">
            <h2>Reviews</h2>
            {movieData.reviews && movieData.reviews.results && movieData.reviews.results.length > 0 ? (
              <ul>
                {movieData.reviews.results.map(review => (
                  <li key={review.id}>
                    <strong>{review.author}</strong>: {review.content}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviews available.</p>
            )}
          </div>
          <div className="keywords">
            <h2>Keywords</h2>
            {movieData.keywords && movieData.keywords.keywords && movieData.keywords.keywords.length > 0 ? (
              <ul>
                {movieData.keywords.keywords.map(keyword => (
                  <li key={keyword.id}>{keyword.name}</li>
                ))}
              </ul>
            ) : (
              <p>No keywords available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;