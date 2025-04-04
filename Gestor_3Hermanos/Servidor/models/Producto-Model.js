import mongoose from 'mongoose';
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

// modelo de Proveedor
const proveedorSchema = new mongoose.Schema({
  proveedorId: {
    type: Number,
    unique: true,
    validate: (v) => /^\d{4}$/.test(v.toString())
  },
  nombre: { type: String, required: true },
  contacto: { type: String, required: true },
  email: { type: String, required: true },
  direccion: { type: String, required: true }
});

proveedorSchema.pre('save', async function(next) {
  if (!this.proveedorId) {
    this.proveedorId = await generarIdUnico('Proveedor', 'proveedorId');
  }
  next();
});

// const Proveedor = mongoose.model('Proveedor', proveedorSchema);
// const HistorialInventario = mongoose.model('HistorialInventario', historialInventarioSchema);

// Modelo de HistorialInventario
const historialInventarioSchema = new mongoose.Schema({
  historialId: {
    type: Number,
    unique: true,
    validate: (v) => /^\d{4}$/.test(v.toString())
  },
  cantidad: { type: Number, required: true },
  tipoMovimiento: { type: String, required: true },
  fechaMovimiento: { type: Date, default: Date.now },
  usuarioId: { type: Number, required: true }
});

historialInventarioSchema.pre('save', async function(next) {
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
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  proveedor: proveedorSchema,
  historialInventario: [historialInventarioSchema]
}, { 
  timestamps: true,
  collection: 'productos'
});

productoSchema.pre('save', async function(next) {
  try {
    if (!this.productoId) {
      this.productoId = await generarIdUnico('Producto', 'productoId');
    }

    if (this.proveedor && !this.proveedor.proveedorId) {
      this.proveedor.proveedorId = await generarIdUnico('Proveedor', 'proveedorId');
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
////////////////////////////////////////////////////////
//Implementacion del contador.
productoSchema.pre('save', async function(next) {
  try {
    if (!this.productoId) {
      this.productoId = await generarId('Producto');
    }

    if (this.proveedor && !this.proveedor.proveedorId) {
      this.proveedor.proveedorId = await generarId('Proveedor');
    }

    for (const historial of this.historialInventario) {
      if (!historial.historialId) {
        historial.historialId = await generarId('HistorialInventario');
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

const Producto = mongoose.model('Producto', productoSchema);

export default Producto;

