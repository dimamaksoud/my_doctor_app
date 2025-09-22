const { Pool } = require('pg');
require('dotenv').config();

// تكوين اتصال قاعدة البيانات
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'my_doctor_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  // إعدادات إضافية للأمان والأداء
  max: 20, // أقصى عدد من العملاء في pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// اختبار الاتصال
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

// دالة لتنفيذ queries
const query = (text, params) => {
  return pool.query(text, params);
};

// دالة للحصول على client من pool
const getClient = () => {
  return pool.connect();
};

module.exports = {
  query,
  getClient,
  pool
};
