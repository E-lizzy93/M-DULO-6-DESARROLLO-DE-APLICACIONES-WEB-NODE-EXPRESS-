// Clase que representa una Cuenta de Ahorro
class CuentaAhorro {
  constructor(numero, saldo) {
    this.numero = numero;
    this.saldo  = saldo;
  }

  // Crea una CuentaAhorro desde un objeto JSON
  static desdeJSON(datos) {
    return new CuentaAhorro(datos.numero, datos.saldo);
  }
}

module.exports = CuentaAhorro;
