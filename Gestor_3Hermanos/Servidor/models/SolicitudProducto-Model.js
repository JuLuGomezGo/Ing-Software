import mongoose from 'mongoose';
import { generarId } from './Contador-Model.js';

const solicitudSchema = new mongoose.Schema({
  solicitudId: { type: Number, required: true, unique: true },
  proveedorId: { type: Number, required: true },
  fechaSolicitud: { type: Date, default: Date.now },
  estado: { type: String, enum: ['Enviado', 'Pendiente'], required: true },
  productoId: { type: Number, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true }
});

solicitudSchema.pre('save', async function(next) {
  if (!this.solicitudId) {
    this.solicitudId = await generarId('SolicitudProducto');
  }
  next();
});

export default mongoose.model('SolicitudProducto', solicitudSchema);