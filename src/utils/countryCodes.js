export const arabCountryCodes = [
  { code: 'SA', name: 'السعودية', dialCode: '+966', flag: '🇸🇦', pattern: /^05\d{8}$/ },
  { code: 'EG', name: 'مصر', dialCode: '+20', flag: '🇪🇬', pattern: /^01\d{9}$/ },
  { code: 'AE', name: 'الإمارات', dialCode: '+971', flag: '🇦🇪', pattern: /^05\d{8}$/ },
  { code: 'QA', name: 'قطر', dialCode: '+974', flag: '🇶🇦', pattern: /^[35]\d{7}$/ },
  { code: 'KW', name: 'الكويت', dialCode: '+965', flag: '🇰🇼', pattern: /^[569]\d{7}$/ },
  { code: 'BH', name: 'البحرين', dialCode: '+973', flag: '🇧🇭', pattern: /^3\d{7}$/ },
  { code: 'OM', name: 'عُمان', dialCode: '+968', flag: '🇴🇲', pattern: /^9\d{7}$/ },
  { code: 'JO', name: 'الأردن', dialCode: '+962', flag: '🇯🇴', pattern: /^7\d{8}$/ },
  { code: 'LB', name: 'لبنان', dialCode: '+961', flag: '🇱🇧', pattern: /^[37]\d{7}$/ },
  { code: 'SY', name: 'سوريا', dialCode: '+963', flag: '🇸🇾', pattern: /^9\d{8}$/ },
  { code: 'IQ', name: 'العراق', dialCode: '+964', flag: '🇮🇶', pattern: /^7\d{9}$/ },
  { code: 'PS', name: 'فلسطين', dialCode: '+970', flag: '🇵🇸', pattern: /^5\d{7}$/ },
  { code: 'LY', name: 'ليبيا', dialCode: '+218', flag: '🇱🇾', pattern: /^9\d{8}$/ },
  { code: 'TN', name: 'تونس', dialCode: '+216', flag: '🇹🇳', pattern: /^[2-5]\d{7}$/ },
  { code: 'DZ', name: 'الجزائر', dialCode: '+213', flag: '🇩🇿', pattern: /^[5-7]\d{8}$/ },
  { code: 'MA', name: 'المغرب', dialCode: '+212', flag: '🇲🇦', pattern: /^[6-7]\d{8}$/ },
  { code: 'SD', name: 'السودان', dialCode: '+249', flag: '🇸🇩', pattern: /^9\d{8}$/ },
  { code: 'YE', name: 'اليمن', dialCode: '+967', flag: '🇾🇪', pattern: /^7\d{8}$/ },
  { code: 'MR', name: 'موريتانيا', dialCode: '+222', flag: '🇲🇷', pattern: /^[2-4]\d{7}$/ },
  { code: 'SO', name: 'الصومال', dialCode: '+252', flag: '🇸🇴', pattern: /^[67]\d{7}$/ },
  { code: 'DJ', name: 'جيبوتي', dialCode: '+253', flag: '🇩🇯', pattern: /^7\d{7}$/ },
  { code: 'KM', name: 'جزر القمر', dialCode: '+269', flag: '🇰🇲', pattern: /^3\d{6}$/ }
];

export const getCountryByCode = (dialCode) => {
  return arabCountryCodes.find(country => country.dialCode === dialCode);
};

export const validatePhoneNumber = (phone, dialCode) => {
  const country = arabCountryCodes.find(c => c.dialCode === dialCode);
  if (!country) return false;

  // إزالة أي مسافات أو شرطات من رقم الهاتف
  const cleanPhone = phone.replace(/[\s-]/g, '');

  return country.pattern.test(cleanPhone);
};

export default arabCountryCodes;
