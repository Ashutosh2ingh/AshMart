import { StyleSheet, Text, View, ScrollView, TextInput, Alert } from 'react-native'
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const Register = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleRegister = async () => {
        try {
            const response = await fetch('http://192.168.81.31:8000/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Success', data.message, [
                    { 
                        text: 'OK', 
                        onPress: () => navigation.navigate('Login') 
                    },
                ]);
            } else {
                Alert.alert('Error', data.message || 'Registration failed');
                console.log('Validation errors:', data.errors);
            }

        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again later.');
            console.error('Register error:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>

            <View style={styles.headingContainer}>
                <Text style={styles.heading}>
                    Create Your
                </Text>
                <Text style={styles.heading}>Account</Text>
            </View>

            <View style={styles.formContainer}>

                <Text style={styles.formText}>First Name</Text>

                <View style={styles.textContainer}>

                    <Icon name="user-o" size={22} color="#99AAAB" style={styles.textIcon} />

                    <TextInput
                        placeholder="Enter Last Name"
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                    />

                </View>
            </View>

            <View style={styles.formContainer}>

                <Text style={styles.formText}>Last Name</Text>

                <View style={styles.textContainer}>

                    <Icon name="user-o" size={22} color="#99AAAB" style={styles.textIcon} />

                    <TextInput
                        placeholder="Enter Last Name"
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                    />

                </View>
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

            <View style={styles.submitRow}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleRegister}
                >
                    <Text style={styles.submitButtonText}>Create</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.loginContainer}>
                <Text style={{color: '#99AAAB'}}>Already have an account! </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('DrawerHome', { screen: 'Login' })}
                >
                    <Text style={styles.loginButtonText}>Click Here to Login</Text>
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
        marginTop: 50,
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
    loginContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    loginButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#BB2CD9',
        textDecorationLine: 'underline',
    }
})

export default Register;