import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Carousel, Alert, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = ({ user }) => {
  const [latestMovies, setLatestMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Mock data with correct image paths
        const mockMovies = [
          {
            id: 'm1',
            title: 'Avengers: Endgame',
            poster: '/images/posters/avengers-endgame.jpg',
            rating: 4.8,
            genre: 'Action, Adventure, Sci-Fi',
            duration: '3h 2m',
            releaseDate: '2023-05-01',
            nowShowing: true,
            description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.'
          },
          {
            id: 'm2',
            title: 'Spider-Man: No Way Home',
            poster: '/images/posters/spiderman.jpg',
            rating: 4.7,
            genre: 'Action, Adventure, Fantasy',
            duration: '2h 28m',
            releaseDate: '2023-04-15',
            nowShowing: true,
            description: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.'
          },
          {
            id: 'm3',
            title: 'Dune',
            poster: '/images/posters/dune.jpg',
            rating: 4.5,
            genre: 'Adventure, Sci-Fi',
            duration: '2h 35m',
            releaseDate: '2023-03-20',
            nowShowing: true,
            description: 'Feature adaptation of Frank Herbert\'s science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.'
          }
        ];

        const mockTheaters = [
          { 
            id: 't1', 
            name: "PVR Cinemas: Forum Mall", 
            location: "Koramangala, Bangalore",
            distance: "0.5 km",
            amenities: ["Dolby Atmos", "4K Projection", "Recliner Seats"],
            movies: ['m1', 'm2'] 
          },
          { 
            id: 't2', 
            name: "INOX: Garuda Mall", 
            location: "Magrath Road, Bangalore",
            distance: "1.2 km",
            amenities: ["Dolby 7.1", "3D Projection", "Food Court"],
            movies: ['m1', 'm3'] 
          }
        ];

        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            () => {
              setLocation({ lat: 12.9716, lng: 77.5946 }); // Default to Bangalore
            }
          );
        }

        setLatestMovies(mockMovies);
        setFeaturedMovies(mockMovies.slice(0, 3));
        setTheaters(mockTheaters);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        console.error('Error:', err);
      }
    };

    fetchAllData();
  }, []);

  const handleBookNow = (movieId, theaterId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${movieId}/${theaterId}`);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="home-container">
      {/* Location Display */}
      {location && (
        <Alert variant="info" className="location-alert">
          Showing theaters near: Bangalore (12.9716° N, 77.5946° E)
        </Alert>
      )}

      {/* Featured Movies Carousel */}
      <section className="featured-section mb-5">
        <h2 className="section-title">Featured Movies</h2>
        <Carousel fade indicators={false}>
          {featuredMovies.map(movie => (
            <Carousel.Item key={movie.id}>
              <div className="featured-movie">
                <img
                  className="d-block w-100"
                  src={process.env.PUBLIC_URL + movie.poster}
                  alt={movie.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = process.env.PUBLIC_URL + '/images/posters/default.jpg';
                  }}
                />
                <Carousel.Caption>
                  <h3>{movie.title}</h3>
                  <p>{movie.genre}</p>
                  <Button 
                    variant="danger" 
                    size="lg"
                    onClick={() => navigate(`/movies/${movie.id}`)}
                  >
                    View Details
                  </Button>
                </Carousel.Caption>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      {/* Latest Movies Grid */}
      <section className="latest-section mb-5">
        <h2 className="section-title">Now Showing</h2>
        <Row xs={1} md={2} lg={4} className="g-4">
          {latestMovies.map(movie => (
            <Col key={movie.id}>
              <Card className="movie-card h-100">
                <Card.Img 
                  variant="top" 
                  src={process.env.PUBLIC_URL + movie.poster}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = process.env.PUBLIC_URL + '/images/posters/default.jpg';
                  }}
                />
                <Card.Body>
                  <Card.Title>{movie.title}</Card.Title>
                  <Card.Text>
                    <span className="rating">{movie.rating} ★</span>
                    <span className="genre">{movie.genre}</span>
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {movie.duration}
                  </small>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate(`/movies/${movie.id}`)}
                  >
                    Details
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Nearby Theaters Section */}
      <section className="theaters-section">
        <h2 className="section-title">Nearby Theaters</h2>
        <Row xs={1} md={2} className="g-4">
          {theaters.map(theater => (
            <Col key={theater.id}>
              <Card className="theater-card h-100">
                <Card.Body>
                  <Card.Title>{theater.name}</Card.Title>
                  <Card.Text className="text-muted mb-2">
                    {theater.location} • {theater.distance} away
                  </Card.Text>
                  <Card.Text>
                    <small>Facilities: {theater.amenities.join(', ')}</small>
                  </Card.Text>
                  <div className="now-showing">
                    <small className="d-block mb-2">Now Showing:</small>
                    <div className="movie-posters">
                      {latestMovies
                        .filter(movie => theater.movies.includes(movie.id))
                        .map(movie => (
                          <div key={movie.id} className="poster-container">
                            <img 
                              src={process.env.PUBLIC_URL + movie.poster}
                              alt={movie.title}
                              className="mini-poster"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = process.env.PUBLIC_URL + '/images/posters/default.jpg';
                              }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleBookNow(movie.id, theater.id)}
                            >
                              Book Now
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={() => navigate(`/theater/${theater.id}`)}
                  >
                    View All Showtimes
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </Container>
  );
};

export default Home;