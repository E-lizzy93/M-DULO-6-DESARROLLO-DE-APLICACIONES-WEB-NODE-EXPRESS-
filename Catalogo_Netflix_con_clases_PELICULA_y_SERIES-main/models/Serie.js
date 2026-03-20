// Clase que representa una Serie
class Serie {
  constructor(nombre, anio, temporadas) {
    this.nombre     = nombre;
    this.anio       = anio;
    this.temporadas = temporadas;
  }

  // Convierte el objeto a línea de texto para guardar en el archivo
  toLineaTexto() {
    return `${this.nombre},${this.anio},${this.temporadas}`;
  }

  // Crea una Serie a partir de una línea de texto del archivo
  static desdeLinea(linea) {
    const partes = linea.split(',');
    return new Serie(partes[0].trim(), partes[1].trim(), partes[2].trim());
  }
}

module.exports = Serie;
