// pages/ManageAppointments.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import AppointmentManager from '../components/doctor/AppointmentManager';
import ClinicManager from '../components/doctor/ClinicManager';
import ScheduleManager from '../components/doctor/ScheduleManager';
import './ManageAppointments.css';

const ManageAppointments = () => {
  const { doctor } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 'appointments', label: '📅 إدارة المواعيد', icon: '📅' },
    { id: 'schedule', label: '⏰ جدول العمل', icon: '⏰' },
    { id: 'clinics', label: '🏥 العيادات', icon: '🏥' }
  ];

  return (
    <div className="manage-appointments-page">
      {/* رأس الصفحة */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>مركز إدارة العيادة 🏥</h1>
            <p>مرحباً د. {doctor?.first_name}، هنا يمكنك إدارة كافة جوانب عيادتك</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-icon">📊</span>
              <div className="stat-info">
                <span className="stat-value">24</span>
                <span className="stat-label">موعد هذا الأسبوع</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div className="stat-info">
                <span className="stat-value">92%</span>
                <span className="stat-label">معدل الحضور</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* شريط التبويب */}
      <div className="tabs-container">
        <Tabs selectedIndex={activeTab} onSelect={setActiveTab}>
          <TabList className="custom-tablist">
            {tabs.map((tab, index) => (
              <Tab key={tab.id} className="custom-tab">
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
                {index === activeTab && <div className="tab-indicator"></div>}
              </Tab>
            ))}
          </TabList>

          {/* محتوى التبويب الأول: إدارة المواعيد */}
          <TabPanel className="tab-panel">
            <div className="panel-header">
              <h2>إدارة المواعيد اليومية</h2>
              <p>أضف، عدّل أو احذف المواعيد المتاحة لمرضاك</p>
            </div>
            <AppointmentManager />
          </TabPanel>

          {/* محتوى التبويب الثاني: جدول العمل */}
          <TabPanel className="tab-panel">
            <div className="panel-header">
              <h2>جدول العمل الأسبوعي</h2>
              <p>حدد أوقات العمل لكل يوم في عياداتك المختلفة</p>
            </div>
            <ScheduleManager />
          </TabPanel>

          {/* محتوى التبويب الثالث: إدارة العيادات */}
          <TabPanel className="tab-panel">
            <div className="panel-header">
              <h2>إدارة العيادات</h2>
              <p>أضف أو عدّل على عياداتك ومواقعها</p>
            </div>
            <ClinicManager />
          </TabPanel>
        </Tabs>
      </div>

      {/* ملخص سريع */}
      <div className="quick-overview">
        <h3>نظرة سريعة ⚡</h3>
        <div className="overview-cards">
          <div className="overview-card">
            <span className="overview-icon">🟢</span>
            <div>
              <h4>مواعيد اليوم</h4>
              <p>8 مواعيد مجدولة</p>
            </div>
          </div>
          <div className="overview-card">
            <span className="overview-icon">🟠</span>
            <div>
              <h4>في الانتظار</h4>
              <p>3 مواعيد قيد التأكيد</p>
            </div>
          </div>
          <div className="overview-card">
            <span className="overview-icon">🔴</span>
            <div>
              <h4>مشغول</h4>
              <p>75% من الوقت مشغول</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAppointments;
