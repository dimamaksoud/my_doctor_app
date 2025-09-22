import React from 'react';

const FormInput = ({
  label,
  type = 'text',
  name, // إضافة الخاصية name
  value,
  onChange,
  onBlur, // إضافة الخاصية onBlur
  placeholder,
  error,
  icon
}) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={error ? 'error' : ''}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

// ✅ تصدير افتراضي
export default FormInput;
