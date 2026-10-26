import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// Mudança da v7: Agora importamos diretamente do pacote principal unificado
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// IMPORTS DAS TELAS (Todos na mesma pasta raiz)
import Index from './Index'; 
import Home from './Home';
import Cadastro from './Cadastro';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* screenOptions={{ headerShown: false }} esconde a barra de título padrão */}
      <Stack.Navigator 
        initialRouteName="Index" 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Index" component={Index} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
