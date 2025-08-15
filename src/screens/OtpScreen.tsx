
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import React, { useRef, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const OtpScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { phone } = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const verifyOtp = async () => {
    const otpCode = otp.join('');
    try {
      const response = await fetch('http://192.168.81.31:8000/verify-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.status === 200 ) {
        Alert.alert('Success', data.message, [
          { 
            text: 'OK', 
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'ResetPassword', params: { phone: phone } }],
            })
          },
        ]);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (index < 3) inputRefs.current[index + 1]?.focus();
    } else if (text === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <ScrollView style={styles.container}>
      
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.backButton}>
          <Icon name="arrow-left" size={14} />
        </TouchableOpacity>

      <View style={styles.headingContainer}>
        <Text style={styles.heading}>Enter </Text>
        <Text style={styles.heading}>OTP Code</Text>
      </View>

      <Text style={styles.text}>
        An 4 digits code has been send on 
        <Text style={styles.highlight}>&nbsp;&nbsp;{phone}</Text>
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {inputRefs.current[index] = ref!}}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            textAlign="center"
          />
        ))}
      </View>

      <View style={styles.buttonRow}>

        <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => setOtp(['', '', '', ''])}
        >
          <Text style={{ color: '#6366F1' }}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={verifyOtp}>
          <Text style={{ color: '#fff' }}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headingContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 10
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    marginRight: 15,
    marginTop: 40
  },
  textContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  text: {
    paddingHorizontal: 20,
  },
  highlight: {
    color: '#6366F1',
    fontSize: 17,
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 50,
    marginBottom: 10
  },
  otpInput: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 18,
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderColor: '#6366F1',
    borderWidth: 1,
    borderRadius: 6,
  },
  continueButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#6366F1',
    borderRadius: 6,
  },
});

export default OtpScreen;