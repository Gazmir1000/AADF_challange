// Email validation regex
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation - at least 6 characters
export const passwordRegex = /^.{6,}$/;

// Username validation - 3 to 20 characters, letters, numbers, underscores, hyphens
export const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

// Phone number validation - includes common formats
export const phoneRegex = /^(\+\d{1,3}[- ]?)?\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;

export const validateForm = (values) => {
  const errors = {};

  // Username validation
  if (!values.username) {
    errors.username = 'Username is required';
  } else if (!usernameRegex.test(values.username)) {
    errors.username = 'Username must be 3-20 characters using only letters, numbers, underscores, and hyphens';
  }

  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(values.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (!passwordRegex.test(values.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Phone validation
  if (!values.phone) {
    errors.phone = 'Phone number is required';
  } else if (!phoneRegex.test(values.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  return errors;
};

export const validateLoginForm = (values) => {
  const errors = {};

  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(values.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
}; 