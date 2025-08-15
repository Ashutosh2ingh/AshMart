import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Layout from '../components/Layout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WishlistItem = {
    id: number;
    product: {
        id: number;
        product_name: string;
        list_image: string;
        new: boolean;
        rating: number;
        offer: {
            offer: string;
        }[];
        variations: {
            id: number;
            color: { id: number; color: string };
            size: { id: number; size: string };
            original_price: string;
            discount_price: string;
            stock: number;
            product_name: string;
            product_image: string;
        }[];
    };
};

const Wishlist = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [wishlistProducts, setWishlistProducts] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchWishlist = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "User not authenticated");
                return;
            }

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

            const data = await response.json();
            setWishlistProducts(data);

        } catch (error) {
            console.error("Wishlist fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (productId: number) => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "User not authenticated");
                return;
            }

            const response = await fetch('http://192.168.81.31:8000/wishlist/toggle/', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify({
                    product_id: productId
                })
            });

            if (!response.ok) {
                console.error('Error:', response.status);
                Alert.alert("Error", "Something went wrong");
                return;
            }

            const data = await response.json();

            if (data.message === "Removed from wishlist") {
                setWishlistProducts(prev => prev.filter(item => item.product.id !== productId));
                Alert.alert("Removed", "Removed from Wishlist");
            } else if (data.message === "Added to wishlist") {
                fetchWishlist();
                Alert.alert("Success", "Added to Wishlist");
            }

        } catch (error) {
            console.error("Wishlist error:", error);
            Alert.alert("Error", "Failed to update wishlist");
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    if (loading) {
        return (
            <View style={styles.spinner}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Layout>
                <ScrollView>
                    <View style={styles.headingContainer}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="arrow-left" size={15} />
                        </TouchableOpacity>
                        <Text style={styles.heading}>My Wishlist</Text>
                        <View style={{ width: 40 }} /> 
                    </View>

                    {wishlistProducts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={{ fontSize: 16, color: '#555' }}>Your wishlist is empty.</Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {wishlistProducts.map((item) => {
                                const product = item.product;
                                return (
                                    <TouchableOpacity
                                        key={product.id}
                                        style={styles.card}
                                        onPress={() => navigation.navigate('ProductDetail', {
                                            productId: product.id,
                                            colorId: product.variations[0]?.color.id
                                        })}
                                    >
                                        <Image source={{ uri: product.list_image }} style={styles.image} />

                                        {product.variations[0]?.stock > 0 ? (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{product.new ? "New" : ""}</Text>
                                            </View>
                                        ) : (
                                            <View style={[styles.badge, styles.badgeStock]}>
                                                <Text style={styles.badgeText}>Out of Stock</Text>
                                            </View>
                                        )}

                                        <TouchableOpacity
                                            style={[styles.heartIcon, styles.heartIconActive]}
                                            onPress={() => toggleFavorite(product.id)}
                                        >
                                            <Icon name="heart" size={15} color="#fff" />
                                        </TouchableOpacity>

                                        <View style={styles.starContainer}>
                                            {[...Array(product.rating)].map((_, index) => (
                                                <Icon key={`filled-${index}`} name="star" size={18} color="#F4C724" style={{ paddingRight: 3 }} />
                                            ))}
                                            {[...Array(5 - product.rating)].map((_, index) => (
                                                <Icon key={`empty-${index}`} name="star-o" size={18} color="#616C6F" style={{ paddingRight: 3 }} />
                                            ))}
                                        </View>

                                        <Text style={styles.title}>{product.product_name}</Text>

                                        <View style={styles.content}>
                                            <Text style={styles.price}>₹{product.variations[0]?.discount_price}</Text>
                                            <Text style={styles.description}>{product.offer[0]?.offer ?? " "}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            </Layout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    headingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingLeft: 10,
        paddingBottom: 5,
        paddingRight: 10
    },
    heading: { 
        fontSize: 20, 
        fontWeight: 'bold' 
    },
    backButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: '#f8f8f8'
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 5
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 3,
        marginHorizontal: 7,
        marginVertical: 10,
        width: '46%',
        height: 220,
        overflow: 'hidden',
    },
    image: {
        backgroundColor: '#EAF0F1',
        width: '100%',
        height: 130,
        resizeMode: 'contain',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    starContainer: { 
        flexDirection: 'row', 
        marginTop: 8, 
        marginHorizontal: 14 
    },
    title: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        paddingHorizontal: 10, 
        paddingTop: 5 
    },
    content: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 10, 
        paddingTop: 5 
    },
    price: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#2C3335' 
    },
    description: { 
        fontSize: 14, 
        marginTop: 3, 
        color: '#777E8B' 
    },
    badge: {
        position: 'absolute',
        top: 3,
        left: 3,
        backgroundColor: '#3498DB',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeStock: { 
        backgroundColor: '#FF4848' 
    },
    badgeText: { 
        color: 'white', 
        fontSize: 10, 
        fontWeight: 'bold' 
    },
    heartIcon: {
        position: 'absolute',
        top: 3,
        right: 3,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 4,
        elevation: 2,
    },
    heartIconActive: { 
        backgroundColor: '#8e44ad' 
    },
    spinner: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    emptyContainer: { 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 50 
    }
});

export default Wishlist