import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export function FormularioScreen({ route, navigation }: any) {
  const db = useSQLiteContext();

  const idEdicion = route.params?.id;
  const tituloEdicion = route.params?.tituloActual || "";
  const califEdicion = route.params?.calificacionActual || 5;
  const comenEdicion = route.params?.comentariosActuales || "";
  const fotoEdicion = route.params?.fotoActual || null;

  const [titulo, setTitulo] = useState(tituloEdicion);
  const [calificacion, setCalificacion] = useState<number>(califEdicion);
  const [comentarios, setComentarios] = useState(comenEdicion);
  const [fotoBase64, setFotoBase64] = useState<string | null>(fotoEdicion);

  const capturarFoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso Denegado", "Se requiere acceso a la cámara.");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!res.canceled && res.assets[0].base64) {
      setFotoBase64(res.assets[0].base64);
    }
  };

  const handleGuardar = async () => {
    if (!titulo.trim() || !comentarios.trim()) {
      Alert.alert(
        "Error",
        "El nombre del platillo y los comentarios son obligatorios.",
      );
      return;
    }

    if (!fotoBase64) {
      Alert.alert("Aviso", "¡No olvides tomarle una fotografía al platillo!");
      return;
    }

    const fechaHoy = new Date().toLocaleDateString();

    try {
      if (idEdicion) {
        await db.runAsync(
          `UPDATE registros 
           SET titulo = ?, calificacion = ?, comentarios = ?, fotoBase64 = ?, fecha = ? 
           WHERE id = ?;`,
          [
            titulo.trim(),
            calificacion,
            comentarios.trim(),
            fotoBase64,
            fechaHoy,
            idEdicion,
          ],
        );
      } else {
        await db.runAsync(
          `INSERT INTO registros (titulo, calificacion, comentarios, fotoBase64, fecha) 
           VALUES (?, ?, ?, ?, ?);`,
          [
            titulo.trim(),
            calificacion,
            comentarios.trim(),
            fotoBase64,
            fechaHoy,
          ],
        );
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.headerText}>
            {idEdicion ? "Editando Reseña" : "Nueva Reseña"}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Platillo y Lugar</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej. Tacos al pastor en El Fogón"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calificación del sabor</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  activeOpacity={0.7}
                  onPress={() => setCalificacion(star)}
                >
                  <Ionicons
                    name={star <= calificacion ? "star" : "star-outline"}
                    size={36}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tus Comentarios</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={comentarios}
              onChangeText={setComentarios}
              placeholder="Estaba crujiente, le faltó sal, lo volvería a pedir..."
              placeholderTextColor="#94A3B8"
              multiline
            />
          </View>

          <TouchableOpacity
            style={styles.btnCamara}
            activeOpacity={0.8}
            onPress={capturarFoto}
          >
            <Ionicons name="camera" size={24} color="#E11D48" />
            <Text style={styles.btnCamaraText}>
              {fotoBase64 ? "Capturar otra fotografía" : "Tomar Fotografía"}
            </Text>
          </TouchableOpacity>

          {fotoBase64 && (
            <View style={styles.previewBox}>
              <Image
                source={{
                  uri: fotoBase64.startsWith("data:")
                    ? fotoBase64
                    : `data:image/jpeg;base64,${fotoBase64}`,
                }}
                style={styles.previewImage}
              />
            </View>
          )}
        </View>

        {/* Botón Principal Guardar */}
        <TouchableOpacity
          style={styles.btnSave}
          activeOpacity={0.9}
          onPress={handleGuardar}
        >
          <Ionicons name="checkmark-done-circle" size={26} color="#FFFFFF" />
          <Text style={styles.btnSaveText}>
            {idEdicion ? "Actualizar Reseña" : "Guardar Reseña"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#BE123C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    gap: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#BE123C",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4,
  },
  btnCamara: {
    flexDirection: "row",
    backgroundColor: "#FFF1F2",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#FECDD3",
    borderStyle: "dashed",
    marginTop: 8,
  },
  btnCamaraText: {
    color: "#E11D48",
    fontWeight: "800",
    fontSize: 16,
  },
  previewBox: {
    alignItems: "center",
    marginTop: 4,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#FFF1F2",
  },
  previewImage: {
    width: "100%",
    height: 220,
  },
  btnSave: {
    backgroundColor: "#E11D48",
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnSaveText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
