import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Alert, Badge } from 'react-bootstrap';
import { FaChair, FaRupeeSign, FaQrcode, FaPrint, FaWallet, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
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
  const [activeSection, setActiveSection] = useState('premium');

  // Get data from navigation state
  const { showTime, selectedSeats: preSelectedSeats, totalAmount } = location.state || {};

  useEffect(() => {
    // Mock data
    const mockMovies = [
      {
        id: 'm1',
        title: "Kalki 2898 AD",
        duration: "2h 58m",
        genre: "Sci-Fi, Action",
        rating: "4.8/5",
        poster: "https://via.placeholder.com/300x450/0088cc/ffffff?text=Kalki+2898+AD",
        description: "A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces."
      },
      {
        id: 'm2',
        title: "Pushpa 2: The Rule",
        duration: "2h 45m",
        genre: "Action, Drama",
        rating: "4.7/5",
        poster: "https://via.placeholder.com/300x450/cc0000/ffffff?text=Pushpa+2",
        description: "The rule of Pushpa Raj begins as he takes control of the red sandalwood smuggling syndicate."
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
              { letter: 'B', seats: 8, booked: [] },
              { letter: 'C', seats: 8, booked: [5] }
            ]
          },
          {
            name: "Balcony",
            price: 250,
            rows: [
              { letter: 'D', seats: 10, booked: [3, 4] },
              { letter: 'E', seats: 10, booked: [] },
              { letter: 'F', seats: 10, booked: [7, 8] }
            ]
          },
          {
            name: "Regular",
            price: 150,
            rows: [
              { letter: 'G', seats: 12, booked: [5, 6] },
              { letter: 'H', seats: 12, booked: [] },
              { letter: 'I', seats: 12, booked: [1, 2, 11, 12] }
            ]
          }
        ]
      },
      {
        id: 't2',
        name: "INOX: Garuda Mall",
        location: "Magrath Road, Bangalore",
        amenities: ["Dolby 7.1", "3D Projection", "Food Court"],
        sections: [
          {
            name: "Premium",
            price: 320,
            rows: [
              { letter: 'A', seats: 8, booked: [1, 2] },
              { letter: 'B', seats: 8, booked: [] }
            ]
          },
          {
            name: "Balcony",
            price: 220,
            rows: [
              { letter: 'C', seats: 10, booked: [3, 4] },
              { letter: 'D', seats: 10, booked: [] }
            ]
          },
          {
            name: "Regular",
            price: 120,
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
      name: "MovieMania",
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
    // Simulate payment processing
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
        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading booking details...</p>
      </Container>
    );
  }

  return (
    <Container className="seat-booking-container py-4">
      {/* Back Button */}
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate(-1)}>
        <FaArrowLeft className="me-2" />Back
      </Button>

      {/* Movie Header */}
      <div className="movie-header mb-5">
        <Row className="align-items-center">
          <Col md={3} className="text-center mb-4 mb-md-0">
            <img src={movie.poster} alt={movie.title} className="movie-poster img-fluid rounded shadow" />
          </Col>
          <Col md={9}>
            <h1 className="movie-title">{movie.title}</h1>
            <div className="movie-meta mb-3">
              <Badge bg="success" className="me-2">
                <i className="fas fa-star me-1"></i>{movie.rating}
              </Badge>
              <span className="me-3">
                <i className="fas fa-clock me-1"></i>{movie.duration}
              </span>
              <span>{movie.genre}</span>
            </div>
            <p className="theater-info">
              <strong>{theater.name}</strong> • {theater.location}
            </p>
            <p className="show-time">
              <strong>Show Time:</strong> {showTime}
            </p>
          </Col>
        </Row>
      </div>

      {/* Seat Selection */}
      <div className="seat-selection-section mb-5">
        <h2 className="section-title mb-4">
          <i className="fas fa-chair me-2"></i>Select Your Seats
        </h2>
        
        <div className="screen-display text-center mb-4">
          <div className="screen-label">SCREEN THIS WAY</div>
          <div className="screen-visual"></div>
        </div>

        {/* Section Selector */}
        <div className="section-selector mb-4">
          <div className="d-flex justify-content-center flex-wrap">
            {theater.sections.map((section, i) => (
              <Button
                key={i}
                variant={activeSection === section.name.toLowerCase() ? "primary" : "outline-primary"}
                className="me-2 mb-2 section-btn"
                onClick={() => setActiveSection(section.name.toLowerCase())}
              >
                {section.name} (₹{section.price})
              </Button>
            ))}
          </div>
        </div>

        <div className="seat-map-container">
          {theater.sections
            .filter(section => section.name.toLowerCase() === activeSection)
            .map((section, i) => (
              <div key={i} className="seat-section">
                <div className="section-header">
                  <h4>{section.name} Seats</h4>
                  <span className="section-price">₹{section.price}</span>
                </div>
                
                {section.rows.map((row, j) => (
                  <div key={j} className="seat-row d-flex align-items-center mb-2">
                    <div className="row-label">{row.letter}</div>
                    <div className="seats-row d-flex">
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
                            title={isBooked ? 'Already booked' : `Seat ${row.letter}${k + 1}`}
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
        <div className="seat-legend mt-4 d-flex justify-content-center flex-wrap">
          <div className="legend-item d-flex align-items-center me-4 mb-2">
            <div className="legend-color available me-2"></div>
            <span>Available</span>
          </div>
          <div className="legend-item d-flex align-items-center me-4 mb-2">
            <div className="legend-color selected me-2"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item d-flex align-items-center mb-2">
            <div className="legend-color booked me-2"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div 
            className="booking-summary p-4 rounded shadow"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="summary-header d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Your Selection</h3>
              <span className="seat-count badge bg-primary">
                {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}
              </span>
            </div>
            
            <div className="selected-seats mb-3">
              {selectedSeats.map((pos, i) => (
                <Badge key={i} bg="outline-primary" className="me-2 seat-badge">
                  {pos}
                </Badge>
              ))}
            </div>
            
            <div className="total-amount d-flex justify-content-between align-items-center mb-4">
              <span className="fs-5">Total Amount:</span>
              <span className="amount fs-4 fw-bold text-success">₹{calculateTotal()}</span>
            </div>
            
            <Button 
              variant="danger" 
              size="lg" 
              onClick={handlePayment}
              className="book-btn w-100 py-3"
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
            <h4 className="mb-3">{movie.title}</h4>
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
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              <>
                <FaCheckCircle className="me-2" />
                Payment Completed
              </>
            )}
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
                <h3 className="text-primary">MovieMania</h3>
                <p className="text-muted">Your Digital Ticket</p>
              </div>
              
              <div className="ticket-content">
                <Row>
                  <Col md={8}>
                    <div className="ticket-details">
                      <div className="detail-row d-flex justify-content-between mb-2">
                        <span>Movie:</span>
                        <strong>{ticketDetails.movie}</strong>
                      </div>
                      <div className="detail-row d-flex justify-content-between mb-2">
                        <span>Theater:</span>
                        <span>{ticketDetails.theater}</span>
                      </div>
                      <div className="detail-row d-flex justify-content-between mb-2">
                        <span>Location:</span>
                        <span>{ticketDetails.location}</span>
                      </div>
                      <div className="detail-row d-flex justify-content-between mb-2">
                        <span>Date & Time:</span>
                        <span>{ticketDetails.date} • {ticketDetails.showTime}</span>
                      </div>
                      <div className="detail-row d-flex justify-content-between mb-2">
                        <span>Seats:</span>
                        <span className="text-primary fw-bold">{ticketDetails.seats}</span>
                      </div>
                      <div className="detail-row d-flex justify-content-between mb-2">
                        <span>Facilities:</span>
                        <span>{ticketDetails.amenities}</span>
                      </div>
                      <div className="detail-row d-flex justify-content-between mb-2">
                        <span>Booking ID:</span>
                        <span className="text-danger">{ticketDetails.bookingId}</span>
                      </div>
                      <div className="detail-row d-flex justify-content-between mb-2">
                        <span>Booked By:</span>
                        <span>{ticketDetails.userName}</span>
                      </div>
                      <div className="detail-row d-flex justify-content-between mb-2 total pt-2 border-top">
                        <span>Amount Paid:</span>
                        <span className="text-success fw-bold">₹{ticketDetails.total}</span>
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
          <Button variant="success" onClick={() => navigate('/')}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .seat-booking-container {
          max-width: 1200px;
        }
        .movie-header {
          background: linear-gradient(rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.03));
          padding: 2rem;
          border-radius: 12px;
        }
        .movie-title {
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }
        .movie-poster {
          max-height: 350px;
          object-fit: cover;
        }
        .theater-info {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .show-time {
          font-size: 1.1rem;
          margin-bottom: 0;
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
        .section-selector {
          padding: 1rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .section-btn {
          border-radius: 50px;
          padding: 0.5rem 1rem;
        }
        .seat-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e9ecef;
        }
        .section-header h4 {
          margin: 0;
          color: #1a1a1a;
          font-weight: 600;
        }
        .section-price {
          font-weight: 700;
          color: #28a745;
          font-size: 1.1rem;
        }
        .row-label {
          width: 30px;
          text-align: center;
          font-weight: 600;
          color: #495057;
          margin-right: 15px;
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
          cursor: pointer;
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
        .booking-summary {
          background-color: white;
          margin-top: 2rem;
          position: sticky;
          bottom: 20px;
          z-index: 100;
        }
        .seat-badge {
          font-size: 0.9rem;
          padding: 0.5rem 0.8rem;
        }
        .book-btn {
          border-radius: 50px;
          font-weight: 600;
        }
        .ticket-container {
          padding: 1rem;
        }
        .detail-row {
          padding: 0.5rem 0;
        }
        .detail-row.total {
          font-size: 1.1rem;
        }
        .qr-code-container {
          display: flex;
          justify-content: center;
        }
      `}</style>
    </Container>
  );
};

export default BookTickets;
