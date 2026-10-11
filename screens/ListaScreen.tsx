import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export interface Registro {
  id: number;
  titulo: string;
  calificacion: number;
  comentarios: string;
  fotoBase64: string;
  fecha: string;
}

export function ListaScreen({ navigation }: any) {
  const db = useSQLiteContext();
  const [registros, setRegistros] = useState<Registro[]>([]);

  const cargarRegistros = async () => {
    try {
      const resultado = await db.getAllAsync<Registro>(
        "SELECT * FROM registros ORDER BY id DESC;",
      );
      setRegistros(resultado);
    } catch (error) {
      console.error("Error al consultar registros:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarRegistros();
    }, []),
  );

  const handleEliminar = (id: number) => {
    Alert.alert("Eliminar", "¿Deseas eliminar este registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await db.runAsync("DELETE FROM registros WHERE id = ?;", [id]);
            cargarRegistros();
          } catch (error) {
            console.error("Error al eliminar:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const uriFoto = item.fotoBase64.startsWith("data:")
            ? item.fotoBase64
            : `data:image/jpeg;base64,${item.fotoBase64}`;

          return (
            <View>
              <Image
                source={{ uri: uriFoto }}
                style={{ width: 60, height: 60 }}
              />
              <Text>{item.titulo}</Text>
              <Text>Calificación: {item.calificacion}</Text>
              <Text>{item.comentarios}</Text>
              <Text>{item.fecha}</Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Formulario", {
                    id: item.id,
                    tituloActual: item.titulo,
                    calificacionActual: item.calificacion,
                    comentariosActuales: item.comentarios,
                    fotoActual: item.fotoBase64,
                  })
                }
              >
                <Ionicons name="pencil" size={20} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleEliminar(item.id)}>
                <Ionicons name="trash" size={20} />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<Text>No hay registros guardados</Text>}
      />

      <TouchableOpacity onPress={() => navigation.navigate("Formulario")}>
        <Ionicons name="add" size={30} />
      </TouchableOpacity>
    </View>
  );
}
