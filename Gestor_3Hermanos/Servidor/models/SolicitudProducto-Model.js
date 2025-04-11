
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
  proveedorId: { type: Number, required: true },
  fechaSolicitud: { type: Date, default: Date.now },
  estado: {
    type: String,
    enum: ['Pendiente', 'Enviado', 'Recibido'],
    default: 'Pendiente',
    required: true
  },
  productoId: { type: Number, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true }
});


solicitudSchema.pre('save', async function (next) {
  if (!this.solicitudId) {
    this.solicitudId = await generarIdUnico('solicitudId');
  }
  next();
});

export default mongoose.model('SolicitudProducto', solicitudSchema);
