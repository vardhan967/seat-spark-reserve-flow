
import React, { useState, useEffect } from 'react';
import { useSeat } from '../context/SeatContext';
import { Clock, User, MapPin, Check, RefreshCw } from 'lucide-react';

const AdminCheckinPage = () => {
  const { fetchPendingSeats, confirmSeat, error } = useSeat();
  const [pendingSeats, setPendingSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingSeats, setConfirmingSeats] = useState(new Set());

  const loadPendingSeats = async () => {
    setLoading(true);
    const data = await fetchPendingSeats();
    setPendingSeats(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPendingSeats();
    setRefreshing(false);
  };

  const handleConfirm = async (seatId) => {
    setConfirmingSeats(prev => new Set(prev).add(seatId));
    
    const result = await confirmSeat(seatId);
    
    if (result.success) {
      // Remove the confirmed seat from the list
      setPendingSeats(prev => prev.filter(seat => seat.id !== seatId));
    }
    
    setConfirmingSeats(prev => {
      const newSet = new Set(prev);
      newSet.delete(seatId);
      return newSet;
    });
  };

  const getTimeLeft = (reservedUntil) => {
    const now = new Date();
    const until = new Date(reservedUntil);
    const difference = until - now;

    if (difference <= 0) return 'Expired';

    const minutes = Math.floor(difference / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    loadPendingSeats();
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingSeats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Admin Check-in Dashboard</h1>
          <p>Confirm pending seat reservations</p>
        </div>

        <button onClick={handleRefresh} className="refresh-button" disabled={refreshing}>
          <RefreshCw className={`refresh-icon ${refreshing ? 'spinning' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading pending reservations...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Try Again
          </button>
        </div>
      ) : (
        <div className="admin-content">
          <div className="admin-stats">
            <div className="stat-card stat-pending">
              <div className="stat-number">{pendingSeats.length}</div>
              <div className="stat-label">Pending Confirmations</div>
            </div>
          </div>

          {pendingSeats.length === 0 ? (
            <div className="empty-state">
              <Clock className="empty-icon" />
              <h3>No Pending Reservations</h3>
              <p>All seat reservations have been processed.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <div className="admin-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Seat</div>
                    <div className="table-cell">Location</div>
                    <div className="table-cell">Student</div>
                    <div className="table-cell">Time Left</div>
                    <div className="table-cell">Action</div>
                  </div>
                </div>
                <div className="table-body">
                  {pendingSeats.map(seat => (
                    <div key={seat.id} className="table-row">
                      <div className="table-cell">
                        <div className="seat-info">
                          <div className="seat-name">{seat.name}</div>
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="location-info">
                          <MapPin className="location-icon" />
                          <span>{seat.location_name}</span>
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="student-info">
                          <User className="student-icon" />
                          <span>{seat.booked_by?.username}</span>
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="time-info">
                          <Clock className="time-icon" />
                          <span className="time-left">
                            {getTimeLeft(seat.reserved_until)}
                          </span>
                        </div>
                      </div>
                      <div className="table-cell">
                        <button
                          onClick={() => handleConfirm(seat.id)}
                          disabled={confirmingSeats.has(seat.id)}
                          className="confirm-button"
                        >
                          {confirmingSeats.has(seat.id) ? (
                            <div className="loading-spinner small"></div>
                          ) : (
                            <>
                              <Check className="confirm-icon" />
                              Confirm
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCheckinPage;
