import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import * as ImagePicker from "expo-image-picker";

export function FormularioScreen({ route, navigation }: any) {
  const db = useSQLiteContext();

  const idEdicion = route.params?.id;
  const tituloEdicion = route.params?.tituloActual || "";
  const califEdicion = route.params?.calificacionActual?.toString() || "0";
  const comenEdicion = route.params?.comentariosActuales || "";
  const fotoEdicion = route.params?.fotoActual || null;

  const [titulo, setTitulo] = useState(tituloEdicion);
  const [calificacion, setCalificacion] = useState(califEdicion);
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
    if (!titulo.trim() || !comentarios.trim() || !calificacion.trim()) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    if (!fotoBase64) {
      Alert.alert("Error", "Debes capturar una fotografía.");
      return;
    }

    const fechaHoy = new Date().toLocaleDateString();
    const califNum = parseInt(calificacion, 10);

    try {
      if (idEdicion) {
        await db.runAsync(
          `UPDATE registros 
           SET titulo = ?, calificacion = ?, comentarios = ?, fotoBase64 = ?, fecha = ? 
           WHERE id = ?;`,
          [
            titulo.trim(),
            califNum,
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
          [titulo.trim(), califNum, comentarios.trim(), fotoBase64, fechaHoy],
        );
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  return (
    <ScrollView>
      <Text>Título:</Text>
      <TextInput
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Título del plato"
      />

      <Text>Calificación (1-5):</Text>
      <TextInput
        value={calificacion}
        onChangeText={setCalificacion}
        keyboardType="numeric"
        placeholder="1-5"
      />

      <Text>Comentarios:</Text>
      <TextInput
        value={comentarios}
        onChangeText={setComentarios}
        placeholder="Escribe tus notas aquí..."
        multiline
      />

      <Button title="Tomar Fotografía" onPress={capturarFoto} />

      {fotoBase64 && (
        <Image
          source={{
            uri: fotoBase64.startsWith("data:")
              ? fotoBase64
              : `data:image/jpeg;base64,${fotoBase64}`,
          }}
          style={{ width: 100, height: 100 }}
        />
      )}

      <Button title="Guardar" onPress={handleGuardar} />
    </ScrollView>
  );
}
