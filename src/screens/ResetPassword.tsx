import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, {useState} from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const ResetPassword = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<any>();
    const { phone } = route.params || {};

    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const resetPassword = async () => {
        try {
            const response = await fetch('http://192.168.81.31:8000/reset-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phone,
                    new_password: password
                }),
            });

            const data = await response.json();

            if (response.status === 200) {
                
                Alert.alert('Success', data.message, [
                    { 
                        text: 'OK', 
                        onPress: () => navigation.navigate('Login')
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
            
            <TouchableOpacity onPress={() => navigation.navigate('OtpScreen')} style={styles.backButton}>
                <Icon name="arrow-left" size={18} />
            </TouchableOpacity>

            <View style={styles.headingContainer}>
                <Text style={styles.heading}>
                    Reset
                </Text>
                <Text style={styles.heading}>Password</Text>
            </View>


            <View style={styles.formContainer}>

                <Text style={styles.formText}>New Password</Text>

                <View style={styles.textContainer}>
                
                    <Icon name="lock" size={22} color="#99AAAB" style={styles.textIcon} />

                    <TextInput
                        placeholder="Enter Password"
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!passwordVisible}
                        keyboardType="default"
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
                    onPress={resetPassword}
                >
                    <Text style={styles.submitButtonText}>Submit</Text>
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
        paddingHorizontal: 32,
        paddingVertical: 6,
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
    }
})

export default ResetPassword;