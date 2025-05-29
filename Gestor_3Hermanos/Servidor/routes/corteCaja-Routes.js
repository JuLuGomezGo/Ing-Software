import express from 'express';
import CorteCaja from '../models/CorteCaja-Model.js'; 
const router = express.Router();

// Crear un nuevo corte de caja
router.post('/', async (req, res) => {
  try {
    const nuevoCorte = new CorteCaja(req.body);
    const resultado = await nuevoCorte.save();
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todos los cortes de caja
router.get('/', async (req, res) => {
  try {
    const cortes = await CorteCaja.find().sort({ fecha_corte: -1 });
    res.json(cortes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un corte de caja por ID
router.get('/:id', async (req, res) => {
  try {
    const corte = await CorteCaja.findById(req.params.id);
    if (!corte) return res.status(404).json({ error: 'Corte no encontrado' });
    res.json(corte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un corte de caja por ID
router.put('/:id', async (req, res) => {
  try {
    const corteActualizado = await CorteCaja.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!corteActualizado) return res.status(404).json({ error: 'Corte no encontrado' });
    res.json(corteActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar un corte de caja por ID
router.delete('/:id', async (req, res) => {
  try {
    const corteEliminado = await CorteCaja.findByIdAndDelete(req.params.id);
    if (!corteEliminado) return res.status(404).json({ error: 'Corte no encontrado' });
    res.json({ mensaje: 'Corte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
