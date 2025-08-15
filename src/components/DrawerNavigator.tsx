import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { createDrawerNavigator, DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Home from '../screens/Home';
import withAuth from './WithAuth';

const Drawer = createDrawerNavigator();

const DrawerPlaceholderScreen = () => <View />;

function CustomDrawerContent(props: DrawerContentComponentProps) {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pressed, setPressed] = useState(false);
  const [accountExpanded, setAccountExpanded] = useState(false);

  const handleLogout = async () => {

    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert('Already Logged Out', "Log in First!", [
          {
            text: 'OK',
            onPress: () => {
              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }, 1000);
            }
          }
        ]);
        return;
      }

      const response = await fetch('http://192.168.81.31:8000/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      await AsyncStorage.removeItem('userToken');

      if (response.ok) {

        const data = await response.json();

        Alert.alert('Success', data.message, [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            }),
          },
        ]);
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      await AsyncStorage.removeItem('userToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (

    <View style={{ flex: 1 }}>

      <DrawerContentScrollView {...props}>
        
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            navigation.navigate({ name: 'DrawerHome', params: { screen: 'Home' } });
            setAccountExpanded(false);
          }}
        >
          <Text style={styles.drawerText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setAccountExpanded(!accountExpanded)}
        >
          <Text style={styles.dropdownHeaderText}>Account</Text>
          <Text style={styles.dropdownArrow}>{accountExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {accountExpanded && (
          <View style={styles.subMenu}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Profile');
                setAccountExpanded(false);
              }}
              style={styles.subItem}
            >
              <Text style={styles.subItemText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Order');
                setAccountExpanded(false);
              }}
              style={styles.subItem}
            >
              <Text style={styles.subItemText}>Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ChangePassword');
                setAccountExpanded(false);
              }}
              style={styles.subItem}
            >
              <Text style={styles.subItemText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        )}

      </DrawerContentScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleLogout}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          style={[styles.logoutButton, pressed && styles.logoutButtonPressed]}
        >
          <Text style={[styles.buttonText, pressed && styles.buttonTextPressed]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{ 
        headerShown: false, 
        drawerStyle: {
          width: 250
        }
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={withAuth(Home)} />
    </Drawer.Navigator>
  )
}

const styles = StyleSheet.create({
  drawerItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  drawerText: {
    fontSize: 18,
    fontWeight: '500',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dropdownHeaderText: {
    fontSize: 18,
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 18,
  },
  subMenu: {
    paddingLeft: 30,
    paddingBottom: 10,
  },
  subItem: {
    paddingVertical: 5,
  },
  subItemText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    alignItems: 'center',
    width: '50%',
  },
  logoutButtonPressed: {
    backgroundColor: 'red',
  },
  buttonText: {
    fontSize: 18,
    color: 'red',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  buttonTextPressed: {
    color: 'white',
  },
});

export default DrawerNavigator