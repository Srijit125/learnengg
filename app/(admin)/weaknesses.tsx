import React from 'react';
import { Text, View } from 'react-native';

export default function WeaknessesPlaceholder() {
    return (
        <View className="flex-1 justify-center items-center p-5 bg-background-light dark:bg-background-dark">
            <Text className="text-lg font-bold text-text-light dark:text-text-dark text-center">Admin Weaknesses Page (Mobile Placeholder)</Text>
            <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mt-2 text-center">Please use the web version for detailed analytics.</Text>
        </View>
    );
}
