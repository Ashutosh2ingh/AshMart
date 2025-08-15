import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AllCategories from './screens/AllCategories';
import AllNewProducts from './screens/AllNewProducts';
import AllTrendingProducts from './screens/AllTrendingProducts';
import ProductDetail from './screens/ProductDetail';
import Cart from './screens/Cart';
import Checkout from './screens/Checkout';
import DrawerNavigator from './components/DrawerNavigator';
import Profile from './screens/Profile';
import ProfilePhoto from './screens/ProfilePhoto';
import Register from './screens/Register';
import ForgotPassword from './screens/ForgotPassword';
import OtpScreen from './screens/OtpScreen';
import AuthLoadingScreen from './screens/AuthLoadingScreen';
import Login from './screens/Login';
import withAuth from './components/WithAuth';
import Order from './screens/Order';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import CateogryProduct from './screens/CateogryProduct';
import OrderDetail from './screens/OrderDetail';
import Wishlist from './screens/Wishlist';
import ResetPassword from './screens/ResetPassword';

export type RootStackParamList = {
  AuthLoading: undefined;
  Login: { screen: string } | undefined;
  DrawerHome: { screen: string } | undefined;
  Order: undefined;
  ChangePassword: undefined;
  AllCategories: undefined;
  AllNewProducts: undefined;
  AllTrendingProducts: undefined;
  ProductDetail: { productId: number; colorId: number};
  Cart: undefined;
  Checkout: undefined;
  Profile: undefined;
  ProfilePhoto: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpScreen: undefined;
  ResetPassword: undefined;
  CategoryProduct: { categoryId: number; categoryName: string };
  OrderDetail: { orderId: number };
  Wishlist: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>()

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="DrawerHome" component={withAuth(DrawerNavigator)} />
        <Stack.Screen name="Order" component={withAuth(Order)} />
        <Stack.Screen name="ChangePassword" component={withAuth(ChangePasswordScreen)} />
        <Stack.Screen name="AllCategories" component={withAuth(AllCategories)} />
        <Stack.Screen name="AllNewProducts" component={withAuth(AllNewProducts)} />
        <Stack.Screen name="AllTrendingProducts" component={withAuth(AllTrendingProducts)} />
        <Stack.Screen name="ProductDetail" component={withAuth(ProductDetail)} />
        <Stack.Screen name="Cart" component={withAuth(Cart)} />
        <Stack.Screen name="Checkout" component={withAuth(Checkout)} />
        <Stack.Screen name="Profile" component={withAuth(Profile)} />
        <Stack.Screen name="ProfilePhoto" component={withAuth(ProfilePhoto)} />
        <Stack.Screen name='Register' component={Register} />
        <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
        <Stack.Screen name='OtpScreen' component={OtpScreen} />
        <Stack.Screen name='ResetPassword' component={ResetPassword} />
        <Stack.Screen name='CategoryProduct' component={CateogryProduct} />
        <Stack.Screen name='OrderDetail' component={OrderDetail} />
        <Stack.Screen name="Wishlist" component={withAuth(Wishlist)} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;