import { Schema, Document } from 'mongoose';

// Esquema actualizado para incluir el campo 'base64'
export const DocumentoSchema = new Schema({
  rutUsuario: { type: String, required: true },
  nombreOriginal: { type: String, required: true },
  nombreAsignado: { type: String, required: true },
  ruta: { type: String, required: true },
  fechaCarga: { type: Date, default: Date.now },
  base64: { type: String, required: false },  // Campo base64 para almacenar la cadena codificada
});

// Interfaz actualizada para incluir el campo 'base64'
export interface Documento extends Document {
  rutUsuario: string;
  nombreOriginal: string;
  nombreAsignado: string;
  ruta: string;
  fechaCarga: Date;
  base64?: string;  // Campo opcional para base64
}
