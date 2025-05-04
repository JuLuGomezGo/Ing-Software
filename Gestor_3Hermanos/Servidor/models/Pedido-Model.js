import mongoose from 'mongoose';

const productoPedidoSchema = new mongoose.Schema({
  productoId: { type: Number, required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true }
});
const pedidoSchema = new mongoose.Schema({
  pedidoId: { type: Number, required: true, unique: true },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, enum: ['Pendiente', 'En proceso', 'Listo para entrega', 'En camino', 'Entregado', 'Pagado'], required: true },
  cliente: { type: String, required: true },
  direccionEntrega: { type: String, required: true },
  metodoPago: { type: String, required: true },
  total: { type: Number, required: true },
  usuarioId: { type: Number, ref: 'Usuario', required: true },
  productos: [productoPedidoSchema]
});

export default mongoose.model('Pedido', pedidoSchema);