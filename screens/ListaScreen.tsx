import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
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

  const handleEliminar = (id: number, titulo: string) => {
    Alert.alert(
      "Eliminar Platillo",
      `¿Seguro que deseas olvidar "${titulo}"?`,
      [
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
      ],
    );
  };

  const renderItem = ({ item }: { item: Registro }) => {
    const uriFoto = item.fotoBase64.startsWith("data:")
      ? item.fotoBase64
      : `data:image/jpeg;base64,${item.fotoBase64}`;

    return (
      <View style={styles.card}>
        <Image source={{ uri: uriFoto }} style={styles.image} />

        <View style={styles.infoContainer}>
          <Text style={styles.titulo} numberOfLines={1}>
            {item.titulo}
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.calificacion ? "star" : "star-outline"}
                size={14}
                color="#F59E0B"
              />
            ))}
            <Text style={styles.fecha}>{item.fecha}</Text>
          </View>

          <Text style={styles.comentarios} numberOfLines={2}>
            {item.comentarios}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnEdit]}
            activeOpacity={0.7}
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
            <Ionicons name="pencil" size={18} color="#0284C7" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.btnDelete]}
            activeOpacity={0.7}
            onPress={() => handleEliminar(item.id, item.titulo)}
          >
            <Ionicons name="trash" size={18} color="#E11D48" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="restaurant" size={48} color="#FDA4AF" />
            </View>
            <Text style={styles.emptyTitle}>Sin experiencias aún</Text>
            <Text style={styles.emptySubtitle}>
              Presiona el botón inferior para cazar tu primer sabor.
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Formulario")}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    shadowColor: "#BE123C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: "#FFE4E6",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 2,
  },
  fecha: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginLeft: 8,
  },
  comentarios: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  actionsContainer: {
    gap: 10,
    marginLeft: 10,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  btnEdit: {
    backgroundColor: "#F0F9FF",
  },
  btnDelete: {
    backgroundColor: "#FFF1F2",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E11D48",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF1F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});
