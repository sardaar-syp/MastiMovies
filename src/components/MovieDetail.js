import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Badge, Modal, Spinner } from 'react-bootstrap';
import { FaStar, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaChair, FaRupeeSign } from 'react-icons/fa';
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
  const [selectedSection, setSelectedSection] = useState('premium');

  // Mock seat layout data
  const seatLayout = {
    premium: {
      rows: [
        { letter: 'A', seats: 10, booked: [3, 4] },
        { letter: 'B', seats: 10, booked: [1, 2] },
        { letter: 'C', seats: 10, booked: [] }
      ],
      price: 350
    },
    balcony: {
      rows: [
        { letter: 'D', seats: 12, booked: [1, 2] },
        { letter: 'E', seats: 12, booked: [] },
        { letter: 'F', seats: 12, booked: [5, 6] }
      ],
      price: 250
    },
    regular: {
      rows: [
        { letter: 'G', seats: 15, booked: [5, 6, 7] },
        { letter: 'H', seats: 15, booked: [] },
        { letter: 'I', seats: 15, booked: [10, 11] }
      ],
      price: 150
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data with more movies and theaters
        const mockMovies = [
          {
            id: 'm1',
            title: "Kalki 2898 AD",
            duration: "2h 58m",
            genre: "Sci-Fi, Action",
            rating: "4.8/5",
            poster: "https://via.placeholder.com/300x450/0088cc/ffffff?text=Kalki+2898+AD",
            description: "A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.",
            director: "Nag Ashwin",
            cast: "Prabhas, Amitabh Bachchan, Kamal Haasan, Deepika Padukone",
            releaseDate: "2024-06-27",
            languages: "Hindi, Telugu, Tamil"
          },
          {
            id: 'm2',
            title: "Pushpa 2: The Rule",
            duration: "2h 45m",
            genre: "Action, Drama",
            rating: "4.7/5",
            poster: "https://via.placeholder.com/300x450/cc0000/ffffff?text=Pushpa+2",
            description: "The rule of Pushpa Raj begins as he takes control of the red sandalwood smuggling syndicate.",
            director: "Sukumar",
            cast: "Allu Arjun, Rashmika Mandanna, Fahadh Faasil",
            releaseDate: "2024-08-15",
            languages: "Hindi, Telugu, Tamil"
          },
          {
            id: 'm3',
            title: "Singham Again",
            duration: "2h 35m",
            genre: "Action, Thriller",
            rating: "4.6/5",
            poster: "https://via.placeholder.com/300x450/ff9900/000000?text=Singham+Again",
            description: "The third installment in the Singham franchise, with Bajirao Singham taking on a new powerful enemy.",
            director: "Rohit Shetty",
            cast: "Ajay Devgn, Kareena Kapoor, Deepika Padukone",
            releaseDate: "2024-08-15",
            languages: "Hindi"
          }
        ];

        const mockTheaters = [
          { 
            id: 't1', 
            name: "PVR Cinemas: Forum Mall", 
            location: "Koramangala, Bangalore",
            distance: "0.5 km",
            amenities: ["Dolby Atmos", "4K Projection", "Recliner Seats"],
            showTimes: ['10:00 AM', '1:30 PM', '4:00 PM', '7:30 PM', '10:30 PM']
          },
          { 
            id: 't2', 
            name: "INOX: Garuda Mall", 
            location: "Magrath Road, Bangalore",
            distance: "1.2 km",
            amenities: ["Dolby 7.1", "3D Projection", "Food Court"],
            showTimes: ['10:15 AM', '1:45 PM', '4:30 PM', '7:00 PM', '10:00 PM']
          },
          { 
            id: 't3', 
            name: "Cinepolis: Phoenix Marketcity", 
            location: "Whitefield, Bangalore",
            distance: "5.3 km",
            amenities: ["IMAX", "Dolby Cinema", "Premium Lounger"],
            showTimes: ['9:30 AM', '12:45 PM', '4:15 PM', '7:45 PM', '11:00 PM']
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
        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading movie details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="d-flex align-items-center">
          <i className="fas fa-exclamation-circle me-2"></i>
          <div>{error}</div>
        </Alert>
        <Button variant="primary" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left me-2"></i>Go Back Home
        </Button>
      </Container>
    );
  }

  return (
    <Container className="movie-detail-container py-4">
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left me-2"></i>Back
      </Button>

      <Row>
        <Col md={4}>
          <Card className="movie-poster-card mb-4">
            <Card.Img 
              variant="top" 
              src={movie.poster} 
              alt={movie.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x450/333333/ffffff?text=Poster+Not+Found';
              }}
              className="movie-poster-img"
            />
            <Card.Body className="text-center">
              <Button variant="primary" size="lg" className="w-100">
                <i className="fas fa-play-circle me-2"></i>Watch Trailer
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <div className="movie-info">
            <div className="d-flex justify-content-between align-items-start">
              <h1 className="movie-title">{movie.title}</h1>
              <Badge bg="success" className="rating-badge">
                <FaStar className="me-1" />{movie.rating}
              </Badge>
            </div>
            
            <div className="movie-meta mb-3">
              <span className="me-3">
                <FaClock className="me-1" />
                {movie.duration}
              </span>
              <span className="me-3">
                <FaCalendarAlt className="me-1" />
                {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="badge bg-info text-dark">{movie.languages}</span>
            </div>

            <div className="genre-badges mb-3">
              {movie.genre.split(', ').map((genre, index) => (
                <Badge key={index} bg="outline-secondary" className="me-2 genre-badge">
                  {genre}
                </Badge>
              ))}
            </div>

            <div className="movie-description mb-4">
              <h4>Synopsis</h4>
              <p className="synopsis-text">{movie.description}</p>
            </div>

            <Row className="movie-details">
              <Col sm={6}>
                <div className="detail-item mb-3">
                  <h5>Director</h5>
                  <p>{movie.director}</p>
                </div>
              </Col>
              <Col sm={6}>
                <div className="detail-item mb-3">
                  <h5>Cast</h5>
                  <p className="cast-text">{movie.cast}</p>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <div className="theaters-section mt-5">
        <h2 className="section-title mb-4">
          <i className="fas fa-map-marker-alt me-2"></i>Now Showing At
        </h2>
        
        {theaters.length === 0 ? (
          <Alert variant="info" className="text-center">
            No showtimes available for this movie in your area.
          </Alert>
        ) : (
          <Row>
            {theaters.map(theater => (
              <Col lg={6} key={theater.id} className="mb-4">
                <Card className="theater-card h-100">
                  <Card.Body>
                    <Card.Title className="theater-name">{theater.name}</Card.Title>
                    <Card.Text className="text-muted theater-location">
                      <FaMapMarkerAlt className="me-1" />
                      {theater.location} • {theater.distance} away
                    </Card.Text>
                    
                    <div className="amenities mb-3">
                      {theater.amenities.map((amenity, index) => (
                        <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="showtimes mt-4">
                      <h6>Showtimes:</h6>
                      <div className="time-slots">
                        {theater.showTimes.map((time, index) => (
                          <Button
                            key={index}
                            variant="outline-primary"
                            className="me-2 mb-2 time-slot-btn"
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
        )}
      </div>

      {/* Seat Selection Modal */}
      <Modal 
        show={showSeatModal} 
        onHide={() => {
          setShowSeatModal(false);
          setSelectedSeats([]);
        }}
        size="xl"
        centered
        className="seat-selection-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div>Select Seats for {movie?.title}</div>
            <div className="modal-subtitle">
              {selectedTheater?.name} • {selectedTime} • {new Date().toLocaleDateString()}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="screen-display text-center mb-4">
            <div className="screen-label">SCREEN THIS WAY</div>
            <div className="screen-visual"></div>
          </div>
          
          <div className="section-selector mb-4">
            <div className="d-flex justify-content-center">
              {Object.entries(seatLayout).map(([section, data]) => (
                <Button
                  key={section}
                  variant={selectedSection === section ? "primary" : "outline-primary"}
                  className="me-2 section-btn"
                  onClick={() => setSelectedSection(section)}
                >
                  {section.toUpperCase()} (₹{data.price})
                </Button>
              ))}
            </div>
          </div>
          
          <div className="seat-map">
            {seatLayout[selectedSection]?.rows.map(row => (
              <div key={row.letter} className="seat-row mb-2 d-flex align-items-center">
                <div className="row-label">{row.letter}</div>
                <div className="seats-row d-flex">
                  {Array.from({ length: row.seats }).map((_, index) => {
                    const seatNumber = index + 1;
                    const isBooked = row.booked.includes(seatNumber);
                    const seatId = `${selectedSection}-${row.letter}-${seatNumber}`;
                    const isSelected = selectedSeats.includes(seatId);
                    
                    return (
                      <button
                        key={index}
                        className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => !isBooked && toggleSeatSelection(selectedSection, row.letter, seatNumber)}
                        disabled={isBooked}
                        title={isBooked ? 'Already booked' : `Seat ${row.letter}${seatNumber}`}
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
          
          <div className="seat-legend mt-4 d-flex justify-content-center">
            <div className="legend-item d-flex align-items-center me-4">
              <div className="legend-color available me-2"></div>
              <span>Available</span>
            </div>
            <div className="legend-item d-flex align-items-center me-4">
              <div className="legend-color selected me-2"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item d-flex align-items-center">
              <div className="legend-color booked me-2"></div>
              <span>Booked</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-100 d-flex justify-content-between align-items-center">
            <div className="booking-summary">
              <div>
                <strong>Selected {selectedSeats.length} seats</strong>
              </div>
              <div className="text-muted">
                {selectedSeats.map(seat => {
                  const [section, row, number] = seat.split('-');
                  return `${row}${number} (${section})`;
                }).join(', ')}
              </div>
            </div>
            <div className="d-flex align-items-center">
              <span className="total-amount me-3">
                <FaRupeeSign className="me-1" />
                <strong>{calculateTotal()}</strong>
              </span>
              <Button 
                variant="primary" 
                onClick={confirmBooking}
                disabled={selectedSeats.length === 0}
                size="lg"
              >
                <i className="fas fa-ticket-alt me-2"></i>
                Book Now
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      <style>{`
        .movie-detail-container {
          max-width: 1200px;
        }
        .movie-title {
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }
        .movie-poster-card {
          border: none;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        .movie-poster-img {
          height: 450px;
          object-fit: cover;
        }
        .rating-badge {
          font-size: 1.1rem;
          padding: 0.5rem 0.8rem;
        }
        .genre-badge {
          border: 1px solid #dee2e6;
          padding: 0.5rem 0.8rem;
          font-weight: 500;
        }
        .synopsis-text {
          line-height: 1.7;
          color: #4a4a4a;
        }
        .theater-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s;
        }
        .theater-card:hover {
          transform: translateY(-5px);
        }
        .theater-name {
          color: #1a1a1a;
          font-weight: 600;
        }
        .theater-location {
          font-size: 0.9rem;
        }
        .time-slot-btn {
          border-radius: 50px;
          padding: 0.5rem 1rem;
        }
        .section-title {
          position: relative;
          padding-bottom: 15px;
          font-weight: 700;
          color: #1a1a1a;
        }
        .section-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
          border-radius: 2px;
        }
        .seat {
          width: 40px;
          height: 40px;
          margin: 4px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background-color: #f8f9fa;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          transition: all 0.2s;
        }
        .seat:hover:not(.booked) {
          background-color: #e9ecef;
          transform: scale(1.05);
        }
        .seat.selected {
          background-color: #4caf50;
          color: white;
          border-color: #4caf50;
        }
        .seat.booked {
          background-color: #dc3545;
          color: white;
          border-color: #dc3545;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .seat-icon {
          font-size: 0.8rem;
        }
        .seat-number {
          font-size: 0.6rem;
          margin-top: 2px;
        }
        .screen-display {
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .screen-label {
          font-size: 0.9rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }
        .screen-visual {
          height: 8px;
          background: linear-gradient(90deg, #6c757d, #adb5bd);
          border-radius: 4px;
          margin: 0 auto;
          width: 80%;
        }
        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }
        .legend-color.available {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
        }
        .legend-color.selected {
          background-color: #4caf50;
        }
        .legend-color.booked {
          background-color: #dc3545;
        }
        .section-btn {
          border-radius: 50px;
          padding: 0.5rem 1rem;
        }
        .modal-subtitle {
          font-size: 0.9rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }
        .total-amount {
          font-size: 1.5rem;
          color: #28a745;
        }
        .row-label {
          width: 24px;
          text-align: center;
          font-weight: 600;
          color: #495057;
        }
        .cast-text {
          line-height: 1.5;
        }
      `}</style>
    </Container>
  );
};

export default MovieDetail;
