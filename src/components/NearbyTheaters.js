import React, { useState, useEffect } from 'react';
import { useGeolocated } from 'react-geolocated';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const NearbyTheaters = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const navigate = useNavigate();

  const { 
    coords, 
    isGeolocationAvailable, 
    isGeolocationEnabled,
    getPosition 
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 10000, // Increased timeout
    onError: (error) => {
      setLocationError(error.message);
      setLoading(false);
    },
  });

  useEffect(() => {
    if (coords) {
      fetchNearbyTheaters(coords.latitude, coords.longitude);
    }
  }, [coords]);

  const handleRetryLocation = () => {
    setLoading(true);
    setLocationError(null);
    getPosition();
  };

  const fetchNearbyTheaters = async (lat, lng) => {
    try {
      setLoading(true);
      const theatersRef = collection(db, 'theaters');
      const q = query(theatersRef);
      
      const querySnapshot = await getDocs(q);
      const theatersData = [];
      
      querySnapshot.forEach((doc) => {
        const theater = doc.data();
        if (theater.location) {
          const distance = calculateDistance(lat, lng, theater.location.lat, theater.location.lng);
          if (distance < 50) { // Within 50km
            theatersData.push({ 
              ...theater, 
              distance, 
              id: doc.id 
            });
          }
        }
      });
      
      setTheaters(theatersData.sort((a, b) => a.distance - b.distance));
      setLocationError(null);
    } catch (error) {
      toast.error('Error fetching theaters');
      console.error(error);
      setLocationError('Failed to fetch theaters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleTheaterSelect = (theaterId) => {
    navigate(`/theaters/${theaterId}`, {
      state: {
        userLocation: coords ? {
          lat: coords.latitude,
          lng: coords.longitude
        } : null
      }
    });
  };

  if (!isGeolocationAvailable) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Your browser does not support Geolocation. Please try in a different browser.
        </div>
      </div>
    );
  }

  if (!isGeolocationEnabled) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Location Access Required</h4>
          <p>Please enable geolocation permissions to find nearby theaters</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={handleRetryLocation}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Location Error</h4>
          <p>{locationError}</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={handleRetryLocation}
          >
            Retry Location
          </button>
        </div>
      </div>
    );
  }

  if (!coords && loading) {
    return (
      <div className="container mt-4">
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Detecting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Theaters Near You</h2>
        {coords && (
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={handleRetryLocation}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh Location
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Finding theaters near you...</p>
        </div>
      ) : theaters.length === 0 ? (
        <div className="alert alert-info">
          <h4>No Theaters Found</h4>
          <p>We couldn't find any theaters within 50km of your location.</p>
          <button 
            className="btn btn-sm btn-info"
            onClick={handleRetryLocation}
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <p className="text-muted">
              <i className="bi bi-info-circle me-2"></i>
              Showing theaters within 50km of your location
            </p>
          </div>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {theaters.map(theater => (
              <div key={theater.id} className="col">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{theater.name}</h5>
                    <p className="text-muted mb-2">
                      <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                      {theater.address}
                    </p>
                    <p className="text-success mb-3">
                      <i className="bi bi-signpost-fill me-2"></i>
                      {theater.distance.toFixed(1)} km away
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-info">{theater.rating || 'N/A'} ★</span>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleTheaterSelect(theater.id)}
                      >
                        View Showtimes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NearbyTheaters;