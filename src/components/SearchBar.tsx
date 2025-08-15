import React from 'react'
import { TextInput, View, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = {
  onSearch: (text: string) => void;
};

const SearchBar = ({ onSearch }: Props) => {
    return (
        <View style={styles.textContainer}>

            <Icon name="search" size={18} color="#99AAAB" style={styles.icon} />

            <TextInput
                placeholder="Search Product"
                style={styles.input}
                onChangeText={onSearch}
            />
            
        </View>
    )
}

const styles = StyleSheet.create({

    textContainer: {
        alignSelf: 'center',
        backgroundColor: '#EAF0F1',
        borderRadius: 10,
        width: 350,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    icon: {
        position: 'absolute',
        left: 10,
    },
    input: {
        width: '100%',
        paddingLeft: 30,
    },
});

export default SearchBar;