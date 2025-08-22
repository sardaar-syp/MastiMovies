import React from 'react';

const Logo = ({ size = 60, className = '' }) => {
  return (
    <img 
      src="/images/mastimovies-logo.png" 
      alt="MastiMovies Logo"
      height={size}
      className={className}
    />
  );
};

export default Logo;