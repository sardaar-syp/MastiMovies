import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { FaMapMarkerAlt, FaStar, FaClock } from 'react-icons/fa';
import './TheaterShowtimes.css';

const TheaterShowtimes = ({ user }) => {
  const { theaterId } = useParams();
  const navigate = useNavigate();
  const [theater, setTheater] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data
        const mockTheaters = [
          { 
            id: 't1', 
            name: "PVR Cinemas: Forum Mall", 
            location: "Koramangala, Bangalore",
            amenities: ["Dolby Atmos", "4K Projection", "Recliner Seats"],
            contact: "080 12345678",
            showTimes: ['10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM']
          },
          { 
            id: 't2', 
            name: "INOX: Garuda Mall", 
            location: "Magrath Road, Bangalore",
            amenities: ["Dolby 7.1", "3D Projection", "Food Court"],
            contact: "080 87654321",
            showTimes: ['9:30 AM', '1:30 PM', '5:30 PM', '9:30 PM']
          }
        ];

        const mockMovies = [
          {
            id: 'm1',
            title: 'Avengers: Endgame',
            poster: '/images/posters/avengers-endgame.jpg',
            rating: 4.8,
            genre: 'Action, Adventure, Sci-Fi',
            duration: '3h 2m'
          },
          {
            id: 'm2',
            title: 'Spider-Man: No Way Home',
            poster: '/images/posters/spiderman.jpg',
            rating: 4.7,
            genre: 'Action, Adventure, Fantasy',
            duration: '2h 28m'
          }
        ];

        const foundTheater = mockTheaters.find(t => t.id === theaterId);
        if (!foundTheater) {
          throw new Error('Theater not found');
        }

        setTheater(foundTheater);
        setMovies(mockMovies);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [theaterId]);

  const handleBookTicket = (movieId, showTime) => {
    console.log('Booking ticket for:', movieId, theaterId, showTime);
    if (!user) {
      navigate('/login', { 
        state: { 
          from: `/book/${movieId}/${theaterId}`,
          time: showTime 
        } 
      });
      return;
    }
    navigate(`/book/${movieId}/${theaterId}`, {
      state: { 
        showTime,
        theaterName: theater.name,
        movieTitle: movies.find(m => m.id === movieId)?.title
      }
    });
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
        <Button variant="primary" onClick={() => navigate('/')}>Go Back Home</Button>
      </Container>
    );
  }

  return (
    <Container className="theater-showtimes-container">
      <div className="theater-header mb-4">
        <h1>{theater.name}</h1>
        <div className="theater-meta">
          <span className="location">
            <FaMapMarkerAlt className="me-1" />
            {theater.location}
          </span>
          <span className="contact">
            <strong>Contact:</strong> {theater.contact}
          </span>
        </div>
        <div className="amenities">
          {theater.amenities.map((amenity, index) => (
            <Badge key={index} bg="info" className="me-2">
              {amenity}
            </Badge>
          ))}
        </div>
      </div>

      <div className="movies-list">
        {movies.map(movie => (
          <Card key={movie.id} className="mb-4">
            <Row className="g-0">
              <Col md={3}>
                <img
                  src={process.env.PUBLIC_URL + movie.poster}
                  className="img-fluid rounded-start"
                  alt={movie.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = process.env.PUBLIC_URL + '/images/posters/default.jpg';
                  }}
                />
              </Col>
              <Col md={9}>
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <Card.Title>{movie.title}</Card.Title>
                      <Card.Text>
                        <span className="me-3">
                          <FaStar className="text-warning me-1" />
                          {movie.rating}
                        </span>
                        <span className="me-3">{movie.genre}</span>
                        <span>
                          <FaClock className="me-1" />
                          {movie.duration}
                        </span>
                      </Card.Text>
                    </div>
                  </div>
                  
                  <div className="showtimes mt-3">
                    <h5>Showtimes:</h5>
                    <div className="time-slots">
                      {theater.showTimes.map((time, index) => (
                        <Button
                          key={index}
                          variant="outline-primary"
                          className="me-2 mb-2"
                          onClick={() => handleBookTicket(movie.id, time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default TheaterShowtimes;