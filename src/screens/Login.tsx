import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Login = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    
    const handleLogin = async () => {
        
        try {
            const response = await fetch('http://192.168.81.31:8000/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();
            console.log("------clicked",email,password);

            if ((response.status === 200 || response.status === 201) && data.token) {
                console.log("------******clicked",email,password);

                await AsyncStorage.setItem('userToken', data.token);
                
                Alert.alert('Success', data.message, [
                    { 
                        text: 'OK', 
                        onPress: () => navigation.reset({
                            index: 0,
                            routes: [{ name: 'DrawerHome', params: { screen: 'Home' } }],
                        })
                    },
                ]);
            } else {
                Alert.alert('Login Failed', data.message);
                console.warn('Login failed:', data);
            }

        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again later.');
            console.error('Login error:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>

            <View style={styles.headingContainer}>
                <Text style={styles.heading}>
                    Sign in to
                </Text>
                <Text style={styles.heading}>Your Account</Text>
            </View>

            <View style={styles.formContainer}>

                <Text style={styles.formText}>Email</Text>

                <View style={styles.textContainer}>

                    <Icon name="envelope-o" size={22} color="#99AAAB" style={styles.textIcon} />

                    <TextInput
                        placeholder="Enter Email"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                </View>
            </View>

            <View style={styles.formContainer}>

                <Text style={styles.formText}>Password</Text>

                <View style={styles.textContainer}>

                    <Icon name="lock" size={22} color="#99AAAB" style={styles.textIcon} />

                    <TextInput
                        placeholder="Enter Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!passwordVisible}
                        style={styles.input}
                    />

                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                        <Icon
                            name={passwordVisible ? 'eye' : 'eye-slash'}
                            size={22}
                            color="#99AAAB"
                        />
                    </TouchableOpacity>

                </View>
            </View>

            <TouchableOpacity 
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPassword}
            >
                <Text style={styles.forgotPasswordText}>Forgot Password</Text>
            </TouchableOpacity>

            <View style={styles.submitRow}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleLogin}
                >
                    <Text style={styles.submitButtonText}>Login</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.registerContainer}>
                <Text style={{color: '#99AAAB'}}>Don't have Account! </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.registerButtonText}>Click Here to Register</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headingContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: 150,
        paddingHorizontal: 30,
        paddingBottom: 10
    },
    heading: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    formContainer: {
        marginTop: 5,
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
        paddingLeft: 30,
        paddingRight: 10,
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
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

export default Login;