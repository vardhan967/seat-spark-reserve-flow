
import React, { useEffect, useState } from 'react';
import { useSeat } from '../context/SeatContext';
import Seat from '../components/Seat';
import { MapPin, Filter, RefreshCw } from 'lucide-react';

const SeatDashboardPage = () => {
  const { allSeats, locations, loading, error, fetchSeats, fetchLocations } = useSeat();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLocations();
    fetchSeats();
  }, [fetchLocations, fetchSeats]);

  const handleLocationFilter = async (locationId) => {
    setSelectedLocation(locationId);
    await fetchSeats(locationId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSeats(selectedLocation);
    setRefreshing(false);
  };

  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : 'All Locations';
  };

  const getSeatStats = () => {
    const available = allSeats.filter(seat => seat.status === 'available').length;
    const pending = allSeats.filter(seat => seat.status === 'pending_confirmation').length;
    const reserved = allSeats.filter(seat => seat.status === 'reserved').length;
    return { available, pending, reserved, total: allSeats.length };
  };

  const stats = getSeatStats();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Library Seat Dashboard</h1>
          <p>Book your perfect study spot</p>
        </div>

        <button onClick={handleRefresh} className="refresh-button" disabled={refreshing}>
          <RefreshCw className={`refresh-icon ${refreshing ? 'spinning' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card stat-available">
          <div className="stat-number">{stats.available}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-reserved">
          <div className="stat-number">{stats.reserved}</div>
          <div className="stat-label">Reserved</div>
        </div>
        <div className="stat-card stat-total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Seats</div>
        </div>
      </div>

      <div className="dashboard-filters">
        <div className="filter-header">
          <Filter className="filter-icon" />
          <span>Filter by Location</span>
        </div>
        <div className="filter-buttons">
          <button
            onClick={() => handleLocationFilter(null)}
            className={`filter-button ${selectedLocation === null ? 'active' : ''}`}
          >
            <MapPin className="filter-button-icon" />
            All Locations
          </button>
          {locations.map(location => (
            <button
              key={location.id}
              onClick={() => handleLocationFilter(location.id)}
              className={`filter-button ${selectedLocation === location.id ? 'active' : ''}`}
            >
              <MapPin className="filter-button-icon" />
              {location.name}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-header">
          <h2>
            {selectedLocation ? getLocationName(selectedLocation) : 'All Locations'}
          </h2>
          <span className="seat-count">{allSeats.length} seats</span>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading seats...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-button">
              Try Again
            </button>
          </div>
        ) : (
          <div className="seats-grid">
            {allSeats.map(seat => (
              <Seat key={seat.id} seat={seat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatDashboardPage;
