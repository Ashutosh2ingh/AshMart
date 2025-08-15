import React, { useState, useCallback } from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BottomNavigation = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [cartCount, setCartCount] = useState<number>(0);

    const fetchCart = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch('http://192.168.81.31:8000/cart/', {
                method: "GET",
                headers: {
                    "Authorization": `Token ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }
            const data = await res.json();
            setCartCount(data.length); 
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to fetch cart items");
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [])
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity>
                <Icon name="home" size={28} color="#1E293B" />
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.cartButton}
                onPress={() => navigation.navigate('Cart')}
            >
                <View style={styles.cartButtonCircle}>
                    <Icon name="shopping-cart" size={28} color="#6366F1" />
                </View>

                {cartCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{cartCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
            >
                <Icon name="person" size={28} color="#64748B" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 50,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    cartButton: {
        position: 'relative',
        bottom: 20,
    },
    cartButtonCircle: {
      width: 50,
      height: 50,
      backgroundColor: '#fff',
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: 2,
        backgroundColor: '#6366F1',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default BottomNavigation
