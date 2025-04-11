import express from 'express';
import SolicitudProducto from '../models/SolicitudProducto-Model.js';
import Producto from '../models/Producto-Model.js';


const router = express.Router();

// Obtener todas las solicitudes
router.get('/', async (req, res) => {
  try {
    const solicitudes = await SolicitudProducto.find()
      .populate('productoId', 'nombre precio');
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener solicitudes', detalles: error.message });
  }
});

// Obtener una solicitud por ID
router.get('/:id', async (req, res) => {
  try {
    const solicitud = await SolicitudProducto.findOne({ solicitudId: req.params.id })
      .populate('productoId', 'nombre precio');
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json(solicitud);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar solicitud', detalles: error.message });
  }
});

// Crear una nueva solicitud
router.post('/', async (req, res) => {
  try {
    const { productoId, proveedorId, cantidad, estado } = req.body;

    const producto = await Producto.findOne({ productoId });
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    if (!productoId || !proveedorId || !cantidad || !estado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios en la solicitud' });
    }


    const nuevaSolicitud = new SolicitudProducto({
      productoId,
      proveedorId,
      cantidad,
      estado,
      fechaSolicitud: new Date() 
    });

    await nuevaSolicitud.save();
    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear solicitud', detalles: error.message });
  }
});

// Actualizar una solicitud completa
router.put('/:id', async (req, res) => {
  try {
    const solicitud = await SolicitudProducto.findOneAndUpdate(
      { solicitudId: req.params.id },
      req.body,
      { new: true }
    );
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json(solicitud);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar solicitud', detalles: error.message });
  }
});

// Actualizar solo el estado de una solicitud
router.patch('/:id/estado', async (req, res) => {
  try {
    const solicitud = await SolicitudProducto.findOneAndUpdate(
      { solicitudId: req.params.id },
      { estado: req.body.estado },
      { new: true }
    );
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json(solicitud);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar estado', detalles: error.message });
  }
});

// Eliminar una solicitud
router.delete('/:id', async (req, res) => {
  try {
    const solicitud = await SolicitudProducto.findOneAndDelete({ solicitudId: req.params.id });
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json({ mensaje: 'Solicitud eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar solicitud', detalles: error.message });
  }
});


export default router;
