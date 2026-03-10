import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

type buttonProps = {
  option: string;
  text: string;
  onPress?: () => void;
}

const OptionButton = ({ option, text, onPress }: buttonProps) => {
  return (
    <TouchableOpacity
      className="flex-1 justify-center items-center w-[190px] max-h-[42px] bg-[#F03986] border-4 border-[#571530] rounded shadow-md"
      onPress={onPress}
    >
      <Text className="text-xl text-[#3D0F22] font-bold">{text}</Text>
    </TouchableOpacity>
  )
}

export default OptionButton