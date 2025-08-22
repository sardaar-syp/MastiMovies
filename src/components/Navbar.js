import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Container, Button, Form, InputGroup, Dropdown, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, 
  FaUser, 
  FaTicketAlt, 
  FaHome, 
  FaHistory,
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';
import { BsCameraReelsFill, BsBookmarkHeartFill } from 'react-icons/bs';
import { IoMdNotificationsOutline } from 'react-icons/io';

const CustomNavbar = ({ user, onLogout, bookingCount = 0, notificationCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-focus search when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Close search when navigating
  useEffect(() => {
    setShowSearch(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 100);
    }
  };

  return (
    <Navbar 
      bg={isScrolled ? "dark" : "danger"} 
      variant="dark" 
      expand="lg" 
      fixed="top" 
      className={`shadow-sm transition-all ${isScrolled ? 'py-1' : 'py-2'}`}
    >
      <Container fluid="lg">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src="/images/mastimovies-logo.png" // Using public folder path
            alt="MastiMovies Logo"
            height={isScrolled ? "35" : "40"}
            className="me-2 transition-all"
          />
          <span className="fw-bold d-none d-md-inline">MastiMovies</span>
        </Navbar.Brand>
        
        {/* Mobile Search Button */}
        <Button 
          variant="link" 
          className="d-lg-none text-white ms-auto me-2"
          onClick={toggleSearch}
          aria-label="Search"
        >
          <FaSearch size={isScrolled ? "1rem" : "1.2rem"} />
        </Button>
        
        <Navbar.Toggle aria-controls="navbarContent" className="border-0" />
        
        <Navbar.Collapse id="navbarContent">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end className="px-3">
              <FaHome className="me-1" />
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/movies" className="px-3">
              <BsCameraReelsFill className="me-1" />
              Movies
            </Nav.Link>
            <Nav.Link as={NavLink} to="/nearby-theaters" className="px-3">
              <FaSearch className="me-1" />
              Theaters
            </Nav.Link>
          </Nav>

          {/* Desktop Search */}
          <Form onSubmit={handleSearch} className="d-none d-lg-flex me-3 flex-grow-1" style={{ maxWidth: '500px' }}>
            <InputGroup>
              <Form.Control
                ref={searchInputRef}
                type="text"
                placeholder="Search movies, theaters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search movies"
                className="py-2"
              />
              <Button 
                variant="outline-light" 
                type="submit"
                aria-label="Search"
                className="px-3"
              >
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>

          {/* Mobile Search - appears when toggled */}
          {showSearch && (
            <div className="d-lg-none w-100 mb-3">
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search movies"
                    className="py-2"
                  />
                  <Button 
                    variant="outline-light" 
                    type="submit"
                    aria-label="Search"
                    className="px-3"
                  >
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form>
            </div>
          )}

          <Nav className="align-items-center">
            {user && (
              <>
                <Nav.Link as={NavLink} to="/bookmarks" className="px-2 d-none d-md-block">
                  <BsBookmarkHeartFill size="1.2rem" />
                </Nav.Link>
                
                <Nav.Link as={NavLink} to="/bookings" className="px-2 position-relative">
                  <FaTicketAlt size="1.2rem" />
                  {bookingCount > 0 && (
                    <Badge pill bg="warning" className="position-absolute top-0 start-100 translate-middle">
                      {bookingCount}
                    </Badge>
                  )}
                </Nav.Link>
                
                <Nav.Link as={NavLink} to="/notifications" className="px-2 position-relative">
                  <IoMdNotificationsOutline size="1.4rem" />
                  {notificationCount > 0 && (
                    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Nav.Link>
              </>
            )}
            
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center px-2">
                  <div className="position-relative">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.name} 
                        className="rounded-circle" 
                        width="32" 
                        height="32"
                      />
                    ) : (
                      <FaUserCircle size="1.8rem" />
                    )}
                  </div>
                  <span className="ms-2 d-none d-lg-inline">{user.name}</span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="mt-2 shadow">
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" />
                    My Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/bookings">
                    <FaTicketAlt className="me-2" />
                    My Bookings
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/watch-history">
                    <FaHistory className="me-2" />
                    Watch History
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={onLogout}>
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link as={Link} to="/login" className="px-3">
                <Button variant="outline-light" className="px-3">
                  <FaUser className="me-2" />
                  Sign In
                </Button>
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;