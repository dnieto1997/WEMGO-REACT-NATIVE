import React from 'react'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { COLORS } from '../constants'

const PageContainer = (props) => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: COLORS.secondaryWhite }}
        >
            {props.children}
        </KeyboardAvoidingView>
    )
}

export default PageContainer