import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

type MetricCardProps = {
    title: string;
    metric: number;
}

const MetricCard = ({title, metric}: MetricCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text>{metric}</Text>
    </View>
  )
}

export default MetricCard

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderWidth: 1,
        maxWidth: 200,
        alignItems: 'center',
        backgroundColor: "#ffffff",
        borderColor: "rgba(89,74,22,1)",
        borderRadius: 8,
        gap: 6,
        padding: 10,
        shadowColor: "rgba(89,74,22,1)",
        shadowOffset: {height: 4, width:4}
    },
    title:{
        color: "rgba(89, 74, 22, 1)",
        fontSize: 24,
        fontWeight: "700"
    }
})