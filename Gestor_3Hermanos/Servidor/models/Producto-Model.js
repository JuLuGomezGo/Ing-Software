import mongoose from 'mongoose';
import SolicitudProducto from '../models/SolicitudProducto-Model.js';

// Registrar modelos auxiliares primero
const generarIdUnico = async (modelName, campoId) => {
  let id;
  let contador = 0;
  let existe;

  do {
    id = Math.floor(1000 + Math.random() * 9000);
    contador++;

    if (contador > 100) {
      throw new Error('No se pudo generar un ID único después de 100 intentos');
    }

    const Model = mongoose.model(modelName);
    existe = await Model.exists({ [campoId]: id });  // Sin declaración

  } while (existe);  // Ahora está accesible

  return id;
};


// Modelo de HistorialInventario
const historialInventarioSchema = new mongoose.Schema({
  historialId: {
    type: Number,
    unique: true,
    validate: (v) => /^\d{4}$/.test(v.toString())
  },
  cantidad: { type: Number, required: true },
  tipoMovimiento: {
    type: String,
    enum: ['Entrada', 'Salida'],
    required: true
  },
  motivo: {
    type: String,
    enum: ['Nuevo Producto', 'ReStock', 'Merma o Perdida', 'Venta a Cliente', 'Devolución'],
    required: true
  },
  detalles:
   { 
    type: mongoose.Schema.Types.Mixed,
    default: {},
    solicitudId: Number,
    pedidoId: Number,
    cliente: String,
    nota: String, 
  },
  fechaMovimiento: { type: Date, default: Date.now },
  usuarioId: { type: Number, required: true }
});
mongoose.model('HistorialInventario', historialInventarioSchema);


historialInventarioSchema.pre('save', async function (next) {
  if (!this.historialId) {
    this.historialId = await generarIdUnico('HistorialInventario', 'historialId');
  }
  next();
});


// Modelo de Producto
const productoSchema = new mongoose.Schema({
  productoId: {
    type: Number,
    unique: true,
    validate: (v) => /^\d{4}$/.test(v.toString())
  },
  nombre: { type: String, required: true },
  descripcion: { type: String},
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  proveedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proveedor',
    required: true
  },
  historialInventario: [historialInventarioSchema]
}, {
  timestamps: true,
  collection: 'productos'
});

productoSchema.pre('save', async function (next) {
  try {
    if (!this.productoId) {
      this.productoId = await generarIdUnico('Producto', 'productoId');
    }

    if (this.historialInventario) {
      for (const historial of this.historialInventario) {
        if (!historial.historialId) {
          historial.historialId = await generarIdUnico('HistorialInventario', 'historialId');
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});



const Producto = mongoose.model('Producto', productoSchema);

export default Producto;

