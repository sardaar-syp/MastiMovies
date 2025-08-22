import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Alert } from 'react-bootstrap';
import { FaChair, FaRupeeSign, FaQrcode, FaPrint, FaWallet, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import './SeatBooking.css';

const BookTickets = ({ user }) => {
  const { movieId, theaterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [movie, setMovie] = useState(null);
  const [theater, setTheater] = useState(null);

  // Get data from navigation state
  const { showTime, selectedSeats: preSelectedSeats, totalAmount } = location.state || {};

  useEffect(() => {
    // Mock data
    const mockMovies = [
      {
        id: 'm1',
        title: "Avengers: Endgame",
        duration: "3h 2m",
        genre: "Action, Adventure, Sci-Fi",
        rating: "4.8/5",
        poster: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg"
      }
    ];

    const mockTheaters = [
      {
        id: 't1',
        name: "PVR Cinemas: Forum Mall",
        location: "Koramangala, Bangalore",
        amenities: ["Dolby Atmos", "4K Projection", "Recliner Seats"],
        sections: [
          {
            name: "Premium",
            price: 350,
            rows: [
              { letter: 'A', seats: 8, booked: [1, 2] },
              { letter: 'B', seats: 8, booked: [] }
            ]
          },
          {
            name: "Balcony",
            price: 250,
            rows: [
              { letter: 'C', seats: 10, booked: [3, 4] },
              { letter: 'D', seats: 10, booked: [] }
            ]
          },
          {
            name: "Regular",
            price: 150,
            rows: [
              { letter: 'E', seats: 12, booked: [5, 6] },
              { letter: 'F', seats: 12, booked: [] }
            ]
          }
        ]
      }
    ];

    const selectedMovie = mockMovies.find(m => m.id === movieId);
    const selectedTheater = mockTheaters.find(t => t.id === theaterId);

    if (!selectedMovie || !selectedTheater) {
      toast.error("Invalid movie or theater selection");
      navigate('/');
      return;
    }

    setMovie(selectedMovie);
    setTheater(selectedTheater);

    // Set pre-selected seats if coming from MovieDetail
    if (preSelectedSeats) {
      setSelectedSeats(preSelectedSeats);
    }
  }, [movieId, theaterId, navigate, preSelectedSeats]);

  const generateSeats = () => {
    return theater.sections.flatMap(section => 
      section.rows.flatMap(row => 
        Array.from({ length: row.seats }, (_, i) => ({
          number: i + 1,
          row: row.letter,
          section: section.name,
          price: section.price,
          booked: row.booked.includes(i + 1),
          position: `${row.letter}${i + 1}`
        }))
      )
    );
  };

  const seats = theater ? generateSeats() : [];
  const bookedSeatsNumbers = seats.filter(s => s.booked).map(s => s.position);

  const toggleSeatSelection = (seatPosition) => {
    if (bookedSeatsNumbers.includes(seatPosition)) return;
    
    setSelectedSeats(prev => 
      prev.includes(seatPosition)
        ? prev.filter(pos => pos !== seatPosition)
        : [...prev, seatPosition]
    );
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatPos) => {
      const seat = seats.find(s => s.position === seatPos);
      return total + (seat?.price || 0);
    }, 0);
  };

  const generateUPIQrData = () => {
    return JSON.stringify({
      type: "upi",
      payee: "theater@upi",
      name: "MastiMovies",
      amount: calculateTotal(),
      note: `${movie.title} - ${showTime}`
    });
  };

  const handlePayment = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    setLoading(true);
    setTimeout(() => {
      generateTicket();
      setShowPaymentModal(false);
      setShowTicketModal(true);
      setLoading(false);
    }, 2000);
  };

  const generateTicket = () => {
    const now = new Date();
    const bookingId = `BK${Math.floor(100000 + Math.random() * 900000)}`;
    
    setTicketDetails({
      movie: movie.title,
      theater: theater.name,
      location: theater.location,
      showTime: showTime,
      date: now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      seats: selectedSeats.join(', '),
      total: calculateTotal(),
      bookingId: bookingId,
      userName: user?.displayName || 'Guest',
      userEmail: user?.email || '',
      amenities: theater.amenities.join(', '),
      qrData: JSON.stringify({
        bookingId: bookingId,
        movie: movie.title,
        theater: theater.name,
        showTime: showTime,
        seats: selectedSeats.join(', '),
        total: calculateTotal(),
        userName: user?.displayName,
        userEmail: user?.email
      })
    });

    setBookedSeats([...bookedSeats, ...selectedSeats]);
  };

  if (!movie || !theater) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="seat-booking-container">
      {/* Movie Header */}
      <div className="movie-header">
        <img src={movie.poster} alt={movie.title} className="movie-poster" />
        <div className="movie-info">
          <h1>{movie.title}</h1>
          <div className="movie-meta">
            <span>{movie.rating} ★</span>
            <span>{movie.duration}</span>
            <span>{movie.genre}</span>
          </div>
          <p className="theater-info">
            <strong>{theater.name}</strong> • {theater.location}
          </p>
          <p className="show-time">
            <strong>Show Time:</strong> {showTime}
          </p>
        </div>
      </div>

      {/* Seat Selection */}
      <div className="seat-selection-section">
        <h3>Select Your Seats</h3>
        <div className="screen-display">
          <div className="screen-label">SCREEN</div>
        </div>

        <div className="seat-map-container">
          {theater.sections.map((section, i) => (
            <div key={i} className="seat-section">
              <div className="section-header">
                <h4>{section.name}</h4>
                <span className="section-price">₹{section.price}</span>
              </div>
              
              {section.rows.map((row, j) => (
                <div key={j} className="seat-row">
                  <div className="row-label">{row.letter}</div>
                  <div className="seats-row">
                    {Array.from({ length: row.seats }).map((_, k) => {
                      const seatPosition = `${row.letter}${k + 1}`;
                      const isBooked = bookedSeatsNumbers.includes(seatPosition) || bookedSeats.includes(seatPosition);
                      const isSelected = selectedSeats.includes(seatPosition);
                      
                      return (
                        <motion.div
                          key={k}
                          className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                          onClick={() => !isBooked && toggleSeatSelection(seatPosition)}
                          whileHover={!isBooked ? { scale: 1.05 } : {}}
                          whileTap={!isBooked ? { scale: 0.95 } : {}}
                        >
                          <FaChair className="seat-icon" />
                          <span className="seat-number">{k + 1}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="seat-legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div 
            className="booking-summary"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="summary-header">
              <h3>Your Selection</h3>
              <span className="seat-count">{selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}</span>
            </div>
            
            <div className="selected-seats">
              {selectedSeats.map((pos, i) => (
                <span key={i} className="seat-badge">{pos}</span>
              ))}
            </div>
            
            <div className="total-amount">
              <span>Total Amount:</span>
              <span className="amount">₹{calculateTotal()}</span>
            </div>
            
            <Button 
              variant="danger" 
              size="lg" 
              onClick={handlePayment}
              className="book-btn"
            >
              <FaWallet className="me-2" />
              Proceed to Payment
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Complete Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="payment-details">
            <h4 className="mb-4">{movie.title}</h4>
            <p className="text-muted">{theater.name} • {showTime}</p>
            
            <div className="payment-amount my-4">
              <h2>₹{calculateTotal()}</h2>
              <p className="text-muted">Total Amount</p>
            </div>
            
            <div className="upi-payment">
              <h5><FaQrcode className="me-2" /> Pay via UPI</h5>
              <div className="qr-code-container my-3">
                <QRCodeSVG 
                  value={generateUPIQrData()}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-muted">Scan this QR code with any UPI app</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={confirmPayment} disabled={loading}>
            {loading ? 'Processing...' : 'Payment Completed'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ticket Modal */}
      <Modal show={showTicketModal} onHide={() => setShowTicketModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🎉 Booking Confirmed!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ticketDetails && (
            <div className="ticket-container">
              <div className="ticket-header text-center mb-4">
                <h3 className="text-primary">MastiMovies</h3>
                <p className="text-muted">Your Digital Ticket</p>
              </div>
              
              <div className="ticket-content">
                <Row>
                  <Col md={8}>
                    <div className="ticket-details">
                      <div className="detail-row">
                        <span>Movie:</span>
                        <strong>{ticketDetails.movie}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Theater:</span>
                        <span>{ticketDetails.theater}</span>
                      </div>
                      <div className="detail-row">
                        <span>Location:</span>
                        <span>{ticketDetails.location}</span>
                      </div>
                      <div className="detail-row">
                        <span>Date & Time:</span>
                        <span>{ticketDetails.date} • {ticketDetails.showTime}</span>
                      </div>
                      <div className="detail-row">
                        <span>Seats:</span>
                        <span className="text-primary">{ticketDetails.seats}</span>
                      </div>
                      <div className="detail-row">
                        <span>Facilities:</span>
                        <span>{ticketDetails.amenities}</span>
                      </div>
                      <div className="detail-row">
                        <span>Booking ID:</span>
                        <span className="text-danger">{ticketDetails.bookingId}</span>
                      </div>
                      <div className="detail-row">
                        <span>Booked By:</span>
                        <span>{ticketDetails.userName}</span>
                      </div>
                      <div className="detail-row total">
                        <span>Amount Paid:</span>
                        <span className="text-success">₹{ticketDetails.total}</span>
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="ticket-qr text-center">
                      <QRCodeSVG 
                        value={ticketDetails.qrData}
                        size={150}
                        level="H"
                        includeMargin={true}
                      />
                      <p className="text-muted mt-2">Scan at theater</p>
                    </div>
                  </Col>
                </Row>
              </div>
              
              <div className="ticket-footer text-center mt-4">
                <p className="text-muted">
                  <small>
                    Booked on {ticketDetails.date} at {ticketDetails.time}
                  </small>
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="primary" onClick={() => window.print()} className="me-3">
            <FaPrint className="me-2" />
            Print Ticket
          </Button>
          <Button variant="success" onClick={() => navigate('/bookings')}>
            View My Bookings
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookTickets;