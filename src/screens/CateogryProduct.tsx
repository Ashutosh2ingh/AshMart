import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Layout from '../components/Layout';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type ProductType = {
    id: number;
    product_name: string;
    list_image: string;
    new: boolean;
    trending: boolean;
    rating: number;
    category: number[];
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

type CategoryProductRouteProp = RouteProp<RootStackParamList, 'CategoryProduct'>;

const CateogryProduct = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<CategoryProductRouteProp>();
    const { categoryId, categoryName } = route.params;

    const [wishList, setWishList] = useState<{ [key: number]: boolean }>({});
    const [productList, setProductList] = useState<ProductType[]>([]);    
    const [loading, setLoading] = useState<boolean>(true);

    const toggleFavorite = (id: number) => {
        setWishList(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://192.168.81.31:8000/products/');
                if (!response.ok) {
                    console.error('Server Error:', response.status);
                    Alert.alert('Error', `Failed to fetch profile (${response.status})`);
                    return;
                }
                const data = await response.json();                
                setProductList(data.filter((item: ProductType) => item.category?.includes(categoryId)));
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId]);
    
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
                        <View style={{ position: 'absolute', left: 15 }}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Icon name="arrow-left" size={15} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.heading}>{categoryName}</Text>
                    </View>

                    <View style={styles.grid}>

                        {productList.map((item) => {

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
                                        item.new ? (
                                            <View style={[styles.badge, { backgroundColor: '#3498DB' }]}>
                                                <Text style={styles.badgeText}>New</Text>
                                            </View>
                                        ) : item.trending ? (
                                            <View style={[styles.badge, { backgroundColor: '#67E6DC' }]}>
                                                <Text style={styles.badgeText}>Trending</Text>
                                            </View>
                                        ) : null
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
                                        onPress={() => toggleFavorite(item.id)}
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
        justifyContent: 'center',
        paddingTop: 20,
        paddingLeft: 10,
        paddingBottom: 5
    },
    heading: {
        top: -7,
        fontSize: 22,
        fontWeight: 'bold'
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

export default CateogryProduct