import { Link, useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { FaHome, FaSearch, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './NotFound.css'; // Custom CSS for animations

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="not-found-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} md={8} lg={6} className="text-center py-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="error-icon mb-4">
              <FaExclamationTriangle size="4rem" className="text-warning" />
              <span className="error-code">404</span>
            </div>

            <h1 className="display-4 mb-3">Page Not Found</h1>
            
            <p className="lead text-muted mb-4">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  as={Link} 
                  to="/" 
                  variant="primary" 
                  className="px-4 py-2"
                >
                  <FaHome className="me-2" />
                  Return Home
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline-secondary" 
                  className="px-4 py-2"
                  onClick={() => navigate(-1)}
                >
                  <FaArrowLeft className="me-2" />
                  Go Back
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  as={Link} 
                  to="/search" 
                  variant="outline-primary" 
                  className="px-4 py-2"
                >
                  <FaSearch className="me-2" />
                  Search Movies
                </Button>
              </motion.div>
            </div>

            <div className="mt-5">
              <p className="text-muted small">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;