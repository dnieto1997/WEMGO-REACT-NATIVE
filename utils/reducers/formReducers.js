export const reducer = (state, action) => {
  const { inputId, inputValue, validationResult } = action;

  const updatedValues = {
    ...state.inputValues,
    [inputId]: inputValue,
  };

  const updatedValidities = {
    ...state.inputValidities,
    [inputId]: validationResult.isValid,
  };

  // Verificar si todo el formulario es válido
  const updatedFormIsValid = Object.values(updatedValidities).every(Boolean);


  return {
    ...state,
    inputValues: updatedValues,
    inputValidities: updatedValidities,
    formIsValid: updatedFormIsValid,
  };
};
