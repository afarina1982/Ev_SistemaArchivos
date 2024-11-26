import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Documento } from './documento.schema'; // Importa el modelo

@Injectable()
export class DocumentosService {
  private baseDir = path.join(__dirname, '..', '..', 'Sistema de Archivos'); // Ruta de archivos

  constructor(@InjectModel('Documento') private documentoModel: Model<Documento>) {}

  // Guardar documentos en el sistema de archivos y en MongoDB
  async guardarArchivos(rutUsuario: string, archivos: Express.Multer.File[]): Promise<Documento[]> {
    const resultados: Documento[] = [];

    for (const archivo of archivos) {
      const uuid = uuidv4();
      const extension = path.extname(archivo.originalname);
      const subdir = this.obtenerRutaSubida();
      const rutaDirectorio = path.join(this.baseDir, subdir);
      const nombreAsignado = `${uuid}${extension}`;
      const rutaCompleta = path.join(rutaDirectorio, nombreAsignado);

      // Crear el directorio si no existe
      await fs.mkdir(rutaDirectorio, { recursive: true });

      // Guardar el archivo en el sistema de archivos
      await fs.writeFile(rutaCompleta, archivo.buffer);

      // Crear un nuevo documento con los metadatos
      const documento = new this.documentoModel({
        rutUsuario,
        nombreOriginal: archivo.originalname,
        nombreAsignado,
        ruta: `archivos/${path.join(subdir, nombreAsignado).replace(/\\/g, '/')}`,
      });

      // Guardar el documento en MongoDB
      await documento.save();

      // Agregar el documento al resultado
      resultados.push(documento);
    }

    return resultados;
  }

  // Obtener documentos desde MongoDB
  async obtenerDocumentos(rutUsuario: string): Promise<Documento[]> {
    return this.documentoModel.find({ rutUsuario }).exec(); // Buscar documentos por rutUsuario
  }

  // Función para obtener la ruta del directorio donde se suben los archivos
  private obtenerRutaSubida(): string {
    const ahora = new Date();
    const partes = [
      String(ahora.getFullYear()),
      String(ahora.getMonth() + 1).padStart(2, '0'),
      String(ahora.getDate()).padStart(2, '0'),
      String(ahora.getHours()).padStart(2, '0'),
      String(ahora.getMinutes()).padStart(2, '0'),
    ];
    return path.join(...partes);
  }
}
