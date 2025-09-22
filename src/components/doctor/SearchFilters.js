// src/components/doctors/SearchFilters.js
import React from 'react';
import './SearchFilters.css';

const SearchFilters = ({ filters, setFilters, specializations, locations }) => {
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      specialization: '',
      name: '',
      location: '',
      availability: ''
    });
  };

  return (
    <div className="search-filters">
      <h3>🔍 تصفية النتائج</h3>

      <div className="filters-grid">
        {/* بحث بالاسم */}
        <div className="filter-group">
          <label>اسم الطبيب</label>
          <input
            type="text"
            placeholder="ابحث باسم الطبيب..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            className="filter-input"
          />
        </div>

        {/* التخصص */}
        <div className="filter-group">
          <label>التخصص</label>
          <select
            value={filters.specialization}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            className="filter-select"
          >
            <option value="">جميع التخصصات</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* الموقع */}
        <div className="filter-group">
          <label>الموقع</label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="filter-select"
          >
            <option value="">جميع المواقع</option>
            {locations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* الحالة */}
        <div className="filter-group">
          <label>الحالة</label>
          <select
            value={filters.availability}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
            className="filter-select"
          >
            <option value="">جميع الأطباء</option>
            <option value="available">متاح فقط</option>
          </select>
        </div>
      </div>

      <div className="filter-actions">
        <button onClick={clearFilters} className="clear-filters-btn">
          🗑️ مسح الفلاتر
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
