import { ScrollView, StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions, Image, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RazorpayCheckout from 'react-native-razorpay';

const screenWidth = Dimensions.get('window').width;

interface Address {
    id: number;
    name: string;
    email: string;
    phone: string;
    flat_building_no: string;
    city: string;
    pincode: number;
    state: string;
    country: string;
}

interface Product {
    id: number;
    color: { 
        id: number; 
        color: string 
    };
    size: { 
        id: number; 
        size: string 
    };
    discount_price: string;
    product_name: string;
    product_image: string;
}

interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    customer: number;
}

const Checkout = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState<boolean>(true);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState<'address' | 'payment'>('address');
    const [newAddress, setNewAddress] = useState({
        name: '',
        email: '',
        phone: '',
        flat_building_no: '',
        city: '',
        pincode: '',
        state: '',
        country: '',
    });

    useEffect(() => {
        fetchAddresses();
        fetchCart();
    }, []);

    const fetchAddresses = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get('http://192.168.81.31:8000/shipment-address/', {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            setAddresses(res.data);
            if (res.data.length > 0) {
                setSelectedId(res.data[0].id);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Unable to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    const addNewAddress = async () => {

        const { name, email, phone, flat_building_no, city, pincode, state, country } = newAddress;

        if (!name || !email || !phone || !flat_building_no || !city || !pincode || !state || !country) {
            Alert.alert('All fields are required');
            return;
        }
        try {

            const token = await AsyncStorage.getItem('userToken');

            await axios.post('http://192.168.81.31:8000/shipment-address/', {
                ...newAddress, 
                pincode: parseInt(pincode) 
            }, 
            {
                headers: { 
                    'Authorization': `Token ${token}` 
                }
            });

            Alert.alert('Success', 'Address added successfully');
            setModalVisible(false);
            setNewAddress({
                name: '',
                email: '',
                phone: '',
                flat_building_no: '',
                city: '',
                pincode: '',
                state: '',
                country: '',
            });
            fetchAddresses();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to add address');
        }
    };

    const deleteAddress = async (id: number) => {

        try {
            const token = await AsyncStorage.getItem('userToken');

            await axios.delete(`http://192.168.81.31:8000/delete-shipment/${id}/`, {
                headers: { 
                    'Authorization': `Token ${token}` 
                }
            });
            Alert.alert('Success', 'Address deleted');
            fetchAddresses();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to delete address');
        }
    };

    // View Cart
    const fetchCart = async () => {

        const token = await AsyncStorage.getItem('userToken');

        try {
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
            setCartItems(data);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to fetch cart items");
        } 
    };

    const discountTotal = cartItems.reduce((sum, item) => {
        const discountPerItem = parseFloat(item.product.discount_price);
        return sum + (discountPerItem * item.quantity);
    }, 0);

    const proceedToPay = async () => {

        if (selectedId === null) {
            Alert.alert("Please select a delivery address");
            return;
        }

        const token = await AsyncStorage.getItem('userToken');
        const amountInPaise = discountTotal * 100;

        const options = {
            description: 'Order Payment',
            currency: 'INR',
            key: 'rzp_test_y5XK5rBqc7230w',
            amount: amountInPaise,
            name: 'AshMart',
            prefill: {
                email: 'test@example.com',
                contact: '9876543210',
                name: 'AshMart'
            },
            theme: { color: '#6366F1' }
        };

        try {

            const data = await RazorpayCheckout.open(options);
            const { razorpay_payment_id } = data;

            const paymentRes = await axios.post('http://192.168.81.31:8000/payment/', {
                amount: discountTotal,
                razorpay_payment_id,
                payment_status: "Success"
            }, { 
                headers: { 
                    'Authorization': `Token ${token}` 
                } 
            });

            for (const item of cartItems) {
                await axios.post('http://192.168.81.31:8000/order/', {
                    payment_id: razorpay_payment_id,
                    product_variation_id: item.product.id,
                    quantity: item.quantity,
                    shipment_address_id: selectedId
                }, { 
                    headers: { 
                        'Authorization': `Token ${token}` 
                    } 
                });

                await axios.delete(`http://192.168.81.31:8000/delete-cart/${item.product.id}/`, {
                    headers: { 
                        'Authorization': `Token ${token}` 
                    }
                });
            }
            Alert.alert("Success", "Order Placed Successfully!");
            navigation.navigate('Order'); 
        } catch (error) {
            console.error(error);
            Alert.alert('Payment Failed', 'Transaction was cancelled or failed');
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container}>
                <View style={styles.headingContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={15} />
                    </TouchableOpacity>
                    <Text style={styles.heading}>Checkout</Text>
                </View>

                <View style={styles.stepContainer}>

                    <View style={[styles.stepWrapper, styles.firstStep]}>
                        <View style={[styles.stepBox, currentStep === 'address' ? styles.activeStep : {}]}>
                            <Text style={currentStep === 'address' ? styles.activeStepText : styles.inactiveStepText}>ADDRESS</Text>
                        </View>
                        <View style={[styles.arrowRight, currentStep === 'address' ? styles.activeArrow : {}]} />
                    </View>

                    <View style={[styles.stepWrapper, styles.secondStep]}>
                        <View style={[styles.stepBox, currentStep === 'payment' ? styles.activeStep : {}]}>
                            <Text style={currentStep === 'payment' ? styles.activeStepText : styles.inactiveStepText}>PAYMENT</Text>
                        </View>
                        <View style={[styles.arrowRight, currentStep === 'payment' ? styles.activeArrow : {}]} />
                    </View>

                </View>

                <View style={styles.deliveryTitle}>
                    <Text style={styles.address}>Delivery Address</Text>

                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Icon name="plus" size={20} color={'#000'} style={styles.addIcon} />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardWrapper}>
                    <FlatList
                        data={addresses}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedId(item.id)}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.card, { width: screenWidth * 0.9 }, selectedId === item.id && styles.selectedCard]}>
                                    <View>
                                        <View style={styles.content}>
                                            <View>
                                                <Text style={styles.text}>{item.name}</Text>
                                                <Text style={styles.text}>{item.flat_building_no}</Text>
                                                <Text style={styles.text}>{item.city}</Text>
                                                <Text style={styles.text}>
                                                    {item.pincode}, {item.state}, {item.country}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => deleteAddress(item.id)}>
                                                <Icon name="trash" size={20} color={'#000'} />
                                            </TouchableOpacity >
                                        </View>

                                        <View style={styles.cardAddressIcon}>
                                            <Text style={[styles.deliveryIconText, selectedId === item.id && styles.selectedIconText]}>Delivery Address</Text>
                                            <View style={[styles.checkContainer, selectedId === item.id && styles.selectedCheckContainer]}>
                                                <Icon name="check" size={12} color={'#fff'} />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                <Text style={styles.orderSummary}>Order Summary</Text>

                <View style={styles.divider} />

                {cartItems.map((item) => (
                    <View key={item.id} style={styles.orderCardWrapper}>
                        <View style={styles.orderCard}>

                            <Image style={styles.image} source={{ uri: `http://192.168.81.31:8000/media/${item.product.product_image}` }} />

                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>{item.product.product_name}</Text>

                                <Text style={styles.price}>₹{item.product.discount_price}</Text>

                                <View style={styles.quantityContainer}>
                                    <Text style={styles.quantityLabel}>Quantity:</Text>
                                    <Text style={styles.quantity}>{item.quantity}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.checkoutContainerWrapper}>

                <View style={styles.checkoutContentWrapper}>
                    <View style={styles.checkoutContent}>
                        <Text style={styles.chekoutHeader}>Total:</Text>
                        <Text style={styles.chekcoutValue}>₹{discountTotal.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.checkoutRow}>
                    <TouchableOpacity 
                        style={styles.checkoutButton}
                        onPress={()=>{
                            setCurrentStep('payment');
                            proceedToPay()
                        }}
                    >
                        <Text style={styles.checkoutButtonText}>Proceed To Pay</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={styles.modalTitle}>Add New Address</Text>

                            {[
                                { label: 'Name', key: 'name', icon: 'user' },
                                { label: 'Email', key: 'email', icon: 'envelope' },
                                { label: 'Phone', key: 'phone', icon: 'phone' },
                                { label: 'Flat/Building No.', key: 'flat_building_no', icon: 'home' },
                                { label: 'City', key: 'city', icon: 'building' },
                                { label: 'Pincode', key: 'pincode', icon: 'location-arrow' },
                                { label: 'State', key: 'state', icon: 'map-marker' },
                                { label: 'Country', key: 'country', icon: 'flag' },
                            ].map(({ label, key, icon }) => (
                                <View style={styles.formContainer} key={key}>

                                    <View style={styles.textContainer}>

                                        <Icon name={icon} size={22} color="#99AAAB" style={styles.textIcon} />
                                        <TextInput
                                            placeholder={`Enter ${label}`}
                                            style={styles.input}
                                            keyboardType={key === 'phone' || key === 'pincode' ? 'numeric' : key === 'email' ? 'email-address' : 'default'}
                                            value={(newAddress as any)[key]}
                                            onChangeText={(text) =>
                                                setNewAddress((prev) => ({ ...prev, [key]: text }))
                                            }
                                        />
                                    </View>
                                </View>
                            ))}

                            <View style={styles.submitRow}>
                                <TouchableOpacity style={styles.submitButton} onPress={addNewAddress}>
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

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
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        justifyContent: 'space-between',
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%'
    },
    stepBox: {
        width: '88%',
        backgroundColor: '#fff',
        paddingVertical: 10,
        alignItems: 'center',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#fff',
    },
    arrowRight: {
        width: 0,
        height: 0,
        borderTopWidth: 22,
        borderBottomWidth: 22,
        borderLeftWidth: 18,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#fff',
        position: 'relative',
    },
    activeStep: {
        borderColor: '#6366F1',
    },
    activeArrow: {
        borderLeftColor: '#6366F1',
        borderLeftWidth: 18
    },
    activeStepText: {
        color: '#6366F1',
        fontWeight: 'bold',
        fontSize: 15,
    },
    inactiveStepText: {
        color: '#999',
        fontWeight: 'bold',
        fontSize: 15,
    },
    firstStep: {
        paddingLeft: 30,
        paddingRight: 2
    },
    secondStep: {
        paddingLeft: 3,
        paddingRight: 5
    },
    deliveryTitle: {
        marginTop: 30,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    address: {
        marginLeft: 18,
        fontSize: 19,
        fontWeight: '600'
    },
    addIcon: {
        marginRight: 18,
        marginTop: 5
    },
    cardWrapper: {
        marginTop: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 1,
        shadowColor: '#DAE0E2',
        marginHorizontal: 20,
        paddingVertical: 15,
        overflow: 'hidden',
    },
    selectedCard: {
        borderColor: '#6366F1',
        borderWidth: 2,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    text: {
        fontSize: 15,
        fontWeight: '500',
    },
    cardAddressIcon: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 8,
        paddingRight: 10,
    },
    deliveryIconText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#99AAAB'
    },
    selectedIconText: {
        color: '#6366F1',
    },
    checkContainer: {
        height: 18,
        width: 18,
        backgroundColor: '#99AAAB',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    selectedCheckContainer: {
        backgroundColor: '#6366F1',
        borderRadius: 40,
    },
    orderSummary: {
        marginTop: 30,
        marginLeft: 40,
        fontSize: 19,
        fontWeight: '600'
    },
    divider: {
        height: 2,
        backgroundColor: '#DAE0E2',
        marginVertical: 10,
        width: '90%',
        marginLeft: 20,
        marginRight: 20
    },
    orderCardWrapper: {
        alignItems: 'center',
        paddingTop: 8
    },
    orderCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 3,
        width: '80%',
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
    price: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#6366F1',
        marginTop: 3
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 3
    },
    quantityLabel: {
        fontWeight: 'bold',
    },
    quantity: {
        fontWeight: '500',
        paddingTop: 2,
        paddingLeft: 5
    },
    checkoutContainerWrapper: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 40,
        paddingBottom: 5
    },
    checkoutContentWrapper: {
        width: '40%',
        paddingHorizontal: 20,
    },
    checkoutContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    chekoutHeader: {
        fontSize: 18,
        fontWeight: 900,
        color: '#A9A9A9'
    },
    chekcoutValue: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#6366F1'
    },
    checkoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '45%',
        marginHorizontal: -15
    },
    checkoutButton: {
        flex: 1,
        backgroundColor: '#6366F1',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    formContainer: {
        marginVertical: 5,
    },
    textContainer: {
        alignSelf: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        elevation: 1,
        width: '100%',
        paddingVertical: 5,
        marginVertical: 2,
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
    submitRow: {
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#6366F1',
        padding: 12,
        borderRadius: 10,
        marginTop: 8,
        alignItems: 'center',
        width: '60%'
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#999',
    },
});

export default Checkout;