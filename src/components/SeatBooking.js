import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Row, Col, Badge } from 'react-bootstrap';
import { FaChair, FaRupeeSign, FaTimes, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import './SeatBooking.css';

const SeatBooking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [showTime, setShowTime] = useState('06:15 PM');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Theater layout with different pricing tiers
  const theaterLayout = [
    {
      category: "Premium Balcony",
      price: 250,
      rows: [
        { name: 'A', seats: [1, 2, 3, 4], booked: [1, 2] },
        { name: 'B', seats: [5, 6, 7, 8], booked: [] },
        { name: 'C', seats: [9, 10, 11, 12], booked: [9] },
        { name: 'D', seats: [13, 14, 15, 16], booked: [13, 14] }
      ]
    },
    {
      category: "Premium Sofa",
      price: 350,
      rows: [
        { name: 'A', seats: [17, 18, 19], booked: [17] },
        { name: 'B', seats: [20, 21, 22], booked: [] },
        { name: 'C', seats: [23, 24], booked: [23] }
      ]
    },
    {
      category: "First Class",
      price: 200,
      rows: [
        { name: 'A', seats: [25, 26, 27, 28], booked: [] },
        { name: 'B', seats: [29, 30, 31, 32], booked: [29] }
      ]
    }
  ];

  // Initialize booked seats
  useEffect(() => {
    const allBooked = theaterLayout.flatMap(section => 
      section.rows.flatMap(row => row.booked)
    );
    setBookedSeats(allBooked);
  }, []);

  const toggleSeatSelection = (seatNumber, sectionPrice) => {
    if (bookedSeats.includes(seatNumber)) return;
    
    setSelectedSeats(prev => {
      const existingSeat = prev.find(s => s.number === seatNumber);
      if (existingSeat) {
        return prev.filter(s => s.number !== seatNumber);
      } else {
        return [...prev, { number: seatNumber, price: sectionPrice }];
      }
    });
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleShowtimeChange = (time) => {
    setShowTime(time);
    setSelectedSeats([]);
    // In a real app, you would fetch booked seats for the new showtime
  };

  const confirmBooking = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    setShowConfirmModal(true);
  };

  const completeBooking = () => {
    setBookingInProgress(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(
        <div>
          <h6>Booking Confirmed!</h6>
          <p>Seats: {selectedSeats.map(s => s.number).join(', ')}</p>
          <p>Total: ₹{calculateTotal()}</p>
        </div>
      );
      setBookedSeats([...bookedSeats, ...selectedSeats.map(s => s.number)]);
      setSelectedSeats([]);
      setBookingInProgress(false);
      setShowConfirmModal(false);
    }, 1500);
  };

  return (
    <Container className="seat-booking-container">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="booking-header mb-4">
          <h2 className="movie-title">War 2 (Telugu)</h2>
          <div className="theater-info">
            <p>Annapurna Theater A/C Dts 2K: Mangalagiri</p>
            <p>Friday, 15 August 2025</p>
          </div>
        </div>
        
        <div className="showtimes mb-4">
          <h4>Select Show Time</h4>
          <div className="time-slots">
            <Button 
              variant={showTime === '06:15 PM' ? 'primary' : 'outline-primary'}
              className="time-slot"
              onClick={() => handleShowtimeChange('06:15 PM')}
            >
              06:15 PM
            </Button>
            <Button 
              variant={showTime === '09:30 PM' ? 'primary' : 'outline-primary'}
              className="time-slot"
              onClick={() => handleShowtimeChange('09:30 PM')}
            >
              09:30 PM
            </Button>
          </div>
        </div>

        <div className="screen mb-4">
          <div className="screen-label">SCREEN</div>
          <div className="screen-line"></div>
        </div>
        
        <div className="seat-sections">
          {theaterLayout.map((section, sectionIndex) => (
            <motion.div 
              key={sectionIndex}
              className="seat-section mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <div className="section-header">
                <h4 className="section-title">{section.category}</h4>
                <Badge bg="info" className="price-badge">
                  <FaRupeeSign /> {section.price}
                </Badge>
              </div>
              
              <div className="seat-grid">
                {section.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="seat-row">
                    <div className="row-label">{row.name}</div>
                    <div className="seats-in-row">
                      {row.seats.map((seat, seatIndex) => {
                        const isBooked = bookedSeats.includes(seat);
                        const isSelected = selectedSeats.some(s => s.number === seat);
                        return (
                          <motion.div
                            key={seatIndex}
                            className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => !isBooked && toggleSeatSelection(seat, section.price)}
                            whileHover={!isBooked ? { scale: 1.1 } : {}}
                            whileTap={!isBooked ? { scale: 0.9 } : {}}
                          >
                            <FaChair className="seat-icon" />
                            <span className="seat-number">{seat}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="seat-legend mt-3">
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
          <div className="legend-item">
            <div className="legend-color premium"></div>
            <span>Premium</span>
          </div>
        </div>

        <AnimatePresence>
          {selectedSeats.length > 0 && (
            <motion.div 
              className="booking-summary mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h4>Your Selection</h4>
              <div className="selected-seats">
                {selectedSeats.map(seat => (
                  <Badge key={seat.number} bg="primary" className="me-2 mb-2">
                    {seat.number} (₹{seat.price})
                  </Badge>
                ))}
              </div>
              <div className="total-amount">
                <span>Total:</span>
                <span className="amount">₹{calculateTotal()}</span>
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={confirmBooking}
                className="w-100 mt-3"
              >
                Proceed to Payment
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="confirmation-details">
            <h5>War 2 (Telugu)</h5>
            <p className="text-muted">Annapurna Theater • {showTime}</p>
            
            <div className="booking-summary">
              <Row>
                <Col>Seats:</Col>
                <Col className="text-end">
                  {selectedSeats.map(s => s.number).join(', ')}
                </Col>
              </Row>
              <Row className="mt-2">
                <Col>Total Amount:</Col>
                <Col className="text-end fw-bold">₹{calculateTotal()}</Col>
              </Row>
            </div>

            <div className="payment-info mt-4">
              <h6><FaInfoCircle className="me-2" />Payment Information</h6>
              <p className="small text-muted">
                Your payment will be processed securely. You'll receive an email confirmation with your ticket details.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={completeBooking}
            disabled={bookingInProgress}
          >
            {bookingInProgress ? 'Processing...' : 'Confirm & Pay'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SeatBooking;