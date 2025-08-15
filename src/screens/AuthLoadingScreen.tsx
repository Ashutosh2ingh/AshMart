import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../App';

const AuthLoadingScreen = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {

    const checkLoginStatus = async () => {

      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      try {
        const response = await fetch('http://192.168.81.31:8000/verify-token/', {
          method: 'GET',
          headers: {
            "Authorization": `Token ${token}`,
          },
        });

        if (response.status === 200) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'DrawerHome', params: { screen: 'Home' } }],
          });
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        await AsyncStorage.removeItem('userToken');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AuthLoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});