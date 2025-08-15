import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  SafeAreaView,
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Header, { HeaderHandle } from '../components/Header';
import SearchBar from '../components/SearchBar';
import Categories from '../components/Categories';
import Slider from '../components/Slider';
import NewProduct from '../components/NewProduct';
import Layout from '../components/Layout';
import Trending from '../components/Trending';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../App';

type Product = {
  id: number;
  product_name: string;
  category: number[];
  variations: any[];
  list_image: string;
  new: boolean;
  trending: boolean;
  rating: number;
  offer: { offer: string }[];
};

type Category = {
  id: number;
  category_name: string;
};

const Home = () => {
  const headerRef = useRef<HeaderHandle>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [wishList, setWishList] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchWishlist();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://192.168.81.31:8000/products/');
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://192.168.81.31:8000/category/');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch('http://192.168.81.31:8000/wishlist/', {
        method: 'GET',
        headers: { Authorization: `Token ${token}` },
      });

      const data = await res.json();
      const map: { [key: number]: boolean } = {};
      data.forEach((item: any) => {
        map[item.product.id] = true;
      });
      setWishList(map);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = async (product: Product) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('http://192.168.81.31:8000/wishlist/toggle/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ product_id: product.id }),
      });

      const data = await response.json();

      setWishList((prev) => ({
        ...prev,
        [product.id]: !prev[product.id],
      }));

      if (headerRef.current) headerRef.current.fetchWishlist();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);

    if (!text.trim()) {
      setFilteredProducts(products);
      return;
    }

    const keyword = text.toLowerCase();

    const matchedProducts = products.filter((product) =>
      product.product_name.toLowerCase().includes(keyword)
    );

    if (matchedProducts.length > 0) {
      setFilteredProducts(matchedProducts);
      return;
    }

    const matchedCategory = categories.find((cat) =>
      cat.category_name.toLowerCase().includes(keyword)
    );

    if (matchedCategory) {
      const categoryProducts = products.filter((product) =>
        product.category.includes(matchedCategory.id)
      );
      setFilteredProducts(categoryProducts);
    } else {
      setFilteredProducts([]);
    }
  };

  const isSearching = searchText.trim().length > 0;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout>
        <Header ref={headerRef} />
        <SearchBar onSearch={handleSearch} />

        {isSearching ? (
          loading ? (
            <View style={styles.spinner}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : filteredProducts.length > 0 ? (
            <View style={styles.grid}>
              {filteredProducts.map((item) => {
                const isFav = wishList[item.id] || false;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    onPress={() =>
                      navigation.navigate('ProductDetail', {
                        productId: item.id,
                        colorId: item.variations[0]?.color.id,
                      })
                    }
                  >
                    <Image source={{ uri: item.list_image }} style={styles.image} />

                    {item.variations[0]?.stock > 0 ? (
                      (item.new || item.trending) ? (
                        <View 
                          style={[
                            styles.badge,
                            item.new ? styles.badgeNew : styles.badgeTrending
                          ]}
                        >
                          <Text style={styles.badgeText}>{item.new ? 'New' : 'Trending'}</Text>
                        </View>
                      ): null
                    ) : (
                      <View style={[styles.badge, styles.badgeStock]}>
                        <Text style={styles.badgeText}>Out of Stock</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[styles.heartIcon, isFav && styles.heartIconActive]}
                      onPress={() => toggleFavorite(item)}
                    >
                      <Icon
                        name={isFav ? 'heart' : 'heart-o'}
                        size={15}
                        color={isFav ? '#fff' : '#8e44ad'}
                      />
                    </TouchableOpacity>

                    <View style={styles.starContainer}>
                      {[...Array(item.rating)].map((_, index) => (
                        <Icon
                          key={`filled-${index}`}
                          name="star"
                          size={18}
                          color="#F4C724"
                          style={{ paddingRight: 3 }}
                        />
                      ))}
                      {[...Array(5 - item.rating)].map((_, index) => (
                        <Icon
                          key={`empty-${index}`}
                          name="star-o"
                          size={18}
                          color="#616C6F"
                          style={{ paddingRight: 3 }}
                        />
                      ))}
                    </View>

                    <Text style={styles.title}>{item.product_name}</Text>

                    <View style={styles.content}>
                      <Text style={styles.price}>₹{item.variations[0]?.discount_price}</Text>
                      <Text style={styles.description}>{item.offer[0]?.offer}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>No products found</Text>
          )
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Categories />
            <Slider />
            <NewProduct onWishlistChange={() => headerRef.current?.fetchWishlist()} />
            <Trending onWishlistChange={() => headerRef.current?.fetchWishlist()} />
          </ScrollView>
        )}
      </Layout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
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
  },
  starContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginHorizontal: 14,
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
  badgeNew: {
    backgroundColor: '#3498DB',
  },
  badgeTrending: {
    backgroundColor: '#67E6DC',
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
    alignItems: 'center',
  },
});

export default Home;