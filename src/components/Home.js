import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Carousel, Alert, Button, Badge } from 'react-bootstrap';
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
            title: 'Kalki 2898 AD',
            poster: 'https://pbs.twimg.com/profile_images/1812787806948749312/TwRA-xYf_400x400.jpg',
            rating: 4.8,
            genre: 'Sci-Fi, Action',
            duration: '2h 58m',
            releaseDate: '2024-06-27',
            nowShowing: true,
            description: 'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.'
          },
          {
            id: 'm2',
            title: 'Pushpa 2: The Rule',
            poster: 'https://www.livehindustan.com/lh-img/smart/img/2024/11/17/1600x900/Pushpa_2_The_Rule_1731843940754_1731843941797.jpg',
            rating: 4.7,
            genre: 'Action, Drama',
            duration: '2h 45m',
            releaseDate: '2024-08-15',
            nowShowing: true,
            description: 'The rule of Pushpa Raj begins as he takes control of the red sandalwood smuggling syndicate.'
          },
          {
            id: 'm3',
            title: 'Singham Again',
            poster: 'https://www.livemint.com/lm-img/img/2024/12/07/600x338/GbCJ_1730179557968_1733557871106.jfif',
            rating: 4.6,
            genre: 'Action, Thriller',
            duration: '2h 35m',
            releaseDate: '2024-08-15',
            nowShowing: true,
            description: 'The third installment in the Singham franchise, with Bajirao Singham taking on a new powerful enemy.'
          },
          {
            id: 'm4',
            title: 'Indian 2',
            poster: 'https://jfwonline.com/wp-content/uploads/2024/07/WhatsApp-Image-2024-07-12-at-3.45.55-PM.jpeg',
            rating: 4.5,
            genre: 'Action, Thriller',
            duration: '2h 52m',
            releaseDate: '2024-07-12',
            nowShowing: true,
            description: 'Senapathy returns to fight corruption in this Kamal Haasan starrer sequel to the 1996 blockbuster.'
          },
          {
            id: 'm5',
            title: 'Devara: Part 1',
            poster: 'https://static.toiimg.com/thumb/resizemode-4,width-1280,height-720,msid-113587323/113587323.jpg',
            rating: 4.4,
            genre: 'Action, Drama',
            duration: '2h 40m',
            releaseDate: '2024-10-10',
            nowShowing: true,
            description: 'A fierce protagonist who fights for the rights of his community in coastal Andhra Pradesh.'
          },
          {
            id: 'm6',
            title: 'coolie',
            poster: 'https://preview.redd.it/coolie-hype-is-real-v0-n2prf6pxwspd1.jpeg?auto=webp&s=f3de3ec4b5f906cdf2ba003cea652aa72994e88c',
            rating: 4.3,
            genre: 'Action, Thriller',
            duration: '2h 25m',
            releaseDate: '2024-07-12',
            nowShowing: true,
            description: 'A common man\'s battle against the system and powerful enemies to seek justice.'
          },
          {
            id: 'm7',
            title: 'War2',
            poster: 'https://www.koimoi.com/wp-content/new-galleries/2025/08/war-2-movie-review-1.jpg',
            rating: 4.0,
            genre: 'Action, Fantasy',
            duration: '2h 50m',
            releaseDate: '2024-09-12',
            nowShowing: true,
            description: 'A period action film starring Suriya in multiple roles, set in multiple time periods.'
          },
          {
            id: 'm8',
            title: 'Salaar: Part 1',
            poster: 'https://images.firstpost.com/uploads/2023/12/MixCollage-24-Nov-2023-03-00-PM-6008-2.jpg?im=FitAndFill=(596,336)',
            rating: 4.7,
            genre: 'Action, Thriller',
            duration: '2h 55m',
            releaseDate: '2024-12-01',
            nowShowing: true,
            description: 'The continuation of the violent world of Salaar and his complex friendship with Vardha.'
          }
        ];

        const mockTheaters = [
          { 
            id: 't1', 
            name: "PVR Cinemas: Forum Mall", 
            location: "Koramangala, Bangalore",
            distance: "0.5 km",
            amenities: ["Dolby Atmos", "4K Projection", "Recliner Seats"],
            movies: ['m1', 'm2', 'm3', 'm4'] 
          },
          { 
            id: 't2', 
            name: "INOX: Garuda Mall", 
            location: "Magrath Road, Bangalore",
            distance: "1.2 km",
            amenities: ["Dolby 7.1", "3D Projection", "Food Court"],
            movies: ['m1', 'm3', 'm5', 'm6'] 
          },
          { 
            id: 't3', 
            name: "Cinepolis: Phoenix Marketcity", 
            location: "Whitefield, Bangalore",
            distance: "5.3 km",
            amenities: ["IMAX", "Dolby Cinema", "Premium Lounger"],
            movies: ['m2', 'm4', 'm7', 'm8'] 
          },
          { 
            id: 't4', 
            name: "Miraj Cinemas: Balewadi High Street", 
            location: "Balewadi, Pune",
            distance: "2.1 km",
            amenities: ["Dolby Atmos", "4DX", "VIP Seating"],
            movies: ['m1', 'm5', 'm6', 'm8'] 
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
        setFeaturedMovies(mockMovies.slice(0, 4));
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
        <Alert variant="info" className="location-alert d-flex justify-content-between align-items-center">
          <div>
            <i className="fas fa-map-marker-alt me-2"></i>
            Showing theaters near: Bangalore (12.9716° N, 77.5946° E)
          </div>
          <Button variant="outline-info" size="sm">
            Change Location
          </Button>
        </Alert>
      )}

      {/* Featured Movies Carousel */}
      <section className="featured-section mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="section-title mb-0">Featured Movies</h2>
          <Button variant="outline-primary" size="sm" onClick={() => navigate('/movies')}>
            View All <i className="fas fa-chevron-right ms-1"></i>
          </Button>
        </div>
        <Carousel fade indicators={true} interval={4000}>
          {featuredMovies.map(movie => (
            <Carousel.Item key={movie.id}>
              <div className="featured-movie">
                <img
                  className="d-block w-100"
                  src={process.env.PUBLIC_URL + movie.poster}
                  alt={movie.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/800x400/333/fff?text=Poster+Not+Found";
                  }}
                />
                <Carousel.Caption>
                  <Badge bg="danger" className="mb-2">Now Showing</Badge>
                  <h3>{movie.title}</h3>
                  <p>{movie.genre}</p>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="danger" 
                      size="lg"
                      onClick={() => navigate(`/movies/${movie.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline-light" 
                      size="lg"
                      onClick={() => navigate('/theaters')}
                    >
                      Find Theaters
                    </Button>
                  </div>
                </Carousel.Caption>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      {/* Latest Movies Grid */}
      <section className="latest-section mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="section-title mb-0">Now Showing</h2>
          <Button variant="outline-primary" size="sm" onClick={() => navigate('/movies')}>
            View All <i className="fas fa-chevron-right ms-1"></i>
          </Button>
        </div>
        <Row xs={2} md={3} lg={4} className="g-4">
          {latestMovies.map(movie => (
            <Col key={movie.id}>
              <Card className="movie-card h-100">
                <div className="position-relative">
                  <Card.Img 
                    variant="top" 
                    src={process.env.PUBLIC_URL + movie.poster}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x450/333/fff?text=Poster+Not+Found";
                    }}
                  />
                  <Badge bg="success" className="position-absolute top-0 end-0 m-2">
                    {movie.rating} ★
                  </Badge>
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="flex-grow-0">{movie.title}</Card.Title>
                  <Card.Text className="flex-grow-0">
                    <small className="text-muted d-block">{movie.genre}</small>
                    <small className="text-muted">{movie.duration}</small>
                  </Card.Text>
                  <div className="mt-auto">
                    <Button 
                      variant="primary" 
                      className="w-100"
                      onClick={() => navigate(`/movies/${movie.id}`)}
                    >
                      Book Tickets
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Nearby Theaters Section */}
      <section className="theaters-section mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="section-title mb-0">Nearby Theaters</h2>
          <Button variant="outline-primary" size="sm" onClick={() => navigate('/theaters')}>
            View All <i className="fas fa-chevron-right ms-1"></i>
          </Button>
        </div>
        <Row xs={1} md={2} className="g-4">
          {theaters.map(theater => (
            <Col key={theater.id}>
              <Card className="theater-card h-100">
                <Card.Body>
                  <Card.Title>{theater.name}</Card.Title>
                  <Card.Text className="text-muted mb-2">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {theater.location} • {theater.distance} away
                  </Card.Text>
                  <Card.Text>
                    <small>
                      <i className="fas fa-tags me-1"></i>
                      Facilities: {theater.amenities.join(', ')}
                    </small>
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
                                e.target.src = "https://via.placeholder.com/100x150/333/fff?text=Poster";
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

      {/* Special Offers Section */}
      <section className="offers-section mb-5">
        <h2 className="section-title mb-3">Special Offers</h2>
        <Row className="g-4">
          <Col md={6}>
            <Card className="offer-card bg-primary text-white">
              <Card.Body className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <Card.Title>50% Off on Weekdays</Card.Title>
                  <Card.Text>
                    Enjoy half price tickets for all shows from Monday to Thursday
                  </Card.Text>
                  <Button variant="light">Claim Offer</Button>
                </div>
                <div className="offer-icon">
                  <i className="fas fa-ticket-alt fa-3x"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="offer-card bg-danger text-white">
              <Card.Body className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <Card.Title>Free Popcorn Combo</Card.Title>
                  <Card.Text>
                    Get a free popcorn and drink combo with any 3 tickets booked
                  </Card.Text>
                  <Button variant="light">Claim Offer</Button>
                </div>
                <div className="offer-icon">
                  <i className="fas fa-popcorn fa-3x"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </Container>
  );
};

export default Home;
