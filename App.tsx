import React from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { initDatabase } from "./src/database/db";
import { ListaScreen } from "./src//screens/ListaScreen";
import { FormularioScreen } from "./src/screens/FormularioScreen";

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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E11D48" />
            <Text style={styles.loadingText}>Preparando la cocina...</Text>
          </View>
        }
      >
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: "#BE123C" },
              headerTintColor: "#FFFFFF",
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontWeight: "800",
                fontSize: 18,
              },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen
              name="Lista"
              component={ListaScreen}
              options={{ title: "CAZADOR DE SABORES" }}
            />
            <Stack.Screen
              name="Formulario"
              component={FormularioScreen}
              options={({ route }) => ({
                title: route.params?.id ? "EDITAR RESEÑA" : "NUEVA RESEÑA",
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </React.Suspense>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#BE123C",
    letterSpacing: 0.5,
  },
});
