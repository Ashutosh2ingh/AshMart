import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, {useState} from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const ForgotPassword = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [phone, setPhone] = useState('');

    const sendOTP = async () => {
        try {
            const response = await fetch('http://192.168.81.31:8000/send-otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phone,
                }),
            });

            const data = await response.json();

            if (response.status === 200) {
                
                Alert.alert('Success', data.message, [
                    { 
                        text: 'OK', 
                        onPress: () => navigation.reset({
                            index: 0,
                            routes: [{ name: 'OtpScreen', params: { phone: phone } }],
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

    return (
        <ScrollView style={styles.container}>
            
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
                <Icon name="arrow-left" size={18} />
            </TouchableOpacity>

            <View style={styles.headingContainer}>
                <Text style={styles.heading}>
                    Forgot
                </Text>
                <Text style={styles.heading}>Password</Text>
            </View>

            <Text style={styles.text}>
                Don't worry! it happens. please enter the email associated with your account.
            </Text>

            <View style={styles.formContainer}>

                <Text style={styles.formText}>Mobile Number</Text>

                <View style={styles.textContainer}>
                                
                    <Icon name="phone" size={22} color="#99AAAB" style={styles.textIcon} />

                    <TextInput
                        placeholder="Enter Mobile Number"
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="numeric"
                    />

                </View>
            </View>

            <View style={styles.submitRow}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={sendOTP}
                >
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.registerContainer}>
                <Text style={{ color: '#99AAAB' }}>Already have an account!</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.registerButtonText}>Login</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
        marginRight: 15,
        marginTop: 40
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
    text: {
        paddingHorizontal: 20,
    },
    formContainer: {
        marginTop: 50,
        marginBottom: 10
    },
    formText: {
        fontWeight: '500',
        fontSize: 18,
        paddingHorizontal: 27,
        paddingVertical: 6
    },
    textContainer: {
        alignSelf: 'center',
        backgroundColor: '#ECEFF1',
        borderRadius: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: '85%',
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    textIcon: {
        position: 'absolute',
        left: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        paddingHorizontal: 30
    },
    forgotPassword: {
        paddingHorizontal: 30,
        paddingVertical: 8,
        alignItems: 'flex-end',
    },
    forgotPasswordText: {
        fontWeight: 'bold',
        fontSize: 14
    },
    submitRow: {
        alignSelf: 'center',
        width: '90%',
        marginTop: 15
    },
    submitButton: {
        backgroundColor: '#6366F1',
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    registerContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    registerButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#BB2CD9',
        textDecorationLine: 'underline',
    }
})

export default ForgotPassword;