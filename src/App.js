import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { auth, onAuthStateChanged } from './firebase';
import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import MovieDetail from './components/MovieDetail';
import BookTickets from './components/BookTickets';
import MyBookings from './components/MyBookings';
import TheaterShowtimes from './components/TheaterShowtimes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User'
        });
        if (['/login', '/signup'].includes(window.location.pathname)) {
          navigate('/');
        }
      } else {
        setUser(null);
        if (!['/login', '/signup'].includes(window.location.pathname)) {
          navigate('/login');
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="app-container">
      <Navbar user={user} />
      
      <Container className="main-content py-4">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
          <Route path="/movies/:id" element={<MovieDetail user={user} />} />
          <Route 
            path="/book/:movieId/:theaterId" 
            element={user ? <BookTickets user={user} /> : <Navigate to="/login" state={{ from: window.location.pathname }} />} 
          />
          <Route path="/theater/:theaterId" element={<TheaterShowtimes user={user} />} />
          <Route path="/bookings" element={user ? <MyBookings user={user} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>

      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;