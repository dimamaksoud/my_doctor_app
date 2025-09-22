import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Home.css';

const Home = () => {
  const { isAuthenticated, doctor } = useSelector(state => state.auth);

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>مرحباً بك في MY_Doctor</h1>
          <p>نظام حجز المواعيد الطبية الأكثر مرونة وسهولة</p>

          <div className="hero-actions">
            <Link to="/booking" className="cta-button primary">
              حجز موعد الآن
            </Link>

            {!isAuthenticated && (
              <Link to="/login" className="cta-button secondary">
                تسجيل الدخول للطبيب
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>مميزات النظام</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>حجز سهل وسريع</h3>
              <p>احجز موعدك في أي وقت ومن أي مكان بدون الحاجة لتسجيل الدخول</p>
            </div>
            <div className="feature-card">
              <h3>إدارة مرنة</h3>
              <p>للأطباء: إدارة المواعيد والمرضى بسهولة وكفاءة</p>
            </div>
            <div className="feature-card">
              <h3>تذكير بالمواعيد</h3>
              <p>لا تفوت أي موعد مع نظام التذكير الآلي</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
