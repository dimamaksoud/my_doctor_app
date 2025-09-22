import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import NotificationBell from './NotificationBell';
import './Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, doctor } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleDoctorsClick = () => {
    navigate('/doctors', {
      state: {
        fromHeader: true,
        scrollToFilters: true
      }
    });
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>MY_Doctor</h1>
        </Link>

        <nav className="nav-menu">
          <Link to="/booking" className="nav-link">
            حجز موعد
          </Link>

          {/* رابط قائمة الأطباء الجديد */}
          <button
            onClick={handleDoctorsClick}
            className="nav-link doctors-link"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              color: 'inherit'
            }}
          >
            الأطباء والاختصاصات
          </button>

          <Link to="/appointment-inquiry" className="nav-link">
            استعلام عن موعد
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                لوحة التحكم
              </Link>
              <Link to="/doctor-appointments" className="nav-link">
                المواعيد
              </Link>
              <Link to="/profile" className="nav-link">
                الملف الشخصي
              </Link>

              <NotificationBell />

              <div className="user-info">
                <span>مرحباً، د. {doctor?.first_name}</span>
                <button onClick={handleLogout} className="logout-btn">
                  تسجيل خروج
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              تسجيل الدخول
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
