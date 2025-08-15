import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { launchImageLibrary } from 'react-native-image-picker';

const Profile = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [genderOpen, setGenderOpen] = useState(false);
    const [gender, setGender] = useState<string | null>(null);
    const [genderItems, setGenderItems] = useState([
        {
            label: 'Male',
            value: 'Male',
            icon: () => <Icon name="male" size={18} color="#64748B" />,
        },
        {
            label: 'Female',
            value: 'Female',
            icon: () => <Icon name="female" size={18} color="#EF4444" />,
        },
        {
            label: 'Other',
            value: 'Other',
            icon: () => <Icon name="genderless" size={18} color="#A78BFA" />,
        },
    ]);
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        gender: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zip: '',
        profile_photo: '',
    });

    const fetchProfile = async () => {

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

                setProfile({
                    ...data,
                    phone: data.phone?.toString() || '',
                    zip: data.zip?.toString() || '',
                });
                setGender(data.gender); 

            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (gender) {
            handleChange('gender', gender);
        }
    }, [gender]);

    const handleChange = (key: keyof typeof profile, value: string) => {
        setProfile(prev => ({ ...prev, [key]: value }));
    };

    const handleUpdate = async () => {

        const token = await AsyncStorage.getItem('userToken');

        if(!token){
            navigation.navigate('Login');
            return;
        } 

        const { profile_photo, ...profileDataWithoutPhoto } = profile;
        
        const payload: Record<string, any> = {};
        for (const [key, value] of Object.entries(profileDataWithoutPhoto)) {
            if (value !== '' && value !== null && value !== undefined) {
                if (key === 'phone' || key === 'zip') {
                    const parsed = parseInt(value as string);
                    if (!isNaN(parsed)) {
                        payload[key] = parsed;
                    }
                } else {
                    payload[key] = value;
                }
            }
        }

        try {
            const response = await fetch('http://192.168.81.31:8000/profile/', {
                method: 'PUT',
                headers: {
                    "Authorization": `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', data.message, [
                    { 
                        onPress: () => navigation.reset({
                            index: 0,
                            routes: [{ name: 'DrawerHome', params: { screen: 'Home' } }],
                        })
                    },
                ]);
            } else {
                Alert.alert('Error', 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile');
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
                <Text style={styles.heading}>Edit Profile</Text>
            </View>

            <View style={styles.logoContainer}>
                <Image 
                    source={
                        profile.profile_photo
                        ? { uri: `http://192.168.81.31:8000/${profile.profile_photo}` }
                        : require('../assets/images/profile.jpg')
                    }
                    style={styles.logo} 
                />
            </View>

            {[
                { label: 'First Name', key: 'first_name', icon: 'user-o' },
                { label: 'Last Name', key: 'last_name', icon: 'user-o' },
                { label: 'Email', key: 'email', icon: 'envelope-o' },
                { label: 'Phone No.', key: 'phone', icon: 'phone' },
                { label: 'Address', key: 'address', icon: 'home' },
                { label: 'City', key: 'city', icon: 'building' },
                { label: 'State', key: 'state', icon: 'map-marker' },
                { label: 'Country', key: 'country', icon: 'flag' },
                { label: 'Pincode', key: 'zip', icon: 'location-arrow' },
            ].map(({ label, key, icon }) => (
                <View style={styles.formContainer} key={key}>
                    <Text style={styles.formText}>{label}</Text>
                    <View style={styles.textContainer}>
                        <Icon name={icon} size={22} color="#99AAAB" style={styles.textIcon} />
                        <TextInput
                            placeholder={`Enter ${label}`}
                            style={styles.input}
                            keyboardType={key === 'phone' || key === 'zip' ? 'numeric' : 'default'}
                            value={(profile as any)[key]}
                            onChangeText={(text) => handleChange(key as keyof typeof profile, text)}
                        />
                    </View>
                </View>
            ))}

            {/* Gender Dropdown */}
            <View style={styles.formContainer}>
                <Text style={styles.formText}>Gender</Text>
                <View style={styles.dropdownWrapper}>
                    <DropDownPicker
                        open={genderOpen}
                        value={gender}
                        items={genderItems}
                        setOpen={setGenderOpen}
                        setValue={setGender}
                        setItems={setGenderItems}
                        placeholder="Select gender"
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        listMode="SCROLLVIEW"
                    />
                </View>
            </View>

            <View style={styles.submitRow}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleUpdate}
                >
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        alignItems: 'center'
    },
    logo: {
        width: 170,
        height: 170,
        borderRadius: 100
    },
    logoIcon: {
        top: -35,
        paddingLeft: 105,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 28
    },
    formContainer: {
        marginVertical: 5
    },
    formText: {
        fontWeight: '600',
        fontSize: 18,
        paddingHorizontal: 20,
        paddingVertical: 5
    },
    textContainer: {
        alignSelf: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: '90%',
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
        width: '100%',
        paddingHorizontal: 30,
        fontSize: 15,
        color: '#000',
    },
    dropdownWrapper: {
        zIndex: 999,
        width: '90%',
        alignSelf: 'center',
    },
    dropdown: {
        backgroundColor: '#F5F5F5',
        borderColor: '#E5E7EB',
    },
    dropdownContainer: {
        borderColor: '#E5E7EB',
        borderRadius: 20
    },
    submitRow: {
        alignSelf: 'center',
        width: '90%',
        marginTop: 25
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

export default Profile;