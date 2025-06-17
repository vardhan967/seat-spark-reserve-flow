
import React, { useState, useEffect } from 'react';
import { useSeat } from '../context/SeatContext';
import { useAuth } from '../context/AuthContext';
import { Clock, User, Check, X } from 'lucide-react';

const Seat = ({ seat }) => {
  const { bookSeat, releaseSeat } = useSeat();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(false);

  const isMyBooking = seat.booked_by?.id === user?.id;
  const isAvailable = seat.status === 'available';
  const isPending = seat.status === 'pending_confirmation';
  const isConfirmed = seat.status === 'reserved';

  // Calculate time left for pending reservations
  useEffect(() => {
    if (isPending && seat.reserved_until && isMyBooking) {
      const interval = setInterval(() => {
        const now = new Date();
        const reservedUntil = new Date(seat.reserved_until);
        const difference = reservedUntil - now;

        if (difference > 0) {
          const minutes = Math.floor(difference / 60000);
          const seconds = Math.floor((difference % 60000) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft('Expired');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPending, seat.reserved_until, isMyBooking]);

  const handleBook = async () => {
    setLoading(true);
    const result = await bookSeat(seat.id);
    if (result.success) {
      console.log('Seat booked successfully');
    }
    setLoading(false);
  };

  const handleRelease = async () => {
    setLoading(true);
    const result = await releaseSeat(seat.id);
    if (result.success) {
      console.log('Seat released successfully');
    }
    setLoading(false);
  };

  const getSeatClassName = () => {
    let baseClass = 'seat-card';
    
    if (isAvailable) {
      baseClass += ' seat-available';
    } else if (isPending && isMyBooking) {
      baseClass += ' seat-pending-mine';
    } else if (isConfirmed && isMyBooking) {
      baseClass += ' seat-confirmed-mine';
    } else {
      baseClass += ' seat-unavailable';
    }

    return baseClass;
  };

  const getStatusIcon = () => {
    if (isAvailable) return <Check className="seat-status-icon" />;
    if (isPending) return <Clock className="seat-status-icon" />;
    if (isConfirmed) return <User className="seat-status-icon" />;
    return <X className="seat-status-icon" />;
  };

  const getStatusText = () => {
    if (isAvailable) return 'Available';
    if (isPending && isMyBooking) return 'Pending (You)';
    if (isPending) return 'Pending';
    if (isConfirmed && isMyBooking) return 'Reserved (You)';
    if (isConfirmed) return 'Reserved';
    return 'Unavailable';
  };

  return (
    <div className={getSeatClassName()}>
      <div className="seat-header">
        <div className="seat-name">{seat.name}</div>
        <div className="seat-status">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>

      <div className="seat-location">
        {seat.location_name}
      </div>

      {isPending && isMyBooking && timeLeft && (
        <div className="seat-timer">
          <Clock className="timer-icon" />
          <span>Time left: {timeLeft}</span>
        </div>
      )}

      {seat.booked_by && !isMyBooking && (
        <div className="seat-booked-by">
          <User className="user-icon" />
          <span>Booked by: {seat.booked_by.username}</span>
        </div>
      )}

      <div className="seat-actions">
        {isAvailable && (
          <button
            onClick={handleBook}
            disabled={loading}
            className="seat-button seat-button-book"
          >
            {loading ? 'Booking...' : 'Book Seat'}
          </button>
        )}

        {isPending && isMyBooking && (
          <button
            onClick={handleRelease}
            disabled={loading}
            className="seat-button seat-button-cancel"
          >
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}

        {isConfirmed && isMyBooking && (
          <button
            onClick={handleRelease}
            disabled={loading}
            className="seat-button seat-button-release"
          >
            {loading ? 'Releasing...' : 'Release Seat'}
          </button>
        )}

        {!isAvailable && !isMyBooking && (
          <button disabled className="seat-button seat-button-disabled">
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
};

export default Seat;
