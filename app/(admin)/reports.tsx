import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const Reports = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Reports Page</Text>
            <Text style={styles.subtext}>Mobile implementation pending</Text>
        </View>
    )
}

export default Reports

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    subtext: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 8
    }
})
