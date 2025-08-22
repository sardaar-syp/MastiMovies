import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Badge, Modal } from 'react-bootstrap';
import { FaStar, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaChair } from 'react-icons/fa';
import './MovieDetail.css';

const MovieDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Mock seat layout data
  const seatLayout = {
    premium: {
      rows: [
        { letter: 'A', seats: 10, booked: [3, 4] },
        { letter: 'B', seats: 10, booked: [] }
      ],
      price: 350
    },
    balcony: {
      rows: [
        { letter: 'C', seats: 12, booked: [1, 2] },
        { letter: 'D', seats: 12, booked: [] }
      ],
      price: 250
    },
    regular: {
      rows: [
        { letter: 'E', seats: 15, booked: [5, 6, 7] },
        { letter: 'F', seats: 15, booked: [] }
      ],
      price: 150
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data
        const mockMovies = [
          {
            id: 'm1',
            title: "Avengers: Endgame",
            duration: "3h 2m",
            genre: "Action, Adventure, Sci-Fi",
            rating: "4.8/5",
            poster: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg",
            description: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
            director: "Anthony Russo, Joe Russo",
            cast: "Robert Downey Jr., Chris Evans, Mark Ruffalo",
            releaseDate: "2019-04-26"
          }
        ];

        const mockTheaters = [
          { 
            id: 't1', 
            name: "PVR Cinemas: Forum Mall", 
            location: "Koramangala, Bangalore",
            distance: "0.5 km",
            showTimes: ['10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM']
          }
        ];

        const selectedMovie = mockMovies.find(m => m.id === id);
        if (!selectedMovie) {
          throw new Error('Movie not found');
        }

        setMovie(selectedMovie);
        setTheaters(mockTheaters);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBookTicket = (theater, time) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedTheater(theater);
    setSelectedTime(time);
    setShowSeatModal(true);
  };

  const toggleSeatSelection = (section, row, seatNumber) => {
    const seatId = `${section}-${row}-${seatNumber}`;
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId) 
        : [...prev, seatId]
    );
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const [section] = seatId.split('-');
      return total + (seatLayout[section]?.price || 0);
    }, 0);
  };

  const confirmBooking = () => {
    navigate(`/book/${id}/${selectedTheater.id}`, {
      state: {
        showTime: selectedTime,
        movieTitle: movie.title,
        theaterName: selectedTheater.name,
        selectedSeats,
        totalAmount: calculateTotal()
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
    <Container className="movie-detail-container">
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Img 
              variant="top" 
              src={movie.poster} 
              alt={movie.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/posters/default.jpg';
              }}
            />
          </Card>
        </Col>
        <Col md={8}>
          <div className="movie-info">
            <h1>{movie.title}</h1>
            <div className="movie-meta mb-3">
              <span className="me-3">
                <FaStar className="text-warning me-1" />
                {movie.rating}
              </span>
              <span className="me-3">
                <FaClock className="me-1" />
                {movie.duration}
              </span>
              <span>
                <FaCalendarAlt className="me-1" />
                {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="movie-description mb-4">
              <h4>Synopsis</h4>
              <p>{movie.description}</p>
            </div>
          </div>
        </Col>
      </Row>

      <div className="theaters-section mt-5">
        <h2 className="section-title">Now Showing At</h2>
        <Row>
          {theaters.map(theater => (
            <Col md={6} key={theater.id} className="mb-4">
              <Card className="theater-card h-100">
                <Card.Body>
                  <Card.Title>{theater.name}</Card.Title>
                  <Card.Text className="text-muted">
                    <FaMapMarkerAlt className="me-1" />
                    {theater.location} • {theater.distance} away
                  </Card.Text>
                  
                  <div className="showtimes mt-3">
                    <h5>Showtimes:</h5>
                    <div className="time-slots">
                      {theater.showTimes.map((time, index) => (
                        <Button
                          key={index}
                          variant="outline-primary"
                          className="me-2 mb-2"
                          onClick={() => handleBookTicket(theater, time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Seat Selection Modal */}
      <Modal 
        show={showSeatModal} 
        onHide={() => setShowSeatModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Seats for {movie?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="screen-display text-center mb-4">
            <div className="screen-label">SCREEN</div>
          </div>
          
          {Object.entries(seatLayout).map(([section, data]) => (
            <div key={section} className="seat-section mb-4">
              <div className="section-header d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-capitalize mb-0">{section} Seats</h4>
                <span className="section-price">₹{data.price}</span>
              </div>
              
              {data.rows.map(row => (
                <div key={row.letter} className="seat-row mb-2">
                  <div className="row-label me-2">{row.letter}</div>
                  <div className="seats-row d-flex">
                    {Array.from({ length: row.seats }).map((_, index) => {
                      const seatNumber = index + 1;
                      const isBooked = row.booked.includes(seatNumber);
                      const seatId = `${section}-${row.letter}-${seatNumber}`;
                      const isSelected = selectedSeats.includes(seatId);
                      
                      return (
                        <button
                          key={index}
                          className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                          onClick={() => !isBooked && toggleSeatSelection(section, row.letter, seatNumber)}
                          disabled={isBooked}
                        >
                          <FaChair className="seat-icon" />
                          <span className="seat-number">{seatNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
          
          <div className="seat-legend mt-4">
            <div className="legend-item d-inline-block me-3">
              <div className="legend-color available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item d-inline-block me-3">
              <div className="legend-color selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item d-inline-block me-3">
              <div className="legend-color booked"></div>
              <span>Booked</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-100 d-flex justify-content-between align-items-center">
            <div>
              <strong>Selected:</strong> {selectedSeats.length} seats
              <span className="ms-3">
                <strong>Total:</strong> ₹{calculateTotal()}
              </span>
            </div>
            <Button 
              variant="primary" 
              onClick={confirmBooking}
              disabled={selectedSeats.length === 0}
            >
              Confirm Booking
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MovieDetail;