import React, { useState, useContext, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AppContext } from '../context/AppContext';
import AwsDevConsole from './AwsDevConsole';
import { MapPin, Navigation, Clock, History, Settings, ChevronRight, Play, Eye } from 'lucide-react';

// Custom icons using Leaflet DivIcon to avoid broken path assets
const pickupIcon = L.divIcon({
  className: 'custom-pickup-pin',
  html: `<div class="pickup-pulse"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const unicornIcon = (emoji) => L.divIcon({
  className: 'custom-unicorn-pin',
  html: `<div class="unicorn-avatar galloping">${emoji || '🦄'}</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Map events handler to register user clicks
const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Map controller component to smoothly pan/zoom map on center changes
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true, duration: 0.8 });
    }
  }, [center, map]);
  return null;
};

const RideDashboard = () => {
  const { requestRide, rideHistory, isMockMode } = useContext(AppContext);
  const [pickup, setPickup] = useState(null); // { lat, lng }
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);
  const [requestStatus, setRequestStatus] = useState('IDLE'); // IDLE, SENDING, SUCCESS, ERROR
  const [errorMsg, setErrorMsg] = useState('');
  const [dispatchedUnicorn, setDispatchedUnicorn] = useState(null); // Selected unicorn info
  
  // Unicorn animation states
  const [unicornPos, setUnicornPos] = useState(null); // { lat, lng }
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const animationRef = useRef(null);

  const handleMapClick = (lat, lng) => {
    if (requestStatus === 'SENDING') return;
    setPickup({ lat, lng });
    setMapCenter([lat, lng]);
    setRequestStatus('IDLE');
    setUnicornPos(null);
    setDispatchedUnicorn(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPickup({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          setRequestStatus('IDLE');
          setUnicornPos(null);
          setDispatchedUnicorn(null);
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        },
        (error) => {
          console.error("Error geolocating user:", error);
          setErrorMsg("Failed to acquire location. Please verify location permissions.");
          setRequestStatus('ERROR');
        }
      );
    } else {
      setErrorMsg("Geolocation is not supported by your browser.");
      setRequestStatus('ERROR');
    }
  };

  const handleRequestRide = async () => {
    if (!pickup) return;

    setRequestStatus('SENDING');
    setErrorMsg('');
    setUnicornPos(null);
    setDispatchedUnicorn(null);

    try {
      const rideRecord = await requestRide(pickup.lat, pickup.lng);
      setDispatchedUnicorn(rideRecord.Unicorn);
      setRequestStatus('SUCCESS');

      // Start unicorn travel animation
      animateUnicorn(rideRecord.Unicorn, pickup.lat, pickup.lng);
    } catch (err) {
      setRequestStatus('ERROR');
      setErrorMsg(err.message || 'An error occurred while scheduling your ride.');
    }
  };

  // Interpolation logic to animate the unicorn from its "stable" to the pickup coordinate
  const animateUnicorn = (unicorn, targetLat, targetLng) => {
    // Generate a random stable offset (e.g. +0.015 degrees away)
    const startLat = targetLat + (Math.random() > 0.5 ? 0.015 : -0.015);
    const startLng = targetLng + (Math.random() > 0.5 ? 0.015 : -0.015);
    
    setUnicornPos({ lat: startLat, lng: startLng });

    const duration = 3000; // 3 seconds
    const startTime = performance.now();

    const updatePosition = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out quad interpolation
      const ease = 1 - (1 - progress) * (1 - progress);

      const currentLat = startLat + (targetLat - startLat) * ease;
      const currentLng = startLng + (targetLng - startLng) * ease;

      setUnicornPos({ lat: currentLat, lng: currentLng });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(updatePosition);
      } else {
        setRequestStatus('ARRIVED');
      }
    };

    animationRef.current = requestAnimationFrame(updatePosition);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: 'calc(100vh - 90px)',
      position: 'relative',
      overflow: 'hidden',
      margin: '0 16px 16px 16px',
      gap: '16px'
    }}>
      {/* Sidebar Controls */}
      <div style={{
        width: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        zIndex: 10
      }}>
        {/* Ride Booker Panel */}
        <div className="glass-card glass-card-glow-purple" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.02em' }}>Unicorn Ride Booker</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Click anywhere on the dark grid map to establish your target coordinates, then call a unicorn from the fleet.
          </p>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={18} style={{ color: pickup ? 'var(--secondary)' : 'var(--text-muted)' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pickup Coordinates</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', fontFamily: 'monospace' }}>
                  {pickup ? `${pickup.lat.toFixed(5)}, ${pickup.lng.toFixed(5)}` : 'No point pinned yet'}
                </span>
              </div>
            </div>

            {requestStatus === 'SENDING' && (
              <div className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Contacting API Gateway...
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Checking Cognito Session & Dispatching...</span>
              </div>
            )}

            {dispatchedUnicorn && (
              <div className="glass-card" style={{
                padding: '16px',
                background: 'rgba(16, 185, 129, 0.05)',
                borderColor: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '2.5rem', animation: requestStatus === 'SUCCESS' ? 'gallop 0.4s infinite alternate' : 'none' }}>
                  {dispatchedUnicorn.Icon}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dispatched Unicorn</span>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981' }}>{dispatchedUnicorn.Name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Color: {dispatchedUnicorn.Color} | Gender: {dispatchedUnicorn.Gender}
                  </span>
                </div>
              </div>
            )}

            {requestStatus === 'ERROR' && (
              <div className="glass-card" style={{ padding: '12px', background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.8rem' }}>
                {errorMsg}
              </div>
            )}

            {requestStatus === 'ARRIVED' && (
              <div className="glass-card" style={{
                padding: '16px',
                background: 'rgba(0, 242, 254, 0.05)',
                borderColor: 'rgba(0, 242, 254, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 0 15px rgba(0, 242, 254, 0.2)'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Unicorn Arrived!
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                  Your legendary ride <strong>{dispatchedUnicorn?.Name}</strong> has arrived at your target coordinates. Enjoy your wild ride!
                </span>
              </div>
            )}

            <button
              onClick={handleRequestRide}
              disabled={!pickup || requestStatus === 'SENDING'}
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Navigation size={18} /> 
              {requestStatus === 'SENDING' ? 'Processing...' : 'Request Unicorn Ride'}
            </button>
          </div>
        </div>

        {/* Ride History Panel */}
        <div className="glass-card" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Recent Ride Logs</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }} className="history-list">
            {rideHistory.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No rides registered.
              </div>
            ) : (
              rideHistory.map((ride, idx) => (
                <div 
                  key={ride.RideId}
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{ride.Unicorn?.Icon}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold' }}>{ride.Unicorn?.Name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                        {new Date(ride.RequestTime).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ color: 'var(--secondary)', fontFamily: 'monospace', fontSize: '0.65rem' }}>
                      {ride.PickupLocation.Latitude.toFixed(3)}, {ride.PickupLocation.Longitude.toFixed(3)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>ID: {ride.RideId.substring(0, 8)}...</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="glass-card" style={{
        flex: 1,
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        border: '1px solid var(--border-color)'
      }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
          zoomControl={true}
        >
          <MapController center={mapCenter} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapEventsHandler onMapClick={handleMapClick} />

          {/* User's pickup location marker */}
          {pickup && (
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
              <Popup>
                <div style={{ color: '#000', fontSize: '0.8rem' }}>
                  <strong>Pickup Coordinate</strong><br />
                  Lat: {pickup.lat.toFixed(5)}<br />
                  Lng: {pickup.lng.toFixed(5)}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Galloping Unicorn Marker */}
          {unicornPos && dispatchedUnicorn && (
            <Marker position={[unicornPos.lat, unicornPos.lng]} icon={unicornIcon(dispatchedUnicorn.Icon)}>
              <Popup>
                <div style={{ color: '#000', fontSize: '0.8rem' }}>
                  <strong>{dispatchedUnicorn.Name}</strong> is arriving!
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Floating Geolocation Button */}
        <button
          onClick={handleLocateMe}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: 999,
            padding: '12px 20px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 4px 20px rgba(0, 242, 254, 0.4)',
            background: 'linear-gradient(135deg, var(--secondary), #0284c7)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition)'
          }}
          className="locate-btn"
        >
          <Navigation size={16} style={{ transform: 'rotate(45deg)' }} /> Locate Me
        </button>

        {/* Floating Debugger Toggle Button */}
        <button
          onClick={() => setIsConsoleOpen(true)}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 999,
            padding: '12px 20px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 4px 20px rgba(138, 43, 226, 0.5)'
          }}
          className="btn-primary"
        >
          <Eye size={16} /> Open AWS DevConsole
        </button>

        {/* Visual Cue overlay when map is empty */}
        {!pickup && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            backgroundColor: 'rgba(5, 6, 11, 0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 20px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={16} style={{ color: 'var(--secondary)' }} />
            Click on the map to set a pickup location!
          </div>
        )}
      </div>

      {/* Floating Debug Console */}
      <AwsDevConsole isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} />
    </div>
  );
};

export default RideDashboard;
