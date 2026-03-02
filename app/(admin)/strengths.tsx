import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function StrengthsPlaceholder() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Admin Strengths Page (Mobile Placeholder)</Text>
            <Text style={styles.subtext}>Please use the web version for detailed analytics.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
    text: { fontSize: 18, fontWeight: '700', color: '#1e293b', textAlign: 'center' },
    subtext: { fontSize: 14, color: '#64748b', marginTop: 8, textAlign: 'center' },
});
