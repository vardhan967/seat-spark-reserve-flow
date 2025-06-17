
import React, { useState, useEffect } from 'react';
import { useSeat } from '../context/SeatContext';
import Seat from '../components/Seat';
import { Calendar, Clock, RefreshCw } from 'lucide-react';

const MyReservationsPage = () => {
  const { fetchMyReservations, error } = useSeat();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReservations = async () => {
    setLoading(true);
    const data = await fetchMyReservations();
    setReservations(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const getPendingReservations = () => {
    return reservations.filter(seat => seat.status === 'pending_confirmation');
  };

  const getConfirmedReservations = () => {
    return reservations.filter(seat => seat.status === 'reserved');
  };

  const pendingReservations = getPendingReservations();
  const confirmedReservations = getConfirmedReservations();

  return (
    <div className="reservations-page">
      <div className="reservations-header">
        <div className="reservations-title">
          <h1>My Reservations</h1>
          <p>Manage your seat bookings</p>
        </div>

        <button onClick={handleRefresh} className="refresh-button" disabled={refreshing}>
          <RefreshCw className={`refresh-icon ${refreshing ? 'spinning' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your reservations...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Try Again
          </button>
        </div>
      ) : (
        <div className="reservations-content">
          <div className="reservations-section">
            <div className="section-header">
              <Clock className="section-icon" />
              <h2>Pending Confirmation</h2>
              <span className="section-count">({pendingReservations.length})</span>
            </div>
            <div className="section-description">
              <p>These seats are waiting for admin confirmation. Please visit an admin within 10 minutes.</p>
            </div>
            
            {pendingReservations.length === 0 ? (
              <div className="empty-state">
                <Clock className="empty-icon" />
                <p>No pending reservations</p>
              </div>
            ) : (
              <div className="seats-grid">
                {pendingReservations.map(seat => (
                  <Seat key={seat.id} seat={seat} />
                ))}
              </div>
            )}
          </div>

          <div className="reservations-section">
            <div className="section-header">
              <Calendar className="section-icon" />
              <h2>Confirmed Reservations</h2>
              <span className="section-count">({confirmedReservations.length})</span>
            </div>
            <div className="section-description">
              <p>Your confirmed seat reservations. You can release them when you're done.</p>
            </div>

            {confirmedReservations.length === 0 ? (
              <div className="empty-state">
                <Calendar className="empty-icon" />
                <p>No confirmed reservations</p>
              </div>
            ) : (
              <div className="seats-grid">
                {confirmedReservations.map(seat => (
                  <Seat key={seat.id} seat={seat} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;
