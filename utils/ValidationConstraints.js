import {validate} from 'validate.js';

export const validateString = (id, value) => {
  const constraints = {
    presence: {
      allowEmpty: false,
    },
  };

  if (value !== '') {
    constraints.format = {
      pattern: '.+',
      flags: 'i',
      message: "Value can't be blank.",
    };
  }

  const validationResult = validate({[id]: value}, {[id]: constraints});
  if (validationResult) {
    return {
      isValid: false,
      error: validationResult[id]?.[0] || `${id} is invalid.`,
    };
  }
  return { isValid: true, error: null };
};

export const validateEmail = (id, value) => {
  const constraints = {
    presence: {
      allowEmpty: false,
    },
    email: true,
  };

  const validationResult = validate({[id]: value}, {[id]: constraints});
  if (validationResult) {
    return {
      isValid: false,
      error: validationResult[id]?.[0] || 'Invalid email address.',
    };
  }
  return { isValid: true, error: null };
};

export const validatePassword = (id, value) => {
  const constraints = {
    presence: {
      allowEmpty: false,
    },
    length: {
      minimum: 6,
      message: 'must be at least 6 characters',
    },
  };

  const validationResult = validate({[id]: value}, {[id]: constraints});
  if (validationResult) {
    return {
      isValid: false,
      error: validationResult[id]?.[0] || 'Invalid password.',
    };
  }
  return { isValid: true, error: null };
};

export const validateCreditCardNumber = (id, value) => {
  const constraints = {
    presence: {
      allowEmpty: false,
    },
    format: {
      pattern: /^(?:\d{4}-){3}\d{4}$|^\d{16}$/,
      message: 'Invalid credit card number.',
    },
  };

  const validationResult = validate({[id]: value}, {[id]: constraints});
  return validationResult && validationResult[id];
};

export const validateCVV = (id, value) => {
  const constraints = {
    presence: {
      allowEmpty: false,
    },
    format: {
      pattern: /^[0-9]{3,4}$/,
      message: 'Invalid CVV.',
    },
  };

  const validationResult = validate({[id]: value}, {[id]: constraints});
  return validationResult && validationResult[id];
};

export const validateExpiryDate = (id, value) => {
  const constraints = {
    presence: {
      allowEmpty: false,
    },
    format: {
      pattern: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
      message: 'Invalid expiry date. Please use MM/YY format.',
    },
  };

  const validationResult = validate({[id]: value}, {[id]: constraints});
  return validationResult && validationResult[id];
};

// Valida números de teléfono
export const validatePhoneNumber = (id, value) => {
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  if (!phoneRegex.test(value)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number.',
    };
  }
  return { isValid: true, error: null };
};
// Valida fechas en formato YYYY-MM-DD
export const validateDate = (inputId, inputValue) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(inputValue)) {
    return 'Please enter a valid date (YYYY-MM-DD).';
  }
  return null; // Válido
};
