
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <BookOpen className="navbar-brand-icon" />
          <span>LibraryBooking</span>
        </Link>

        <div className="navbar-menu">
          {!isAuthenticated ? (
            <div className="navbar-auth">
              <Link to="/login" className="navbar-link">
                Login
              </Link>
            </div>
          ) : (
            <div className="navbar-user">
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/my-reservations" className="navbar-link">
                My Reservations
              </Link>
              {isAdmin && (
                <Link to="/admin/checkin" className="navbar-link admin-link">
                  <Settings className="navbar-icon" />
                  Admin Check-in
                </Link>
              )}
              <div className="navbar-user-info">
                <User className="navbar-icon" />
                <span>Welcome, {user?.username}</span>
              </div>
              <button onClick={handleLogout} className="navbar-logout">
                <LogOut className="navbar-icon" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
