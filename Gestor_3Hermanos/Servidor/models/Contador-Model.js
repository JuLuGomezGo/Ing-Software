import mongoose from 'mongoose';


const contadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  valor: { type: Number, default: 1000 }
});

const Contador = mongoose.models.Contador || mongoose.model('Contador', contadorSchema);

// Devuelve un ID incremental único por documento
export async function generarId(nombre) {
  const contador = await Contador.findOneAndUpdate(
    { nombre },
    { $inc: { valor: 1 } },
    { new: true, upsert: true }
  );
  return contador.valor;
}
export default Contador;
