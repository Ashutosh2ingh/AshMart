import { Alert } from 'react-native';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => {
        const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

        useEffect(() => {
            const verifyToken = async () => {
                const token = await AsyncStorage.getItem('userToken');

                if (!token) {
                    navigation.reset({ 
                        index: 0, 
                        routes: [{ 
                            name: 'Login' 
                        }] 
                    });
                    return;
                }

                try {
                    const res = await fetch('http://192.168.81.31:8000/verify-token/', {
                        method: 'GET',
                        headers: {
                            "Authorization": `Token ${token}`,
                        },
                    });

                    if (res.status !== 200) {
                        throw new Error('Invalid token');
                    }
                } catch (error) {
                    await AsyncStorage.removeItem('userToken');
                    Alert.alert('Unauthorized', "Please Login first!", [
                        { 
                        text: 'OK', 
                        onPress: () => navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        }),
                        },
                    ]);
                }
            };

            verifyToken();
        }, []);

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
