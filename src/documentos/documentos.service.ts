import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentosService {
  private baseDir = path.join(__dirname, '..', '..', 'Sistema de Archivos');

  async guardarArchivos(rutUsuario: string, archivos: Express.Multer.File[]): Promise<any[]> {
    const resultados = [];

    for (const archivo of archivos) {
      const uuid = uuidv4();
      const extension = path.extname(archivo.originalname);
      const subdir = this.obtenerRutaSubida();
      const rutaDirectorio = path.join(this.baseDir, subdir);
      const nombreAsignado = `${uuid}${extension}`;
      const rutaCompleta = path.join(rutaDirectorio, nombreAsignado);

      // Crear el directorio si no existe
      await fs.mkdir(rutaDirectorio, { recursive: true });

      // Guardar el archivo
      await fs.writeFile(rutaCompleta, archivo.buffer);

      // Registrar la información en la base de datos (simulado aquí)
      resultados.push({
        rutUsuario,
        nombreOriginal: archivo.originalname,
        nombreAsignado,
        ruta: path.join(subdir, nombreAsignado),
        fechaCarga: new Date(),
      });
    }

    return resultados;
  }

  private obtenerRutaSubida(): string {
    const ahora = new Date();
    const partes = [
      String(ahora.getFullYear()), // Convertir a string
      String(ahora.getMonth() + 1).padStart(2, '0'), // Formatear con 2 dígitos
      String(ahora.getDate()).padStart(2, '0'),
      String(ahora.getHours()).padStart(2, '0'),
      String(ahora.getMinutes()).padStart(2, '0'),
    ];
    return path.join(...partes);
  }
}
