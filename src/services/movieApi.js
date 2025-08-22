import axios from 'axios';

const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY;
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

export const searchMovies = async (query) => {
  try {
    // Search with TMDb first for better results
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );
    
    // Get detailed info including IMDb IDs
    const moviesWithDetails = await Promise.all(
      tmdbResponse.data.results.map(async (movie) => {
        const details = await getMovieDetails(movie.id);
        return {
          ...movie,
          imdb_id: details.imdb_id,
          omdb_details: details.imdb_id ? await getOmdbDetails(details.imdb_id) : null
        };
      })
    );
    
    return moviesWithDetails;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getMovieDetails = async (tmdbId) => {
  const response = await axios.get(
    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
  );
  return response.data;
};

export const getOmdbDetails = async (imdbId) => {
  const response = await axios.get(
    `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`
  );
  return response.data;
};

export const getMovieCredits = async (tmdbId) => {
  const response = await axios.get(
    `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}`
  );
  return response.data;
};