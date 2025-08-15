import React, { useEffect, useState } from 'react'
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type CategoryType = {
  id: number;
  category_name: string;
  category_image: string;
};


const Categories = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [categoryList, setCategoryList] = useState<CategoryType[]>([]);

    useEffect(() => {

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
        
        fetchCategories();
    },[])

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.categoryHeading}>Top Categories</Text>

                <TouchableOpacity onPress={() => navigation.navigate('AllCategories')}>
                    <Text style={styles.categoryText}>View All</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                horizontal
                data={categoryList.slice(0, 6)}
                keyExtractor={item => item.id.toString()}
                style={styles.Flatlist}
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
                    <Image source={{ uri: item.category_image }} style={styles.image} />
                    <Text>{item.category_name}</Text>
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 25,
        position: 'relative',
    },
    categoryHeading: {
        fontWeight: 'bold',
        fontSize: 18
    },
    categoryText: {
        fontWeight: '700',
        fontSize: 14,
        color: '#3C40C6'
    },
    item: { 
        alignItems: 'center', 
        margin: 4
    },
    image: { 
        width: 60, 
        height: 60, 
        marginBottom: 5,
        borderRadius: 10,
        backgroundColor: '#EAF0F1',
        elevation: 1
    },
    Flatlist: {
        marginStart: 8,
        marginEnd: 8
    }
});

export default Categories;