import { View, Text, StyleSheet, TextInput, Image } from 'react-native';
import React from 'react';
import { COLORS, SIZES } from '../constants';

const Input = (props) => {
    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.inputContainer,
                    { borderColor: COLORS.secondaryWhite },
                ]}
            >
                {props.icon && (
                    <Image
                        source={props.icon}
                        style={[
                            styles.icon
                        ]}
                    />
                )}
                <TextInput
                    {...props}
                    style={styles.input}
                    placeholder={props.placeholder}
                    placeholderTextColor={props.placeholderTextColor}
                    value={props.value} // Recibe el valor directamente desde el padre
                    onChangeText={props.onChangeText} // En vez de manejarlo internamente, se maneja desde el padre
                />
            </View>
            {props.errorText && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{props.errorText}</Text>
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
        color: COLORS.white,
        marginVertical: 5,
        flexDirection: 'row',
        height: 58,
        alignItems: "center",
        backgroundColor:"rgb(51, 51, 51)"
       
    },
    icon: {
        marginRight: 10,
        height: 20,
        width: 20,
        color: COLORS.white
       
      
    },
    input: {
        flex: 1,
        fontWeight:"bold",
        paddingTop: 0,
        top:5,
        fontFamily:"Poppins-Bold",
        color:"white"
    

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
