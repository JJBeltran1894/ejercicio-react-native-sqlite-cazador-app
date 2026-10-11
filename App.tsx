import React from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { initDatabase } from "./database/db";
import { ListaScreen } from "./screens/ListaScreen";
//import { FormularioScreen } from './src/screens/FormularioScreen';

export type RootStackParamList = {
  Lista: undefined;
  Formulario:
    | {
        id?: number;
        tituloActual?: string;
        calificacionActual?: number;
        comentariosActuales?: string;
        fotoActual?: string;
      }
    | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SQLiteProvider
      databaseName="sabores.db"
      onInit={initDatabase}
      useSuspense={false}
    >
      <React.Suspense
        fallback={
          <View>
            <ActivityIndicator size="large" />
            <Text>Cargando...</Text>
          </View>
        }
      >
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Lista"
              component={ListaScreen}
              options={{ title: "Cazador de Sabores" }}
            />
            <Stack.Screen
              name="Formulario"
              component={FormularioScreen}
              options={{ title: "Formulario" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </React.Suspense>
    </SQLiteProvider>
  );
}
