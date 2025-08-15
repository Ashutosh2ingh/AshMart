import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface ProductImage {
  image: string;
}

interface Color {
  id: number;
  color: string;
}

interface Size {
  id: number;
  size: string;
}

interface Variation {
  id: number;
  color: Color;
  size: Size;
  discount_price: string;
  original_price: string;
  stock: number;
  product_image: string;
}

interface Product {
  id: number;
  product_name: string;
  full_description: string;
  images: ProductImage[];
  variations: Variation[];
  review: string;
  rating: number;
  list_image: string;
  offer: { offer: string }[];
}

const ProductDetail = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const { productId, colorId } = route.params;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
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
      setCartCount(data.length); 
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch cart items");
    }
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await fetch(`http://192.168.81.31:8000/productdetail/${productId}/?color=${colorId}`);
        const data = await res.json();
        
        setProduct(data);

        const defaultVariation = data.variations.find((v: Variation) => v.color.id === colorId);
        setSelectedColor(colorId);
        setSelectedVariation(defaultVariation || null);
        setSelectedSize(defaultVariation?.size.id || null);        
      } catch (err) {
        console.error('Error fetching product detail', err);
      }
    };

    fetchProductDetail();
  }, [productId, colorId]);

  const handleColorChange = async (newColorId: number) => {
    try {
      const res = await fetch(`http://192.168.81.31:8000/productdetail/${productId}/?color=${newColorId}`);
      const data = await res.json();

      setProduct(data);
      setSelectedColor(newColorId);
      setActiveIndex(0);

      const matchingVariation = data.variations.find(
        (v: Variation) => v.color.id === newColorId && v.size.id === selectedSize
      );

      if (matchingVariation) {
        setSelectedVariation(matchingVariation);
      } else {
        const defaultVariation = data.variations.find(
          (v: Variation) => v.color.id === newColorId
        );
        setSelectedVariation(defaultVariation || null);
        setSelectedSize(defaultVariation?.size.id || null);
      }
    } catch (err) {
      console.error("Error fetching product details for selected color", err);
    }
  };

  const handleSizeChange = (sizeId: number) => {
    if (!product) return;

    const matchingVariation = product.variations.find(
      (v) => v.size.id === sizeId
    );

    if (matchingVariation) {
      setSelectedSize(sizeId);
      setSelectedColor(matchingVariation.color.id);
      setSelectedVariation(matchingVariation);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariation) {
      Alert.alert("Error", "No product variation selected.");
      return;
    }

    if (quantity > selectedVariation.stock) {
      Alert.alert("Stock Limit", "You cannot add more than available stock.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert("Authentication", "Please login to add items to your cart.");
        return;
      }

      const response = await fetch('http://192.168.81.31:8000/add-to-cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          product_variation_id: selectedVariation.id,
          quantity: quantity
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Item added to cart successfully.");
      } else {
        console.error(data);
        Alert.alert("Error", data.message || "Failed to add item to cart.");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong.");
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  if (!product || !selectedVariation) {
    return(
      <View style = {styles.spinner}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >

        <View style={styles.headingContainer}>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={15} />
          </TouchableOpacity>

          <TouchableOpacity>
            <Icon name="shopping-cart" size={25} style={styles.shoppingCartButton} />
          </TouchableOpacity>

          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}

        </View>

        <View style={styles.imageSliderWrapper}>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
              );
              setActiveIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {product.images.map((img,idx) => (
              <Image 
                key={idx} 
                source={{ uri: `http://192.168.81.31:8000${img.image}` }} 
                style={styles.productImage} 
              />
            ))}
          </ScrollView>

          {/* Dots */}
          <View style={styles.dotContainer}>
            {product.images.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, activeIndex === idx && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>

          {/* Color */}
          <View style={styles.colorRow}>

            <Text style={styles.label}>Colors:</Text>

            {Array.from(new Set(product.variations.map(v => v.color.id))).map((id) => {
              const colorName = product.variations.find(v => v.color.id === id)?.color.color;
              if (!colorName ) return null;

              const colorParts = colorName.trim().toLowerCase().split(' ');
              const baseColor = colorParts.length > 1 ? colorParts[1] : colorParts[0];

              const knownColors = ['black', 'white', 'green', 'blue', 'grey', 'red', 'orange', 'yellow', 'purple'];
              const backgroundColor = knownColors.includes(baseColor) ? baseColor : '#D3D3D3';

              const isSelected = selectedColor === id;

              return (
                <TouchableOpacity
                  key={id.toString()}
                  onPress={() => handleColorChange(id)}
                  style={[
                    styles.colorCircle,
                    baseColor === 'white' && { borderWidth: 2, borderColor: 'orange' },
                    {backgroundColor: backgroundColor}
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.checkContainer]}>
                      <Icon name="check" size={12} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.productTitle}>{product.product_name}</Text>

            <Text style={styles.stockCheck}>{selectedVariation?.stock && selectedVariation.stock > 0 ? 'In Stock' : 'Out of Stock'}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{selectedVariation?.discount_price}</Text>

            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {[...Array(4)].map((_, i) => (
                  <Icon key={i} name="star" size={18} color="#F4C724" style={{ marginRight: 2 }} />
                ))}
                <Icon name="star-o" size={18} color="#F4C724" style={{ marginRight: 2 }} />
              </View>
              <Text style={styles.reviewText}>{product.review}</Text>
            </View>

          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Size */}
          <View style={styles.sizeRow}>

            <Text style={styles.sizeLabel}>Available Sizes:</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Array.from(new Set(product.variations.map(v => v.size.id))).map(sizeId => {
                const sizeName = product.variations.find(v => v.size.id === sizeId)?.size.size;
                const isSelected = selectedSize === sizeId;

                return (
                  <TouchableOpacity
                    key={sizeId}
                    style={[
                      styles.size,
                      isSelected && { backgroundColor: '#6366F1' }
                    ]}
                    onPress={() => handleSizeChange(sizeId)}
                  >
                    <Text style={{ color: isSelected ? '#fff' : '#000' }}>{sizeName}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionContent}>{product.full_description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart button */}
      <View style={styles.cartContainerWrapper}>
        <View style={styles.cartRow}>

          <TouchableOpacity 
            onPress={handleAddToCart}
            style={styles.cartButton}
          >
            <Text style={styles.cartButtonText}>Add to cart</Text>
          </TouchableOpacity>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(prev => Math.min(prev + 1, selectedVariation.stock))}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DAE0E2'
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingLeft: 10,
    paddingBottom: 5,
  },
  backButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 40,
    backgroundColor: '#f8f8f8'
  },
  shoppingCartButton: {
    color: '#6366F1',
    paddingRight: 15
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageSliderWrapper: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  productImage: {
    height: 250,
    width: width,
    resizeMode: 'contain',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6366F1',
    width: 10,
    height: 10,
  },
  content: {
    backgroundColor: '#fff',
    height: 600,
    width: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingTop: 25,
    paddingLeft: 15
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#99AAAB',
    marginRight: 8,
  },
  colorCircle: {
    width: 40,
    height: 35,
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heartIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    marginLeft: 'auto',
    marginRight: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 20,
  },
  productTitle: {
    fontSize: 23,
    fontWeight: 'bold'
  },
  stockCheck: {
    fontSize: 16,
    color: '#45CE30',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 20,
    paddingLeft: 20,
    paddingRight: 10,
  },
  price: {
    fontSize: 23,
    fontWeight: 'bold'
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#DAE0E2',
    marginVertical: 15,
    width: '90%',
    marginLeft: 20,
    marginRight: 20,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingTop: 5,
    paddingLeft: 20
  },
  sizeLabel: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#99AAAB',
    marginRight: 8,
  },
  size: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#EAF0F1",
    backgroundColor: '#FEFFF7'
  },
  descriptionContainer: {
    paddingLeft: 20,
    paddingTop: 15
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 5
  },
  descriptionContent: {
    fontSize: 15
  },
  cartContainerWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 5,
    borderTopColor: '#e0e0e0',
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 50,
    width: 90,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  qtyButton: {
    paddingHorizontal: 5,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  spinner: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  }
});

export default ProductDetail;