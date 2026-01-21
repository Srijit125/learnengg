import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

type buttonProps = {
    option: string;
    text: string;
    onPress?: () => void;
}


const OptionButton = ({option, text, onPress}: buttonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
        
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  )
}

export default OptionButton

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        width: 190,
        maxHeight: 42,
        backgroundColor: "#F03986",
        borderColor: "#571530",
        borderWidth: 4,
        borderRadius: 4,
        shadowColor: "#571530",
        shadowRadius: 4,
        shadowOffset: {height: 4, width: 4}
    },
    buttonText: {
        fontSize: 20,
        color: "#3D0F22",
        fontWeight: "bold"
    }
})