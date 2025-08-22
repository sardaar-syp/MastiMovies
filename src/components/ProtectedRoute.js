import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

/**
 * ProtectedRoute component that redirects to login if user is not authenticated
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} [props.redirectToLogin=true] - Whether to redirect to login when unauthenticated
 * @returns {ReactNode} Either the children or null (while checking auth state)
 */
const ProtectedRoute = ({ children, redirectToLogin = true }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication state when component mounts
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && redirectToLogin) {
        // Redirect to login if not authenticated
        navigate('/login', { 
          replace: true,
          state: { from: window.location.pathname } // Store original location
        });
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate, redirectToLogin]);

  // Optional: Show loading state while checking auth
  if (auth.currentUser === null) {
    return null; // Or return a loading spinner
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;