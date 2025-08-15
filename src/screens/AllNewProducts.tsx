import React, {useState, useEffect, useCallback} from 'react'
import { View, TouchableOpacity, StyleSheet, Image, Text, SafeAreaView, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Layout from '../components/Layout';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProductType = {
  id: number;
  product_name: string;
  list_image: string;
  new: boolean;
  trending: boolean;
  rating: number;
  offer: {
    offer: string;
  }[];
  variations: {
    color: {
        id: number;
    };
    discount_price: string;
    stock: number;
  }[];
};

type CategoryType = {
  id: number;
  category_name: string;
  category_image: string;
};

const AllNewProducts = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [wishList, setWishList] = useState<{ [key: number]: boolean }>({});
    const [productList, setProductList] = useState<ProductType[]>([]);
    const [categoryList, setCategoryList] = useState<CategoryType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const toggleFavorite = async (product: ProductType) => {

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
                    product_id: product.id
                })
            });

            if (!response.ok) {
                console.error('Error:', response.status);
                Alert.alert("Error", "Something went wrong");
                return;
            }

            const data = await response.json();

            setWishList(prev => ({
                ...prev,
                [product.id]: !prev[product.id],
            }));

            if (data.status === "201") {
                Alert.alert("Success", "Added to Wishlist");
            } else if (data.status === "200") {
                Alert.alert("Removed", "Removed from Wishlist");
            }

        } catch (error) {
            console.error("Wishlist error:", error);
            Alert.alert("Error", "Failed to update wishlist");
        }
    };

    const fetchWishlist = async () => {

        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;

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

            const wishlistData = await response.json();
            const wishlistMap: { [key: number]: boolean } = {};

            wishlistData.forEach((item: any) => {
                wishlistMap[item.product.id] = true;
            });

            setWishList(wishlistMap);
        } catch (error) {
            console.error("Wishlist fetch error:", error);
        }
    };

    const fetchProducts = async () => {

        try {
            setLoading(true);
            const response = await fetch('http://192.168.81.31:8000/products/', {
                method: "GET"
            });

            if (!response.ok) {
                console.error('Server Error:', response.status);
                Alert.alert('Error', `Failed to fetch profile (${response.status})`);
                return;
            }

            const data = await response.json();
            setProductList(data); 

        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {

        try {
            const response = await fetch('http://192.168.81.31:8000/category/', {
                method: "GET"
            });

            if (!response.ok) {
                console.error('Server Error:', response.status);
                Alert.alert('Error', `Failed to fetch profile (${response.status})`);
                return;
            }

            const data = await response.json();
            setCategoryList(data); 

        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };
    
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    },[])
            
    useFocusEffect(
        useCallback(() => {
            fetchWishlist();
        }, [])
    );

    if (loading) {
        return(
        <View style = {styles.spinner}>
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
                        <Text style={styles.heading}>New Products</Text>
                        <TouchableOpacity style={styles.sliderButton}>
                            <Icon name="sliders" size={25} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        horizontal
                        data={categoryList}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.Flatlist}
                        renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.categoryItem}
                            onPress={() =>
                                navigation.navigate('CategoryProduct', {
                                    categoryId: item.id,
                                    categoryName: item.category_name,
                                })
                            }
                        >
                            <Text style={styles.categoryText}>{item.category_name}</Text>
                        </TouchableOpacity>
                        )}
                        showsHorizontalScrollIndicator={false}
                    />

                    <View style={styles.grid}>

                        {productList.filter(p => p.new).map((item) => {

                            const isFav = wishList[item.id] || false;

                            return (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={styles.card}
                                    onPress={() => navigation.navigate('ProductDetail', {
                                        productId: item.id,
                                        colorId: item.variations[0]?.color.id
                                    })}
                                >

                                    <Image source={{ uri: item.list_image }} style={styles.image} />

                                    {item.variations[0]?.stock > 0 ? (
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{item.new ? "New" : ""}</Text>
                                        </View>
                                    ) : (
                                        <View style={[styles.badge, styles.badgeStock]}>
                                            <Text style={styles.badgeText}>Out of Stock</Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={[
                                            styles.heartIcon,
                                            isFav && styles.heartIconActive,
                                        ]}
                                        onPress={() => toggleFavorite(item)}
                                    >
                                        <Icon
                                            name={isFav ? "heart" : "heart-o"}
                                            size={15}
                                            color={isFav ? "#fff" : "#8e44ad"}
                                        />
                                    </TouchableOpacity>

                                    <View style={styles.starContainer}>
                                        {[...Array(item.rating)].map((_, index) => (
                                            <Icon key={`filled-${index}`} name="star" size={18} color="#F4C724" style={{ paddingRight: 3 }} />
                                        ))}
                                        {[...Array(5 - item.rating)].map((_, index) => (
                                            <Icon key={`empty-${index}`} name="star-o" size={18} color="#616C6F" style={{ paddingRight: 3 }} />
                                        ))}
                                    </View>

                                    <Text style={styles.title}>{item.product_name}</Text>

                                    <View style={styles.content}>
                                        <Text style={styles.price}>₹{item.variations[0]?.discount_price}</Text>
                                        <Text style={styles.description}>{item.offer[0]?.offer ?? " "}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </Layout>
        </SafeAreaView>
    )
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
        paddingBottom: 5
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
    },    
    backButton: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: '#f8f8f8'
    },
    sliderButton: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: '#f8f8f8',
        marginRight: 8,
        padding: 3
    },
    Flatlist: {
        marginStart: 8,
        marginEnd: 8
    },
    categoryItem: { 
        margin: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 14,
        alignItems: 'center',
        padding: 10,
    },
    categoryText: {
        fontWeight: '600',
        fontSize: 16
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
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
        marginHorizontal: 14,
    },
    item: {
        flex: 1,
        margin: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 14,
        alignItems: 'center',
        padding: 16,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingTop: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingTop: 5,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3335',
    },
    description: {
        fontSize: 14,
        marginTop: 3,
        color: '#777E8B',
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
        backgroundColor: '#FF4848',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
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
        backgroundColor: '#8e44ad',
    },
    spinner: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    }
});

export default AllNewProducts