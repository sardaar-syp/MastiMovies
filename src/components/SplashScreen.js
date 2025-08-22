import React from 'react';
import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img 
          src={process.env.PUBLIC_URL + "/images/mastimovies-logo.png"} 
          alt="MastiMovies Logo" 
          className="splash-logo" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = process.env.PUBLIC_URL + '/images/default-logo.png';
          }}
        />
        <h1 className="splash-title">MastiMovies</h1>
      </div>
    </div>
  );
};

export default SplashScreen;