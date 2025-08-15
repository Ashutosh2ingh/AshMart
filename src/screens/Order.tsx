import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface OrderItem {
    order_id: number;
    customer: number;
    product_variation: {
        id: number;
        product_name: string;
        product_image: string;
    };
    order_status: string;
    order_date: string;
}

const Order = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState<boolean>(true);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    useEffect(() => {
        fetchOrder();
    }, []);

    const fetchOrder = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get('http://192.168.81.31:8000/order/', {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setOrderItems(res.data.data);            
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Unable to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options).replace(',', '');
    };

    return (
        <ScrollView style={styles.container}>

            <View style={styles.headingContainer}>
                <TouchableOpacity 
                    onPress={() => {
                        navigation.navigate({ name: 'DrawerHome', params: { screen: 'Home' } });
                    }} 
                    style={styles.backButton}
                >
                    <Icon name="arrow-left" size={15} />
                </TouchableOpacity>
                <Text style={styles.heading}>Orders</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} />
            ) : orderItems.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <Text style={{ fontSize: 16, color: '#A9A9A9' }}>No orders found</Text>
                </View>
            ) : (
                orderItems.map((item) => (
                    <TouchableOpacity 
                        key={item.order_id} 
                        style={styles.orderCardWrapper}
                        onPress={() => navigation.navigate('OrderDetail', { 
                            orderId: item.order_id 
                        })}
                    >
                        <View style={styles.orderCard}>

                            <Image 
                                style={styles.image} 
                                source={{ uri: `http://192.168.81.31:8000/media/${item.product_variation.product_image}` }}
                            />

                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>{item.product_variation.product_name}</Text>

                                <Text style={styles.date}>Ordered On {formatDate(item.order_date)}</Text>

                                <View style={styles.statusContainer}>
                                    <Text style={styles.statusLabel}>Order Status:</Text>
                                    <Text 
                                        style={[
                                            styles.status,
                                            { color: item.order_status === 'Delivered' ? '#22C55E' : '#6366F1' }
                                        ]}
                                    >
                                        {item.order_status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingLeft: 10,
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
        marginLeft: 15
    },
    orderCardWrapper: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10
    },
    orderCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 3,
        width: '90%',
        height: 100,
        overflow: 'hidden',
    },
    image: {
        backgroundColor: '#EAF0F1',
        width: '30%',
        height: '80%',
        resizeMode: 'contain',
        borderRadius: 10,
        marginTop: 10,
        marginLeft: 15
    },
    titleContainer: {
        flexDirection: 'column',
        paddingTop: 15,
        paddingLeft: 15,
        width: '55%'
    },
    title: {
        fontWeight: '700',
        fontSize: 16,
        color: '#A9A9A9'
    },
    date: {
        fontSize: 13,
        fontWeight: '600',
        color: '#99AAAB',
        paddingTop: 3
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 5
    },
    statusLabel: {
        fontWeight: '500',
        color: '#99AAAB'
    },
    status: {
        fontWeight: 'bold',
        fontSize: 15,
        paddingTop: 2,
        paddingLeft: 5
    },
    buyCardWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center', 
        marginVertical: 5,
        paddingVertical: 13,
        paddingHorizontal: 17,
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    buyTitle: {
        fontWeight: '600',
        fontSize: 15
    },
})

export default Order