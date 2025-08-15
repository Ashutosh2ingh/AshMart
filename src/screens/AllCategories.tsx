import React, { useState, useEffect } from 'react';
import { TouchableOpacity, FlatList, StyleSheet, Image, Text, SafeAreaView, Alert, View, ActivityIndicator } from 'react-native';
import Layout from '../components/Layout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type CategoryType = {
  id: number;
  category_name: string;
  category_image: string;
};

const AllCategories = () => {
    
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [categoryList, setCategoryList] = useState<CategoryType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {

        const fetchCategories = async () => {

            try {
                setLoading(true);
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
            } finally {
                setLoading(false);
            }
        };
        
        fetchCategories();
    },[])

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
                <Text style={styles.title}>Categories</Text>
                <FlatList
                    data={categoryList}
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.item}
                            onPress={() =>
                                navigation.navigate('CategoryProduct', {
                                    categoryId: item.id,
                                    categoryName: item.category_name,
                                })
                            }
                        >
                            <Image source={{uri: item.category_image}} style={styles.image} />
                            <Text style={styles.label}>{item.category_name}</Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                />
            </Layout>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    grid: {
        justifyContent: 'space-between',
    },
    item: {
        flex: 1,
        margin: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 14,
        alignItems: 'center',
        padding: 16,
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#EAF0F1',
        elevation: 1
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    spinner: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    }
});

export default AllCategories;
