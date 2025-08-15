import React, { useState, useEffect,  useImperativeHandle, forwardRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HeaderHandle = {
  fetchWishlist: () => void;
};

const Header = forwardRef((props, ref) => {
    
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [profilePhoto, setProfilePhoto] = useState('');
    const [wishListCount, setWishListCount] = useState<number>(0);

    const fetchProfilePhoto = async () => {

        const token = await AsyncStorage.getItem('userToken');

        try {
            const response = await fetch('http://192.168.81.31:8000/profile/', {
                method: "GET",
                headers: {
                    "Authorization": `Token ${token}`,
                },
            });

            if (!response.ok) {
                if(response.status !== 401) {
                    console.error('Server Error:', response.status);
                    Alert.alert('Error', `Failed to fetch profile (${response.status})`);
                    return;
                }
            }

            const data = await response.json();
            setProfilePhoto(data.profile_photo); 

        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchWishlist = async () => {

        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;

            const response = await fetch('http://192.168.81.31:8000/wishlist/', {
                method: "GET",
                headers: {
                    "Authorization": `Token ${token}`,
                }
            });

            if (!response.ok) {
                console.error('Error fetching wishlist:', response.status);
                return;
            }

            const wishlistData = await response.json();

            setWishListCount(wishlistData.length);
            
        } catch (error) {
            console.error("Wishlist fetch error:", error);
        }
    };

    useImperativeHandle(ref, () => ({
        fetchWishlist
    }));
    
    useEffect(() => {
        fetchProfilePhoto();
        fetchWishlist();
    }, []);

    return (

        <View style={styles.container}>

            {/* Profile */}
            <TouchableOpacity
                onPress={() => navigation.navigate('ProfilePhoto')}
            >
                <Image 
                    source={ 
                        profilePhoto ? 
                            { uri: `http://192.168.81.31:8000/${profilePhoto}` }
                            : require('../assets/images/profile.jpg')
                    }
                    style={styles.avatar} 
                />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.logo}
                />
            </View>

            {/* Wishlist */}
            <TouchableOpacity
                onPress={() => navigation.navigate('Wishlist')}
                style={styles.iconWrapper}
            >
                <Icon name="heart-o" size={24} color="#E44236" />
                {wishListCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{wishListCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

        </View>

    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        position: 'relative',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    logoContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 150,
        height: 130,
        resizeMode: 'contain',
    },
    iconWrapper: {
        position: 'relative',
        padding: 5,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#3498DB',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default Header;