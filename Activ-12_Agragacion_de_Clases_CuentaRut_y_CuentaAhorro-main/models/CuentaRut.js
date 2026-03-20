// Clase que representa una Cuenta RUT
class CuentaRut {
  constructor(numero, saldo) {
    this.numero = numero;
    this.saldo  = saldo;
  }

  // Crea una CuentaRut desde un objeto JSON
  static desdeJSON(datos) {
    return new CuentaRut(datos.numero, datos.saldo);
  }
}

module.exports = CuentaRut;
