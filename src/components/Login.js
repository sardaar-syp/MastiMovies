import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser, resetPassword, auth, onAuthStateChanged } from '../firebase';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/home');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      await loginUser(email, password);
      toast.success('Logged in successfully!');
      navigate('/home');
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      switch(error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found. Please sign up.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Account temporarily locked. Try later.';
          break;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setResetLoading(true);
    setError('');

    try {
      await resetPassword(email);
      toast.success(`Password reset email sent to ${email}`);
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
      toast.error('Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <div className="auth-form">
        <h2 className="text-center mb-4">Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <Spinner as="span" size="sm" animation="border" />
            ) : 'Login'}
          </Button>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={handlePasswordReset}
              disabled={resetLoading}
              className="p-0"
            >
              {resetLoading ? (
                <Spinner as="span" size="sm" animation="border" />
              ) : 'Forgot password?'}
            </Button>
            <p className="mt-2">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Login;