import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaImdb, FaSearch, FaLanguage, FaFilter } from 'react-icons/fa';
import { Spinner, Dropdown, Form } from 'react-bootstrap';

const MovieSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const navigate = useNavigate();

  // Common Indian languages and regions
  const languages = [
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'kn', name: 'Kannada' },
    { code: 'bn', name: 'Bengali' },
    { code: 'mr', name: 'Marathi' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
  ];

  const regions = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'USA' },
    { code: 'GB', name: 'UK' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'Korea' },
    { code: 'CN', name: 'China' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
  ];

  const fetchMovies = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First search with TMDb API
      let tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}`;
      
      // Add language filters if any selected
      if (selectedLanguages.length > 0) {
        tmdbUrl += `&with_original_language=${selectedLanguages.join(',')}`;
      }
      
      // Add region filters if any selected
      if (selectedRegions.length > 0) {
        tmdbUrl += `&region=${selectedRegions.join(',')}`;
      }
      
      // Add year range
      tmdbUrl += `&primary_release_date.gte=${yearRange[0]}-01-01&primary_release_date.lte=${yearRange[1]}-12-31`;
      
      const tmdbResponse = await axios.get(tmdbUrl);

      // Get detailed info including IMDb data
      const moviesWithDetails = await Promise.all(
        tmdbResponse.data.results.map(async (movie) => {
          try {
            // Get TMDb movie details
            const detailsResponse = await axios.get(
              `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${process.env.REACT_APP_TMDB_API_KEY}&append_to_response=credits,release_dates`
            );
            
            // Get OMDB details if IMDb ID exists
            let omdbDetails = null;
            if (detailsResponse.data.imdb_id) {
              const omdbResponse = await axios.get(
                `https://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}&i=${detailsResponse.data.imdb_id}`
              );
              omdbDetails = omdbResponse.data;
            }
            
            // Get original language name
            const languageObj = languages.find(lang => lang.code === movie.original_language);
            const languageName = languageObj ? languageObj.name : movie.original_language;
            
            return {
              ...movie,
              ...detailsResponse.data,
              omdbDetails,
              languageName,
              rating: omdbDetails?.imdbRating ? parseFloat(omdbDetails.imdbRating) : (movie.vote_average / 2), // Convert 10-point scale to 5-point
              certification: getCertification(detailsResponse.data.release_dates?.results)
            };
          } catch (err) {
            console.error(`Error fetching details for movie ${movie.id}:`, err);
            return null;
          }
        })
      );
      
      // Filter out any failed requests
      setMovies(moviesWithDetails.filter(movie => movie !== null));
    } catch (err) {
      setError('Failed to fetch movies. Please try again later.');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get certification from release dates
  const getCertification = (releaseDates) => {
    if (!releaseDates) return null;
    
    // Try to get US certification first, then IN, then first available
    const usRelease = releaseDates.find(rd => rd.iso_3166_1 === 'US');
    const inRelease = releaseDates.find(rd => rd.iso_3166_1 === 'IN');
    
    if (usRelease?.release_dates?.[0]?.certification) {
      return usRelease.release_dates[0].certification;
    }
    
    if (inRelease?.release_dates?.[0]?.certification) {
      return inRelease.release_dates[0].certification;
    }
    
    const firstRelease = releaseDates.find(rd => rd.release_dates?.[0]?.certification);
    return firstRelease?.release_dates[0]?.certification;
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchMovies();
      } else {
        setMovies([]);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedLanguages, selectedRegions, yearRange]);

  const filteredMovies = movies.filter(movie => 
    movie.rating >= minRating
  );

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`, { state: { movie } });
  };

  const toggleLanguage = (languageCode) => {
    setSelectedLanguages(prev => 
      prev.includes(languageCode) 
        ? prev.filter(lang => lang !== languageCode) 
        : [...prev, languageCode]
    );
  };

  const toggleRegion = (regionCode) => {
    setSelectedRegions(prev => 
      prev.includes(regionCode) 
        ? prev.filter(reg => reg !== regionCode) 
        : [...prev, regionCode]
    );
  };

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Search for movies worldwide..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-danger" type="button">
              <FaSearch />
            </button>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="d-flex flex-wrap gap-3">
            {/* Language Filter */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="language-dropdown">
                <FaLanguage className="me-1" />
                Languages {selectedLanguages.length > 0 && `(${selectedLanguages.length})`}
              </Dropdown.Toggle>
              <Dropdown.Menu className="p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {languages.map(lang => (
                  <Form.Check
                    key={lang.code}
                    type="checkbox"
                    label={lang.name}
                    checked={selectedLanguages.includes(lang.code)}
                    onChange={() => toggleLanguage(lang.code)}
                    className="mb-2"
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
            
            {/* Region Filter */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="region-dropdown">
                <FaFilter className="me-1" />
                Regions {selectedRegions.length > 0 && `(${selectedRegions.length})`}
              </Dropdown.Toggle>
              <Dropdown.Menu className="p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {regions.map(region => (
                  <Form.Check
                    key={region.code}
                    type="checkbox"
                    label={region.name}
                    checked={selectedRegions.includes(region.code)}
                    onChange={() => toggleRegion(region.code)}
                    className="mb-2"
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Min Rating</span>
            <input
              type="range"
              className="form-range px-3"
              min="0"
              max="10"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
            />
            <span className="input-group-text bg-white text-danger fw-bold">
              {minRating}
            </span>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">Year Range</span>
            <input
              type="number"
              className="form-control"
              placeholder="From"
              min="1900"
              max={new Date().getFullYear()}
              value={yearRange[0]}
              onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
            />
            <span className="input-group-text">to</span>
            <input
              type="number"
              className="form-control"
              placeholder="To"
              min="1900"
              max={new Date().getFullYear()}
              value={yearRange[1]}
              onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2">Searching movies worldwide...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {filteredMovies.map(movie => (
            <div key={movie.id} className="col">
              <div 
                className="card h-100 shadow-sm hover-effect"
                onClick={() => handleMovieClick(movie)}
                style={{ cursor: 'pointer' }}
              >
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    className="card-img-top"
                    alt={movie.title}
                    style={{ height: '400px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="card-img-top bg-secondary d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                    <span className="text-white">No poster available</span>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  {movie.original_title !== movie.title && (
                    <p className="text-muted small">{movie.original_title}</p>
                  )}
                  <div className="d-flex align-items-center mb-2 flex-wrap">
                    <span className="badge bg-warning text-dark me-2 mb-1">
                      <FaStar className="me-1" />
                      {movie.rating.toFixed(1)}
                    </span>
                    {movie.omdbDetails?.imdbRating && (
                      <span className="badge bg-dark me-2 mb-1">
                        <FaImdb className="text-warning me-1" />
                        {movie.omdbDetails.imdbRating}
                      </span>
                    )}
                    <span className="badge bg-info me-2 mb-1">
                      {movie.release_date?.substring(0, 4)}
                    </span>
                    {movie.certification && (
                      <span className="badge bg-light text-dark me-2 mb-1">
                        {movie.certification}
                      </span>
                    )}
                    {movie.languageName && (
                      <span className="badge bg-primary me-2 mb-1">
                        {movie.languageName}
                      </span>
                    )}
                  </div>
                  <div className="mb-2">
                    {movie.genres?.map(genre => (
                      <span key={genre.id} className="badge bg-light text-dark me-1 mb-1">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                  <p className="card-text text-truncate-3">{movie.overview || 'No overview available.'}</p>
                </div>
                <div className="card-footer bg-white">
                  <button 
                    className="btn btn-outline-danger w-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMovieClick(movie);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredMovies.length === 0 && searchTerm && (
        <div className="text-center my-5">
          <h4>No movies found matching your criteria</h4>
          <p className="text-muted">Try adjusting your filters or search term</p>
          <button 
            className="btn btn-outline-danger mt-3"
            onClick={() => {
              setSearchTerm('');
              setMinRating(0);
              setSelectedLanguages([]);
              setSelectedRegions([]);
              setYearRange([1900, new Date().getFullYear()]);
            }}
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieSearch;