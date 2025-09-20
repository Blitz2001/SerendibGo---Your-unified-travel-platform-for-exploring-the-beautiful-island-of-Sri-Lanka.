// Enhanced form validation utilities
import { useState } from 'react';

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
  };
};

// Phone number validation (Sri Lankan format)
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+94|0)[0-9]{9}$/;
  return {
    isValid: phoneRegex.test(phone),
    message: phoneRegex.test(phone) ? '' : 'Please enter a valid Sri Lankan phone number'
  };
};

// Password validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    message: errors.length === 0 ? '' : errors.join(', ')
  };
};

// Name validation
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return {
    isValid: nameRegex.test(name),
    message: nameRegex.test(name) ? '' : 'Name must be 2-50 characters and contain only letters and spaces'
  };
};

// Required field validation
export const validateRequired = (value, fieldName = 'This field') => {
  return {
    isValid: value && value.toString().trim().length > 0,
    message: value && value.toString().trim().length > 0 ? '' : `${fieldName} is required`
  };
};

// Date validation
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return {
      isValid: false,
      message: `${fieldName} is required`
    };
  }

  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(dateObj.getTime())) {
    return {
      isValid: false,
      message: 'Please enter a valid date'
    };
  }

  if (dateObj < today) {
    return {
      isValid: false,
      message: `${fieldName} cannot be in the past`
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

// Date range validation
export const validateDateRange = (startDate, endDate) => {
  const startValidation = validateDate(startDate, 'Start date');
  if (!startValidation.isValid) {
    return startValidation;
  }

  const endValidation = validateDate(endDate, 'End date');
  if (!endValidation.isValid) {
    return endValidation;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return {
      isValid: false,
      message: 'End date must be after start date'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

// Number validation
export const validateNumber = (value, min = 0, max = Infinity, fieldName = 'Number') => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return {
      isValid: false,
      message: `${fieldName} must be a valid number`
    };
  }

  if (num < min) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${min}`
    };
  }

  if (num > max) {
    return {
      isValid: false,
      message: `${fieldName} must be no more than ${max}`
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url);
    return {
      isValid: true,
      message: ''
    };
  } catch {
    return {
      isValid: false,
      message: 'Please enter a valid URL'
    };
  }
};

// Comprehensive form validation
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const rules = validationRules[field];
    
    // Check each validation rule
    for (const rule of rules) {
      const validation = rule(value, field);
      
      if (!validation.isValid) {
        errors[field] = validation.message;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });

  return {
    isValid,
    errors
  };
};

// Common validation rules
export const validationRules = {
  email: [(value) => validateRequired(value, 'Email'), validateEmail],
  password: [(value) => validateRequired(value, 'Password'), validatePassword],
  name: [(value) => validateRequired(value, 'Name'), validateName],
  phone: [(value) => validateRequired(value, 'Phone'), validatePhone],
  required: [(value, fieldName) => validateRequired(value, fieldName)],
  date: [(value, fieldName) => validateDate(value, fieldName)],
  number: [(value, fieldName, min, max) => validateNumber(value, min, max, fieldName)],
  url: [(value) => validateURL(value)]
};

// Real-time validation hook
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field in real-time if it's been touched
    if (touched[field] && validationRules[field]) {
      const validation = validateForm({ [field]: value }, { [field]: validationRules[field] });
      setErrors(prev => ({ ...prev, [field]: validation.errors[field] || '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field when it loses focus
    if (validationRules[field]) {
      const validation = validateForm({ [field]: values[field] }, { [field]: validationRules[field] });
      setErrors(prev => ({ ...prev, [field]: validation.errors[field] || '' }));
    }
  };

  const validateAll = () => {
    const validation = validateForm(values, validationRules);
    setErrors(validation.errors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return validation.isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues
  };
};
