// Clase que representa una Película
class Pelicula {
  constructor(nombre, director, anio) {
    this.nombre   = nombre;
    this.director = director;
    this.anio     = anio;
  }

  // Convierte el objeto a línea de texto para guardar en el archivo
  toLineaTexto() {
    return `${this.nombre},${this.director},${this.anio}`;
  }

  // Crea una Pelicula a partir de una línea de texto del archivo
  static desdeLinea(linea) {
    const partes = linea.split(',');
    return new Pelicula(partes[0].trim(), partes[1].trim(), partes[2].trim());
  }
}

module.exports = Pelicula;
