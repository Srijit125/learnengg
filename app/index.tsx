import { Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from 'react'

export default function Index() {

  const [userId, setUserId] = useState("")

  const onPress = (userId: string) =>{
    console.log(`Get analytics from API for ${userId}` )
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextInput placeholder="Enter the User ID" value={userId} onChangeText={setUserId}/>
      <TouchableOpacity style={{height: 50, width: 60, borderColor: "rgba(0,0,0,0)", borderWidth: 1, borderRadius: 15, backgroundColor: 'rgba(133, 82, 82, 0.49)'}} onPress={()=>onPress(userId)}>
        <Text> Get User Analytics</Text>
      </TouchableOpacity>
    </View>
  );
}
