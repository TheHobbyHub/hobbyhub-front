import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#9EA0A4"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E4E8',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333333',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
});