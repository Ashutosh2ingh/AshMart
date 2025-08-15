import React, { useState, useEffect } from 'react'
import { View, FlatList, Image, StyleSheet, Alert } from 'react-native'

type SliderType = {
  id: number;
  title: string;
  image: string;
};

const Slider = () => {
    
    const [sliderList, setSliderList] = useState<SliderType[]>([]);
    
        useEffect(() => {
    
            const fetchCategories = async () => {
    
                try {
                    const response = await fetch('http://192.168.81.31:8000/hero-slider/', {
                        method: "GET"
                    });
    
                    if (!response.ok) {
                        console.error('Server Error:', response.status);
                        Alert.alert('Error', `Failed to fetch profile (${response.status})`);
                        return;
                    }
    
                    const data = await response.json();
                    setSliderList(data); 
    
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            };
            
            fetchCategories();
        },[])

    return (
        <View style={styles.container}>
            <FlatList
                horizontal
                data={sliderList}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.imageWrapper}>
                        <Image source={{uri:item.image}} style={styles.image} resizeMode="cover" />
                    </View>
                )}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        marginHorizontal: 7,
    },
    imageWrapper: {
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 10,
    },
    image: {
        resizeMode: 'contain',
        width: 350,
        height: 170,
        borderRadius: 10,
    },
})


export default Slider
