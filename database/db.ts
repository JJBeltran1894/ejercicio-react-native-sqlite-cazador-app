import { type SQLiteDatabase } from "expo-sqlite";

export async function initDatabase(db: SQLiteDatabase) {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        calificacion INTEGER NOT NULL,
        comentarios TEXT NOT NULL,
        fotoBase64 TEXT NOT NULL,
        fecha TEXT NOT NULL
      );
    `);
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
}
