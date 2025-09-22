import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchPatientNotifications,
  fetchDoctorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../../store/slices/notificationSlice';
import './NotificationBell.css';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { patientNotifications, doctorNotifications, unreadCount } = useSelector(state => state.notifications);

  const [isOpen, setIsOpen] = useState(false);
  const notifications = user?.role === 'doctor' ? doctorNotifications : patientNotifications;

  useEffect(() => {
    if (user) {
      if (user.role === 'doctor') {
        dispatch(fetchDoctorNotifications(user.doctor_id));
      } else {
        dispatch(fetchPatientNotifications(user.phone || ''));
      }
    }
  }, [user, dispatch]);

  const handleMarkAsRead = async (notificationId) => {
    await dispatch(markNotificationAsRead({
      notificationId,
      userType: user?.role === 'doctor' ? 'doctor' : 'patient',
      userId: user?.role === 'doctor' ? user.doctor_id : user?.phone
    }));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead({
      userType: user?.role === 'doctor' ? 'doctor' : 'patient',
      userId: user?.role === 'doctor' ? user.doctor_id : user?.phone
    }));
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  return (
    <div className="notification-container">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>الإشعارات</h4>
            {notifications.length > 0 && (
              <button
                className="mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                تعيين الكل كمقروء
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <h5>{notification.title}</h5>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <div className="unread-dot"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notification-footer">
              <button className="view-all-btn">عرض الكل</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
