import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading process
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Wait a bit before hiding to show the logo
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, 1000); // Show logo for 1 second after loading
      
      return () => clearTimeout(hideTimer);
    }, 2000); // Total loading time 2 seconds

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className={`splash-screen ${!isLoading ? 'splash-fade-out' : ''}`}>
      <div className="splash-content">
        <div className="logo-container">
          <img 
            src={process.env.PUBLIC_URL + "/images/mastimovies-logo.png"} 
            alt="MastiMovies Logo" 
            className="splash-logo" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = process.env.PUBLIC_URL + '/images/default-logo.png';
            }}
          />
        </div>
        
        <h1 className="splash-title">MastiMovies</h1>
        <p className="splash-subtitle">Your Ultimate Movie Experience</p>
        
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span className="loading-text">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;