

export const validateInput = (inputId, inputValue) => {

  switch (inputId) {
    case 'first_name':
    case 'last_name':
    case 'country':
      return inputValue.trim() !== '' ? { isValid: true, error: null } : { isValid: false, error: `${inputId} is required.` };

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(inputValue.trim()) ? { isValid: true, error: null } : { isValid: false, error: 'Email es Invalido.' };

     
    case 'phone':
      const phoneRegex = /^[0-9]{7,15}$/;
      return phoneRegex.test(inputValue.trim()) ? { isValid: true, error: null } : { isValid: false, error: 'Telefono es invalido.' };

    default:
      return { isValid: true, error: null }; // Para otros campos
  }
};

