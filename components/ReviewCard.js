import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import ReviewStars from './ReviewStars'
import { COLORS, SIZES } from "../constants"
import { getTimeAgo } from '../utils/date'

const ReviewCard = ({ image, date, title, description, num }) => {
    return (
        <View style={styles.container}>
            <Image
                source={image}
                style={styles.avatar}
            />
            <View style={styles.content}>
                <Text style={styles.date}>{getTimeAgo(date)}</Text>
                <Text style={styles.title}>{title}</Text>
                <ReviewStars review={num} />
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 12,
        width: SIZES.width - 24
    },
    avatar: {
        height: 48,
        width: 48,
        borderRadius: 24,
        marginRight: 12
    },
    content: {
        flexDirection: 'column',
        flex: 1,
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: COLORS.gray
    },
    date: {
        fontSize: 12,
        fontFamily: 'regular',
        color: COLORS.gray5
    },
    title: {
        fontSize: 14,
        fontFamily: 'bold',
        marginVertical: 6
    },
    description: {
        fontSize: 12,
        fontFamily: 'regular',
        marginTop: 6
    }
})

export default ReviewCard