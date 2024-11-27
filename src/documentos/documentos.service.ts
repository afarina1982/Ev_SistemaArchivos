import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Documento } from './documento.schema'; 
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class DocumentosService {
  private baseDir = path.join(__dirname, '..', '..', 'Sistema de Archivos'); 

  constructor(@InjectModel('Documento') private documentoModel: Model<Documento>) {}

  //====================================================================================================
  async guardarArchivos(rutUsuario: string, archivos: Express.Multer.File[]): Promise<Documento[]> {
    // Convertir el RUT a mayúscula
    rutUsuario = rutUsuario.toUpperCase();
  
    // Verificar que el RUT tenga el formato xx.xxx.xxx-k
    const rutConPuntos = rutUsuario.replace(/^(\d{2})(\d{3})(\d{3})([0-9kK]{1})$/, '$1.$2.$3-$4');
  
    // Si el RUT no cumple con el formato esperado, devolver un error
    if (!/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/.test(rutConPuntos)) {
      throw new HttpException('El RUT debe estar en el formato xx.xxx.xxx-k', HttpStatus.BAD_REQUEST);
    }
    // Actualizar el rutUsuario con el formato correcto
    rutUsuario = rutConPuntos;
  
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
    // Convertir el RUT a mayúsculas
    rutUsuario = rutUsuario.toUpperCase();
  
    // Validar el formato del RUT: xx.xxx.xxx-k
    const rutConPuntos = rutUsuario.replace(/^(\d{2})(\d{3})(\d{3})([0-9kK]{1})$/, '$1.$2.$3-$4');
    
    // Si el formato no es correcto, lanzar una excepción
    if (!/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/.test(rutConPuntos)) {
      throw new HttpException('El RUT debe estar en el formato xx.xxx.xxx-k', HttpStatus.BAD_REQUEST);
    }
  
    // Actualizar el RUT con el formato correcto
    rutUsuario = rutConPuntos;
  
    // Buscar documentos del usuario con el RUT validado
    const documentos = await this.documentoModel.find({ rutUsuario }).exec();
    
    return Promise.all(
      documentos.map(async (documento) => {
        // Verificar si el archivo es un tipo binario y convertirlo a base64
        if (this.debeConvertirABase64(documento.nombreAsignado)) {
          const archivoPath = path.join(this.baseDir, documento.ruta.replace('archivos/', ''));
          const archivoBuffer = await fs.readFile(archivoPath);
  
          // Obtener el tipo MIME para el archivo
          const tipoMime = this.obtenerTipoMime(archivoPath);
          
          // Convertir a Base64 con el tipo MIME
          documento.base64 = `data:${tipoMime};base64,${archivoBuffer.toString('base64')}`;
        } else {
          documento.base64 = null; // Para archivos que no necesitan base64
        }
        return documento;
      })
    );
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

      // Eliminar directorios vacíos
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

      if (archivos.length === 0) {
        await fs.rmdir(directorio);
        console.log(`Directorio ${directorio} eliminado porque está vacío`);

        const directorioPadre = path.dirname(directorio);
        if (directorioPadre !== this.baseDir) { 
          await this.eliminarDirectoriosVacios(directorioPadre);
        }
      }
    } catch (error) {
      console.error(`Error al verificar el directorio: ${error.message}`);
    }
  }

  //====================================================================================================
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

  //====================================================================================================
  // Función para verificar si el archivo debe ser convertido a base64
  private debeConvertirABase64(nombreArchivo: string): boolean {
    const extension = path.extname(nombreArchivo).toLowerCase();
    const tiposBase64 = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    return tiposBase64.includes(extension);
  }

  //====================================================================================================
  // Función para obtener el tipo MIME del archivo
  private obtenerTipoMime(archivoPath: string): string {
    const extension = path.extname(archivoPath).toLowerCase();
    
    const tipoMimeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.pdf': 'application/pdf',
    };

    return tipoMimeMap[extension] || 'application/octet-stream';
  }
}
