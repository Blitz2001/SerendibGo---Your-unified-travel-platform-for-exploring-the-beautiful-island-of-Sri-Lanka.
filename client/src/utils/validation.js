// Validation utility functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+94|0)?[1-9][0-9]{8}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

export const validateNumber = (value) => {
  return !isNaN(value) && value !== '';
};

export const validatePositiveNumber = (value) => {
  return validateNumber(value) && parseFloat(value) > 0;
};

export const validateDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

export const validateFutureDate = (date) => {
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj instanceof Date && !isNaN(dateObj) && dateObj >= today;
};

export const validatePastDate = (date) => {
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj instanceof Date && !isNaN(dateObj) && dateObj <= today;
};

// Form validation schemas
export const profileValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Name must be between 2 and 100 characters'
  },
  email: {
    required: true,
    validator: validateEmail,
    message: 'Please enter a valid email address'
  },
  phone: {
    required: true,
    validator: validatePhone,
    message: 'Please enter a valid phone number'
  },
  bio: {
    maxLength: 1000,
    message: 'Bio must be less than 1000 characters'
  },
  experience: {
    validator: validatePositiveNumber,
    message: 'Experience must be a positive number'
  },
  location: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Location must be between 2 and 100 characters'
  }
};

export const serviceValidationSchema = {
  hourlyRate: {
    validator: validatePositiveNumber,
    message: 'Hourly rate must be a positive number'
  },
  dailyRate: {
    validator: validatePositiveNumber,
    message: 'Daily rate must be a positive number'
  },
  weeklyRate: {
    validator: validatePositiveNumber,
    message: 'Weekly rate must be a positive number'
  },
  maxGroupSize: {
    validator: validatePositiveNumber,
    message: 'Maximum group size must be a positive number'
  }
};

export const availabilityValidationSchema = {
  workingHours: {
    startTime: {
      required: true,
      message: 'Start time is required'
    },
    endTime: {
      required: true,
      message: 'End time is required'
    }
  }
};

// Validation helper function
export const validateField = (value, schema) => {
  if (schema.required && !validateRequired(value)) {
    return 'This field is required';
  }
  
  if (schema.minLength && !validateMinLength(value, schema.minLength)) {
    return `Minimum length is ${schema.minLength} characters`;
  }
  
  if (schema.maxLength && !validateMaxLength(value, schema.maxLength)) {
    return `Maximum length is ${schema.maxLength} characters`;
  }
  
  if (schema.validator && !schema.validator(value)) {
    return schema.message;
  }
  
  return null;
};

// Validate entire form
export const validateForm = (data, schema) => {
  const errors = {};
  
  Object.keys(schema).forEach(field => {
    const error = validateField(data[field], schema[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
