import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import Layout from '../components/Layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    original_price: string;
    discount_price: string;
    stock: number;
    product_name: string;
    product_image: string;
}

interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    customer: number;
}

const Cart = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Update Cart
    const updateCartQuantity = async (productVariationId: number, quantity: number) => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            const res = await fetch('http://192.168.81.31:8000/update-cart/', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify({
                    product_variation_id: productVariationId,
                    quantity: quantity
                })
            });

            const data = await res.json();

            if (!res.ok) {
                console.error(data);
                Alert.alert("Error", data.message || "Failed to update cart.");
            }

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Something went wrong.");
        }
    };

    // Delete Cart
    const deleteCart = async (productVariationId: number) => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            const res = await fetch(`http://192.168.81.31:8000/delete-cart/${productVariationId}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Token ${token}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                console.error(data);
                Alert.alert("Error", data.message || "Failed to delete item from cart.");
            }

            Alert.alert("Removed", "Item has been removed from cart.", [
                {
                    text: "OK",
                    onPress: () => fetchCart(),
                },
            ]);

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Something went wrong.");
        }
    };

    // Increase Quantity
    const increaseQty = async (id: number, productVariationId: number, currentQty: number, stock: number) => {
        if (currentQty >= stock) {
            Alert.alert("Stock Limit", "Cannot exceed available stock.");
            return;
        }

        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: currentQty + 1 } : item
            )
        );

        await updateCartQuantity(productVariationId, currentQty + 1);
    };

    // Decrease Quantity
    const decreaseQty = async (id: number, productVariationId: number, currentQty: number) => {

        if (currentQty <= 1) {

            await updateCartQuantity(productVariationId, 0);
            Alert.alert("Removed", "Item has been removed from cart.", [
                {
                    text: "OK",
                    onPress: () => fetchCart(),
                },
            ]);

            return;
        }

        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: currentQty - 1 } : item
            )
        );

        await updateCartQuantity(productVariationId, currentQty - 1);
    };

    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product.original_price) * item.quantity);
    }, 0);

    const discountTotal = cartItems.reduce((sum, item) => {
        const discountPerItem = parseFloat(item.product.original_price) - parseFloat(item.product.discount_price);
        return sum + (discountPerItem * item.quantity);
    }, 0);

    const total = subtotal - discountTotal;

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <Layout>
                <ScrollView
                    style={styles.container}
                >
                    <View style={styles.headingContainer}>

                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="arrow-left" size={15} />
                        </TouchableOpacity>

                        <Text style={styles.heading}>Shopping Cart</Text>
                    </View>

                    {cartItems.length === 0 ? (
                        <View style={styles.blankCartContainer}>
                            <Text style={styles.blankCartText}>No items in the cart</Text>
                        </View>
                    ) : (
                        cartItems.map((item) => (
                            <View key={item.id} style={styles.cardWrapper}>
                                <View style={styles.card}>

                                    <Image style={styles.image} source={{ uri: `http://192.168.81.31:8000/media/${item.product.product_image}` }} />

                                    <View style={styles.titleContainer}>

                                        <Text style={styles.title}>{item.product.product_name}</Text>

                                        <Text style={styles.price}>₹{item.product.discount_price}</Text>

                                        <View style={styles.quantityContainer}>
                                            <TouchableOpacity
                                                onPress={() => decreaseQty(item.id, item.product.id, item.quantity)}
                                                style={styles.qtyButton}
                                            >
                                                <Text style={styles.qtyButtonText}>−</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.qtyText}>{item.quantity}</Text>
                                            <TouchableOpacity
                                                onPress={() => increaseQty(item.id, item.product.id, item.quantity, item.product.stock)}
                                                style={styles.qtyButton}
                                            >
                                                <Text style={styles.qtyButtonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>

                                    </View>

                                    <TouchableOpacity 
                                        onPress={() =>
                                            Alert.alert("Confirm", "Are you sure you want to remove this item?", [
                                                { text: "Cancel", style: "cancel" },
                                                { text: "Delete", onPress: () => deleteCart(item.product.id) }
                                            ])
                                        }
                                        style={styles.iconContainer}
                                    >
                                        <Icon name='trash' size={17} color={'#A4B0BD'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>

                {cartItems.length > 0 && (
                    <View style={styles.checkoutContainerWrapper}>

                        <View style={styles.divider} />

                        <View style={styles.checkoutContentWrapper}>
                            <View style={styles.checkoutContent}>
                                <Text style={styles.chekoutHeader}>SubTotal</Text>
                                <Text style={styles.chekcoutValue}>₹{subtotal.toFixed(2)}</Text>
                            </View>
                            <View style={styles.checkoutContent}>
                                <Text style={styles.chekoutHeader}>Discount</Text>
                                <Text style={styles.chekcoutValue}>₹{discountTotal.toFixed(2)}</Text>
                            </View>
                            <View style={styles.checkoutContent}>
                                <Text style={styles.chekoutHeader}>Total</Text>
                                <Text style={styles.chekcoutValue}>₹{total.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={styles.checkoutRow}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Checkout')}
                                style={styles.checkoutButton}
                            >
                                <Text style={styles.checkoutButtonText}>Checkout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Layout>
        </View>
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
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        borderRadius: 40,
        backgroundColor: '#EAF0F1',
        marginRight: 15
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    cardWrapper: {
        alignItems: 'center',
        marginTop: 10
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginVertical: 10,
        width: '90%',
        height: 120,
        overflow: 'hidden',
    },
    image: {
        backgroundColor: '#EAF0F1',
        width: '30%',
        height: '80%',
        resizeMode: 'contain',
        borderRadius: 10,
        marginTop: 12,
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
    iconContainer: {
        alignItems: 'center',
        paddingTop: 18,
        paddingLeft: 5
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        height: 30,
        width: 70,
        justifyContent: 'space-between',
        marginLeft: -2,
        marginTop: 10
    },
    qtyButton: {
        paddingHorizontal: 10,
    },
    qtyButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    qtyText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#DAE0E2',
        marginVertical: 10,
        width: '90%',
        marginLeft: 20,
        marginRight: 20
    },
    coupon: {
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 25,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#00CCCD'
    },
    couponName: {
        fontWeight: 400,
        fontSize: 15,
    },
    couponApply: {
        paddingLeft: 10,
        paddingRight: 5,
        color: '#6366F1'
    },
    checkContainerWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    checkContainer: {
        height: 20,
        width: 20,
        borderRadius: 40,
        backgroundColor: '#9ACD32',
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkoutContainerWrapper: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 15,
        borderTopColor: '#e0e0e0',
    },
    checkoutContentWrapper: {
        width: '100%',
        paddingHorizontal: 25,
        marginBottom: 15,
    },
    checkoutContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    chekoutHeader: {
        fontSize: 15,
        fontWeight: 900,
        color: '#A9A9A9'
    },
    chekcoutValue: {
        fontWeight: 'bold',
        fontSize: 18
    },
    checkoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
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
    blankCartContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 50
    },
    blankCartText: {
        fontSize: 18, 
        color: '#A9A9A9'
    }
})

export default Cart