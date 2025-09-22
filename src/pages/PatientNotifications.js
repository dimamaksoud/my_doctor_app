import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchPatientNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../store/slices/notificationSlice';
import './PatientNotifications.css';

const PatientNotifications = () => {
  const dispatch = useDispatch();
  const { patientNotifications, loading } = useSelector(state => state.notifications);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user?.phone) {
      dispatch(fetchPatientNotifications(user.phone));
    }
  }, [user, dispatch]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead({
      notificationId,
      userType: 'patient',
      userId: user.phone
    }));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead({
      userType: 'patient',
      userId: user.phone
    }));
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return <div className="loading">جاري تحميل الإشعارات...</div>;
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>الإشعارات</h1>
        {patientNotifications.length > 0 && (
          <button onClick={handleMarkAllAsRead} className="mark-all-read-btn">
            تعيين الكل كمقروء
          </button>
        )}
      </div>

      <div className="notifications-list">
        {patientNotifications.length === 0 ? (
          <div className="empty-state">
            <p>لا توجد إشعارات</p>
          </div>
        ) : (
          patientNotifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === 'success' && '✅'}
                {notification.type === 'warning' && '⚠️'}
                {notification.type === 'error' && '❌'}
                {notification.type === 'info' && 'ℹ️'}
              </div>

              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {formatDate(notification.createdAt)}
                </span>
              </div>

              {!notification.isRead && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientNotifications;
