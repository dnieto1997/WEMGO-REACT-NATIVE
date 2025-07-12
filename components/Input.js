import { View, Text, StyleSheet, TextInput } from 'react-native';
import React from 'react';
import { COLORS, SIZES } from '../constants';

const Input = (props) => {
  const {
    iconComponent,
    placeholder,
    placeholderTextColor,
    value,
    onChangeText,
    errorText,
    ...rest
  } = props;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          { borderColor: COLORS.secondaryWhite },
        ]}
      >
        {iconComponent && (
          <View style={styles.icon}>
            {iconComponent}
          </View>
        )}

        <TextInput
          {...rest}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      {errorText && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding2,
    borderRadius: 12,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    backgroundColor: 'rgb(51, 51, 51)',
  },
  icon: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingTop: 0,
    top: 5,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: COLORS.white,
  },
  errorContainer: {
    marginVertical: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});

export default Input;
