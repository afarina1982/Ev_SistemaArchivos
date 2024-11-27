import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Documento } from './documento.schema'; 

@Injectable()
export class DocumentosService {
  private baseDir = path.join(__dirname, '..', '..', 'Sistema de Archivos'); 

  constructor(@InjectModel('Documento') private documentoModel: Model<Documento>) {}

  //====================================================================================================
  
  async guardarArchivos(rutUsuario: string, archivos: Express.Multer.File[]): Promise<Documento[]> {
    const resultados: Documento[] = [];

    for (const archivo of archivos) {
      const uuid = uuidv4();
      const extension = path.extname(archivo.originalname);
      const subdir = this.obtenerRutaSubida();
      const rutaDirectorio = path.join(this.baseDir, subdir);
      const nombreAsignado = `${uuid}${extension}`;
      const rutaCompleta = path.join(rutaDirectorio, nombreAsignado);

      await fs.mkdir(rutaDirectorio, { recursive: true });

      await fs.writeFile(rutaCompleta, archivo.buffer);

      const documento = new this.documentoModel({
        rutUsuario,
        nombreOriginal: archivo.originalname,
        nombreAsignado,
        ruta: `archivos/${path.join(subdir, nombreAsignado).replace(/\\/g, '/')}`,
      });

      await documento.save();

      resultados.push(documento);
    }

    return resultados;
  }
  //====================================================================================================
  
  async obtenerDocumentos(rutUsuario: string): Promise<Documento[]> {
    return this.documentoModel.find({ rutUsuario }).exec(); // Buscar documentos por rutUsuario
  }

  //====================================================================================================
  async eliminarDocumento(uuid_archivo: string): Promise<string> {
    const documento = await this.documentoModel.findOne({ nombreAsignado: uuid_archivo }).exec();
    
    if (!documento) {
      throw new Error('Documento no encontrado');
    }

    const archivoPath = path.join(this.baseDir, documento.ruta.replace('archivos/', ''));

    try {
      // Eliminar archivo del sistema de archivos
      await fs.unlink(archivoPath); 
      console.log(`Archivo ${archivoPath} eliminado exitosamente`);

      // Eliminar el registro en la base de datos
      await this.documentoModel.deleteOne({ nombreAsignado: uuid_archivo }).exec();

      // Eliminar directorios vacíos, comenzando desde el directorio del archivo
      const directorio = path.dirname(archivoPath);
      await this.eliminarDirectoriosVacios(directorio);

      return 'Documento eliminado correctamente';
    } catch (error) {
      throw new Error(`Error al eliminar el archivo: ${error.message}`);
    }
  }

  //====================================================================================================
  // Función para eliminar directorios vacíos de manera recursiva
  private async eliminarDirectoriosVacios(directorio: string): Promise<void> {
    try {
      const archivos = await fs.readdir(directorio);

      // Si el directorio está vacío, eliminarlo
      if (archivos.length === 0) {
        await fs.rmdir(directorio);
        console.log(`Directorio ${directorio} eliminado porque está vacío`);

        // Llamada recursiva para verificar el directorio superior
        const directorioPadre = path.dirname(directorio);
        if (directorioPadre !== this.baseDir) {  // No seguir hacia la raíz del sistema
          await this.eliminarDirectoriosVacios(directorioPadre);
        }
      }
    } catch (error) {
      console.error(`Error al verificar el directorio: ${error.message}`);
    }
  }

  //====================================================================================================
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
