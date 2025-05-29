import mongoose from 'mongoose';

// Definir el esquema del corte de caja
const CorteCajaSchema = new mongoose.Schema({
  fecha_corte: {
    type: Date,
    required: true
  },
  dinero_total: {
    type: Number,
    required: true
  }
}, {
  collection: 'corte_caja', // Nombre de la colección en MongoDB
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Crear el modelo
const CorteCaja = mongoose.model('CorteCaja', CorteCajaSchema);

// Exportar el modelo
module.exports = CorteCaja;
