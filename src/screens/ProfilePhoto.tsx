import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfilePhoto = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [profile, setProfile] = useState([]);

    const fetchProfilePhoto = async () => {

        const token = await AsyncStorage.getItem('userToken');

        if(!token){
            navigation.navigate('Login');
            return;
        } else {
            try {
                const response = await fetch('http://192.168.81.31:8000/profile/', {
                    method: "GET",
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status !== 401){
                        console.error('Server Error:', response.status);
                        Alert.alert('Error', `Failed to fetch profile (${response.status})`);
                        return;
                    }
                }

                const data = await response.json();

                setProfile(data.profile_photo);

            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        }
    };

    useEffect(() => {
        fetchProfilePhoto();
    }, [])

    const handleImageUpload = async () => {

        const token = await AsyncStorage.getItem('userToken');

        if(!token){
            navigation.navigate('Login');
            return;
        }

        const result = await launchImageLibrary({ mediaType: 'photo' });

        if (result.assets && result.assets.length > 0) {

            const image = result.assets[0];
            const formData = new FormData();

            formData.append('profile_photo', {
                uri: image.uri,
                name: image.fileName,
                type: image.type,
            } as any);

            try {
                const response = await fetch('http://192.168.81.31:8000/profile/', {
                    method: 'PUT',
                    headers: {
                        "Authorization": `Token ${token}`,
                    },
                    body: formData,
                });

                if (response.ok) {
                    Alert.alert('Success', 'Image uploaded successfully', [
                        { 
                            onPress: () => navigation.reset({
                                index: 0,
                                routes: [{ name: 'DrawerHome', params: { screen: 'Home' } }],
                            })
                        },
                    ]);
                    fetchProfilePhoto();
                } else {
                    Alert.alert('Error', 'Image upload failed');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Image upload failed');
            }
        }
    };

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 15 }}
        >
            <View style={styles.headingContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={15} />
                </TouchableOpacity>
                <Text style={styles.heading}>Edit Profile Photo</Text>
            </View>

            <View style={styles.logoContainer}>
                <Image 
                    source={
                        profile
                        ? { uri: `http://192.168.81.31:8000/${profile}` }
                        : require('../assets/images/profile.jpg')
                    }
                    style={styles.logo} 
                />
                <TouchableOpacity onPress={handleImageUpload}>
                    <Icon name="edit" style={styles.logoIcon} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DAE0E2',
    },
    headingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    backButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        borderRadius: 40,
        backgroundColor: '#FFFAFA',
        marginRight: 15,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    logoContainer: {
        alignItems: 'center',
        paddingTop: 100
    },
    logo: {
        width: 350,
        height: 350,
        borderRadius: 200
    },
    logoIcon: {
        top: -35,
        paddingLeft: 145,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 35
    }
})

export default ProfilePhoto