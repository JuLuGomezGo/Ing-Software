import express from 'express';
import Proveedor from '../models/Proveedor-Model.js';

const router = express.Router();


// GET - Obtener todos los proveedores
router.get('/', async (req, res) => {
    try {
        const proveedores = await Proveedor.find({ activo: true }).select('-__v'); 

        res.json({ success: true, data: proveedores });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener proveedores', detalles: error.message });
    }
});
router.get('/inactivos', async (req, res) => {
    try {
        const proveedores = await Proveedor.find({ activo: false }).select('-__v'); 

        res.json({ success: true, data: proveedores });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener proveedores', detalles: error.message });
    }
});

// GET - Obtener proveedor por ID
router.get('/:id', async (req, res) => {
    try {
        const proveedor = await Proveedor.findOne({ proveedorId: req.params.id });
        if (!proveedor) return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
        res.json({ success: true, data: proveedor });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al buscar proveedor', detalles: error.message });
    }
});

// POST - Crear nuevo proveedor
router.post('/', async (req, res) => {
    try {
        const nuevoProveedor = new Proveedor(req.body);
        await nuevoProveedor.save();
        const result = nuevoProveedor.toObject();
        delete result.__v;
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        const mensaje = error.code === 11000
            ? "Ya existe un proveedor con ese ID"
            : error.message;
        res.status(400).json({ success: false, error: mensaje });
    }
});

// PUT - Actualizar proveedor existente
router.put('/:id', async (req, res) => {
    try {
        const proveedorActualizado = await Proveedor.findOneAndUpdate(
            { proveedorId: req.params.id },
            req.body,
            { new: true }
        );
        if (!proveedorActualizado) {
            return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
        }
        res.json({ success: true, data: proveedorActualizado });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Error al actualizar proveedor', detalles: error.message });
    }
});

// INACTIVAR PROVEEDOR
router.delete('/:id', async (req, res) => {
    try {
        const proveedorInactivado = await Proveedor.findOneAndUpdate(
            { proveedorId: req.params.id },
            { activo: false },
            { new: true }
        );

        if (!proveedorInactivado) {
            return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
        }

        res.json({ success: true, mensaje: `Proveedor "${proveedorInactivado.nombre}" inactivado correctamente` });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al inactivar proveedor', detalles: error.message });
    }
});

// Reactivar proveedor
router.put('/:id/reactivar', async (req, res) => {
    try {
      const proveedorReactivado = await Proveedor.findOneAndUpdate(
        { proveedorId: req.params.id },
        { activo: true },
        { new: true }
      );
  
      if (!proveedorReactivado) {
        return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
      }
  
      res.json({ success: true, mensaje: `Proveedor "${proveedorReactivado.nombre}" reactivado correctamente` });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al reactivar proveedor', detalles: error.message });
    }
  });


export default router;
