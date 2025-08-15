import { ScrollView, StyleSheet, Text, View, Image, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'

const OrderDetail = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
    const { orderId } = route.params;

    const [loading, setLoading] = useState<boolean>(true);
    const [orderData, setOrderData] = useState<any>(null);

    useEffect(() => {
        fetchOrderDetail();
    }, []);

    const fetchOrderDetail = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(`http://192.168.81.31:8000/order/${orderId}/`, {
                headers: { 
                    'Authorization': `Token ${token}` 
                }
            });
            setOrderData(res.data.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Unable to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options).replace(',', '');
    };

    const getStatusIndex = () => {
        const statusList = ['Processing', 'Shipped', 'Out For Delivery', 'Delivered'];
        if (orderData?.order_status === 'Cancelled') return 1.5;
        return statusList.indexOf(orderData?.order_status);
    };

    const renderProgressBar = () => {
        const activeIndex = getStatusIndex();
        const statuses = ['Processing', 'Shipped', 'Out For Delivery', 'Delivered'];

        return (
            <View style={styles.verticalContainer}>
                {statuses.map((status, idx) => {
                    const isActive = idx <= activeIndex;
                    const isCancelled = orderData?.order_status === 'Cancelled' && idx === 1;
                    return (
                        <View key={status} style={styles.stepContainer}>
                            <View style={styles.leftColumn}>
                                <View style={[
                                    styles.stepCircle,
                                    isActive && !isCancelled && { backgroundColor: '#22C55E' },
                                    isCancelled && { backgroundColor: 'red' }
                                ]}>
                                    {isCancelled ? <Icon name="times" color="#fff" /> : <View />}
                                </View>

                                {idx < statuses.length - 1 && (
                                    <View style={[
                                        styles.verticalLine,
                                        idx < activeIndex && { backgroundColor: '#22C55E' }
                                    ]} />
                                )}
                            </View>

                            <Text style={styles.verticalLabel}>
                                {isCancelled ? 'Cancelled' : status}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} />;
    }

    if (!orderData) return null;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headingContainer}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-left" size={15} />
                </TouchableOpacity>
                <Text style={styles.heading}>Order Details</Text>
            </View>

            <View style={styles.detailWrapper}>
                <Image
                    source={{ uri: `http://192.168.81.31:8000/media/${orderData.product_variation.product_image}` }}
                    style={styles.productImage}
                />

                <Text style={styles.title}>{orderData.product_variation.product_name}</Text>
                <Text style={styles.color}>{orderData.product_variation.color.color}</Text>

                <View style={styles.otherDetailsContainer}>
                    <Text style={styles.detailHeader}>Other Details</Text>
                    <Text style={styles.size}>{orderData.product_variation.size.size}</Text>
                    <Text style={styles.quantity}>Quantity: {orderData.quantity}</Text>
                    <Text style={styles.orderDate}>Ordered On: {formatDate(orderData.order_date)}</Text>
                    {orderData.order_status === 'Delivered' ? (
                        <Text style={styles.orderDelivered}>
                            Delivered On {formatDate(orderData.order_status_date)}
                        </Text>
                    ):(
                        <Text style={styles.orderStatus}>
                            Status: {orderData.order_status}
                        </Text>
                    )}
                </View>
            </View>

            {renderProgressBar()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 15
    },
    headingContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    backButton: {
        justifyContent: 'center', 
        alignItems: 'center',
        width: 30, 
        height: 30, 
        borderRadius: 40, 
        backgroundColor: '#FFFAFA', 
        marginRight: 15
    },
    heading: { 
        fontSize: 22, 
        fontWeight: 'bold' 
    },
    productImage: {
        width: '80%', 
        height: 200, 
        resizeMode: 'contain',
        backgroundColor: '#EAF0F1', 
        borderRadius: 15, 
        marginBottom: 5,
        alignSelf: 'center'
    },
    detailWrapper: {
        alignItems: 'center'
    },
    title: { 
        fontSize: 25, 
        fontWeight: 'bold'
    },
    color: {
        color: '#99AAAB',
        fontSize: 16,
        fontWeight: 'bold'
    },
    otherDetailsContainer: {
        backgroundColor: '#fff',
        width: '80%',
        borderRadius: 15,
        elevation: 3,
        alignItems: 'center',
        overflow: 'hidden',
        padding: 7,
        marginTop: 15
    },
    detailHeader: {
        fontSize: 22,
        fontWeight: 900,
        color: '#A9A9A9'
    },
    size: {
        paddingTop: 3,
        fontSize: 17,
        fontWeight: 600,
        color: '#6366F1'
    },
    quantity: {
        fontSize: 17,
        fontWeight: 600,
        color: '#6366F1'
    },
    orderDate: {
        fontSize: 17,
        fontWeight: 600,
        color: '#6366F1'
    },
    orderStatus: { 
        fontSize: 17, 
        fontWeight: 600,
        color: '#6366F1'
    },
    orderDelivered: {
        fontSize: 18, 
        fontWeight: 'bold',
        color: '#22C55E'
    },
    verticalContainer: {
        justifyContent: 'center',
        marginTop: 30,
        width: '100%',
        alignItems: 'center'
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '80%',  
    },
    leftColumn: {
        alignItems: 'center',
        width: 20,   
    },
    verticalLine: {
        width: 2,
        height: 40,
        backgroundColor: '#D1D5DB'
    },
    stepCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1
    },
    verticalLabel: {
        marginLeft: 15,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#99AAAB'
    },
});

export default OrderDetail