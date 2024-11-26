import { Schema, Document } from 'mongoose';

export const DocumentoSchema = new Schema({
  rutUsuario: { type: String, required: true },
  nombreOriginal: { type: String, required: true },
  nombreAsignado: { type: String, required: true },
  ruta: { type: String, required: true },
  fechaCarga: { type: Date, default: Date.now },
});

export interface Documento extends Document {
  rutUsuario: string;
  nombreOriginal: string;
  nombreAsignado: string;
  ruta: string;
  fechaCarga: Date;
}
