import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTicketAlt, FaCalendarAlt, FaClock, FaMoneyBillWave, FaMapMarkerAlt, FaChair, FaQrcode, FaEye } from 'react-icons/fa';
import { Spinner, Modal, Button } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

const MyBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockBookings = [
          {
            id: 1,
            movie: 'Avengers: Endgame',
            theater: 'PVR Cinemas, Forum Mall',
            showTime: '10:00 AM',
            showDate: '2023-12-20',
            seats: ['A1', 'A2'],
            amount: 700,
            bookingDate: '2023-12-15T14:30:00',
            posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg',
            status: 'confirmed',
            bookingId: 'BK123456',
            location: 'Koramangala, Bangalore',
            amenities: ['Dolby Atmos', 'Recliner Seats'],
            userName: user?.displayName || 'John Doe',
            userEmail: user?.email || 'john@example.com'
          }
        ];
        
        setBookings(mockBookings);
      } catch (error) {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const viewTicket = (booking) => {
    setSelectedBooking(booking);
    setShowTicketModal(true);
  };

  const filterBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    switch (activeFilter) {
      case 'upcoming': return bookings.filter(b => b.showDate >= today);
      case 'past': return bookings.filter(b => b.showDate < today);
      default: return bookings;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  const filteredBookings = filterBookings();

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaTicketAlt className="text-primary me-2" />
          My Bookings
        </h2>
        
        <div className="btn-group">
          <button className={`btn btn-outline-primary ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}>All Bookings</button>
          <button className={`btn btn-outline-primary ${activeFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveFilter('upcoming')}>Upcoming</button>
          <button className={`btn btn-outline-primary ${activeFilter === 'past' ? 'active' : ''}`}
            onClick={() => setActiveFilter('past')}>Past</button>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-4 text-muted mb-3"><FaTicketAlt /></div>
          <h4>No {activeFilter !== 'all' ? activeFilter : ''} bookings found</h4>
          <button className="btn btn-primary mt-3">Book a Movie Now</button>
        </div>
      ) : (
        <div className="row">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="col-md-6 col-lg-4 mb-4">
              <div className={`card h-100 ${new Date(booking.showDate) >= new Date() ? 'border-primary' : 'border-secondary'}`}>
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <span className={`badge ${new Date(booking.showDate) >= new Date() ? 'bg-primary' : 'bg-secondary'}`}>
                    {new Date(booking.showDate) >= new Date() ? 'Upcoming' : 'Completed'}
                  </span>
                  <small className="text-muted">#{booking.bookingId}</small>
                </div>
                
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-5 mb-3 mb-md-0">
                      <img src={booking.posterUrl} className="img-fluid rounded" alt={booking.movie} 
                        style={{ maxHeight: '250px', objectFit: 'cover' }} />
                    </div>
                    <div className="col-md-7">
                      <h5 className="card-title">{booking.movie}</h5>
                      <div className="booking-details">
                        <div className="detail-item mb-2">
                          <FaMapMarkerAlt className="text-danger me-2" />
                          <span>{booking.theater}</span>
                        </div>
                        <div className="detail-item mb-2">
                          <FaCalendarAlt className="text-primary me-2" />
                          <span>{formatDate(booking.showDate)}</span>
                        </div>
                        <div className="detail-item mb-2">
                          <FaClock className="text-warning me-2" />
                          <span>{booking.showTime}</span>
                        </div>
                        <div className="detail-item mb-2">
                          <FaChair className="text-success me-2" />
                          <span>Seats: {booking.seats.join(', ')}</span>
                        </div>
                        <div className="detail-item mb-3">
                          <FaMoneyBillWave className="text-success me-2" />
                          <span>₹{booking.amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <Button variant="outline-primary" size="sm" onClick={() => viewTicket(booking)}>
                      <FaEye className="me-1" /> View Ticket
                    </Button>
                    {new Date(booking.showDate) >= new Date() && (
                      <button className="btn btn-sm btn-outline-danger">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Modal */}
      <Modal show={showTicketModal} onHide={() => setShowTicketModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>🎟️ Digital Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div className="ticket-container">
              <div className="ticket-header text-center mb-4">
                <h3 className="text-primary">MastiMovies</h3>
                <p className="text-muted">Your Digital Ticket</p>
              </div>
              
              <div className="ticket-content">
                <div className="row">
                  <div className="col-md-8">
                    <div className="ticket-details">
                      <div className="detail-row">
                        <span>Movie:</span>
                        <strong>{selectedBooking.movie}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Theater:</span>
                        <span>{selectedBooking.theater}</span>
                      </div>
                      <div className="detail-row">
                        <span>Location:</span>
                        <span>{selectedBooking.location}</span>
                      </div>
                      <div className="detail-row">
                        <span>Date & Time:</span>
                        <span>{formatDate(selectedBooking.showDate)} • {selectedBooking.showTime}</span>
                      </div>
                      <div className="detail-row">
                        <span>Seats:</span>
                        <span className="text-primary">{selectedBooking.seats.join(', ')}</span>
                      </div>
                      <div className="detail-row">
                        <span>Facilities:</span>
                        <span>{selectedBooking.amenities.join(', ')}</span>
                      </div>
                      <div className="detail-row">
                        <span>Booking ID:</span>
                        <span className="text-danger">#{selectedBooking.bookingId}</span>
                      </div>
                      <div className="detail-row">
                        <span>Booked By:</span>
                        <span>{selectedBooking.userName}</span>
                      </div>
                      <div className="detail-row total">
                        <span>Amount Paid:</span>
                        <span className="text-success">₹{selectedBooking.amount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="ticket-qr text-center">
                      <QRCodeSVG 
                        value={JSON.stringify({
                          bookingId: selectedBooking.bookingId,
                          movie: selectedBooking.movie,
                          showTime: selectedBooking.showTime,
                          seats: selectedBooking.seats.join(', '),
                          userName: selectedBooking.userName
                        })}
                        size={150}
                        level="H"
                      />
                      <p className="text-muted mt-2">Scan at theater</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => window.print()}>
            Print Ticket
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyBookings;