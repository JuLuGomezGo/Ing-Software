import mongoose from 'mongoose';

const solicitudSchema = new mongoose.Schema({
  solicitudId: { type: Number, required: true, unique: true },
  proveedorId: { type: Number, required: true },
  fechaSolicitud: { type: Date, default: Date.now },
  estado: { type: String, enum: ['Enviado', 'Pendiente'], required: true },
  productoId: { type: Number, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true }
});

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

solicitudSchema.pre('save', async function(next) {
  if (!this.solicitudId) {
    this.solicitudId = await generarIdUnico('solicitudId');
  }
  next();
});

export default mongoose.model('SolicitudProducto', solicitudSchema);
