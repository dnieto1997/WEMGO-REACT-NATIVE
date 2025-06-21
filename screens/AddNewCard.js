import { View, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useReducer, useCallback, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '../styles/CommonStyles'
import { COLORS, SIZES, icons } from '../constants'
import Input from '../components/Input'
import { validateInput } from '../utils/actions/formActions'
import { reducer } from '../utils/reducers/formReducers'
import Button from '../components/Button'

const initialState = {
  inputValues: {
    creditCardHolderName: '',
    creditCardNumber: '',
    creditCardExpiryDate: '',
    cvv: ''
  },
  inputValidities: {
    creditCardHolderName: false,
    creditCardNumber: false,
    creditCardExpiryDate: false,
    cvv: false
  },
  formIsValid: false,
}

const AddNewCard = ({ navigation }) => {
  const [error, setError] = useState(null)
  const [formState, dispatchFormState] = useReducer(reducer, initialState)

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue)
      dispatchFormState({ inputId, validationResult: result, inputValue })
    },
    [dispatchFormState]
  )

  useEffect(() => {
    if (error) {
      Alert.alert('An error occured', error)
    }
  }, [error])
  const renderHeader = () => {
    const navigation = useNavigation();

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 20,
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={commonStyles.header1Icon}
        >
          <Image
            resizeMode='contain'
            source={icons.close}
            style={{ height: 12, width: 12, tintColor: COLORS.black }}
          />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 17, fontFamily: 'regular' }}>Add Card</Text>
      </View>
    )
  }

  const renderPaymentForm = () => {
    return (
      <View style={{ marginVertical: 22 }}>
        <View style={{ marginTop: 12 }}>
          <Text style={commonStyles.inputHeader}>card holder name</Text>
          <Input
            id="creditCardHolderName"
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['creditCardHolderName']}
            placeholder="Vishal Khadok"
            placeholderTextColor={COLORS.black}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={commonStyles.inputHeader}>Card number</Text>
          <Input
            id="creditCardNumber"
            onInputChanged={inputChangedHandler}
            errorText={formState.inputValidities['creditCardNumber']}
            placeholder="2143"
            placeholderTextColor={COLORS.black}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <View style={{ width: (SIZES.width - 32) / 2 - 10 }}>
            <Text style={commonStyles.inputHeader}>expire date</Text>
            <Input
              id="creditCardExpiryDate"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['creditCardExpiryDate']}
              placeholder="mm/yyyy"
              placeholderTextColor={COLORS.black}
            />
          </View>
          <View style={{ width: (SIZES.width - 32) / 2 - 10 }}>
            <Text style={commonStyles.inputHeader}>CVV</Text>
            <Input
              id="cvv"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['cvv']}
              placeholder="..."
              placeholderTextColor={COLORS.black}
            />
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, marginHorizontal: 16 }}>
        {renderHeader()}
        {renderPaymentForm()}
        <View
          style={{
            position: 'absolute',
            bottom: 30,
            width: SIZES.width - 32
          }}
        >
          <Button
            filled
            title="ADD"
            onPress={() => navigation.navigate("Settings")}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default AddNewCard