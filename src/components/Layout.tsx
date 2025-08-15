import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import BottomNavigation from './BottomNavigation';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {children}
            </View>
            <BottomNavigation />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        marginBottom: 60,
    },
});

export default Layout;
