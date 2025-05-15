
//MODELO DE SOLICITUD DE PRODUCTO

import mongoose from 'mongoose';

const generarIdUnico = async (campo) => {
  let id;
  let contador = 0;
  let existe;

  do {
    id = Math.floor(1000 + Math.random() * 9000);
    contador++;

    if (contador > 100) {
      throw new Error('No se pudo generar un ID único después de 100 intentos');
    }

    existe = await mongoose.model('SolicitudProducto').exists({ [campo]: id });
  } while (existe);

  return id;
};

const solicitudSchema = new mongoose.Schema({
  solicitudId: {
    type: Number,
    unique: true,
    validate: (v) => /^\d{4}$/.test(v.toString())
  },
  proveedor: {
    type: Number,
    ref: 'Proveedor',
    required: true
  },
  fechaSolicitud: { type: Date, default: Date.now },
  estado: {
    type: String,
    enum: ['Pendiente', 'Enviado', 'Recibido', 'Cancelado', 'Pagado'],
    default: 'Pendiente',
    required: true
  },
  productos: [
    {
      productoId: { type: Number, ref: 'Producto' },
      nombreTemporal: { type: String }, 
      cantidad: { type: Number, required: true, min: 1 },
      costoUnitario: { type: Number, required: true }, // Precio de compra unitario
      subtotal: { type: Number }
    }
  ],
  total: Number,  // Suma de subtotales
  usuarioSolicita: Number, // Para saber quién generó la solicitud
  fechaRecepcion: Date, // Para registrar la entrega efectiva
  usuarioRecibe: Number, // Para trazabilidad de la recepción

});


solicitudSchema.pre('save', async function (next) {
  try {
    if (!this.solicitudId) {
      this.solicitudId = await generarIdUnico('solicitudId');
    }

    // Calcular subtotales si no están definidos
    this.productos.forEach((item) => {
      if (!item.productoId && !item.nombreTemporal) {
        throw new Error("Cada producto debe tener productoId o nombreTemporal.");
      }
    
      if (!item.subtotal) {
        item.subtotal = item.cantidad * item.costoUnitario;
      }
    });
    

    // Calcular total
    this.total = this.productos.reduce((acc, prod) => acc + prod.subtotal, 0);

    next();
  } catch (error) {
    next(error);
  }
});


export default mongoose.model('SolicitudProducto', solicitudSchema);
