import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    TouchableOpacity,
    TextInput,
    Text,
    ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const ChangePasswordScreen = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [oldpasswordVisible, setOldPasswordVisible] = useState(false);
    const [newpasswordVisible, setNewPasswordVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setOldPassword('');
                setNewPassword('');
            };
        }, [])
    );

    const handleChangePassword = async () => {

        if (!oldPassword || !newPassword) {
            Alert.alert('Validation Error', 'Please fill in both fields.');
            return;
        }
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch('http://192.168.81.31:8000/password/', {
                method: 'PUT',
                headers: {
                    "Authorization": `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                Alert.alert('Error', result.message || 'Password change failed.');
            } else {
                setOldPassword('');
                setNewPassword('');
                Alert.alert('Success', result.message, [
                    { 
                        onPress: () => navigation.reset({
                            index: 0,
                            routes: [{ name: 'DrawerHome', params: { screen: 'Home' } }],
                        })
                    },
                ]);
            }
        } catch (error) {
            Alert.alert('Network Error', 'Unable to change password. Try again later.');
        }
    };

    return (
        <ScrollView style={styles.container}>

            <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Icon name="arrow-left" size={20} />
            </TouchableOpacity>
            
            <View style={styles.headingContainer}>
                <Text style={styles.heading}>Change</Text>
                <Text style={styles.heading}>Password</Text>
            </View>

            <View style={styles.formContainer}>

                <Text style={styles.formText}>Old Password</Text>

                <View style={styles.textContainer}>

                    <Icon name="lock" size={22} color="#99AAAB" style={styles.textIcon} />

                    <TextInput
                        placeholder="Enter Old Password"
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        secureTextEntry={!oldpasswordVisible}
                        style={styles.input}
                    />

                    <TouchableOpacity onPress={() => setOldPasswordVisible(!oldpasswordVisible)}>
                        <Icon
                            name={oldpasswordVisible ? 'eye' : 'eye-slash'}
                            size={22}
                            color="#99AAAB"
                        />
                    </TouchableOpacity>

                </View>
            </View>
            
            <View style={styles.formContainer}>

                <Text style={styles.formText}>New Password</Text>

                <View style={styles.textContainer}>

                    <Icon name="lock" size={22} color="#99AAAB" style={styles.textIcon} />

                    <TextInput
                        placeholder="Enter New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!newpasswordVisible}
                        style={styles.input}
                    />

                    <TouchableOpacity onPress={() => setNewPasswordVisible(!newpasswordVisible)}>
                        <Icon
                            name={newpasswordVisible ? 'eye' : 'eye-slash'}
                            size={22}
                            color="#99AAAB"
                        />
                    </TouchableOpacity>

                </View>
            </View>
            
            <View style={styles.submitRow}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleChangePassword}
                >
                    <Text style={styles.submitButtonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: '#FFFAFA',
        top: 30,
        left: 15
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
});

export default ChangePasswordScreen;