import express from 'express';
import Pedido from '../models/Pedido-Model.js';
import Usuario from '../models/Usuario-Model.js'; // Asegurate que este modelo exista

const router = express.Router();

// GET - Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos', detalles: error.message });
  }
});

// GET - Obtener pedido por ID
router.get('/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findOne({ pedidoId: req.params.id });
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedido', detalles: error.message });
  }
});

// POST - Crear un nuevo pedido
router.post('/', async (req, res) => {
  try {
    const { pedidoId, usuarioId, productos } = req.body;

    // Validar que no se repita el pedidoId
    const pedidoExistente = await Pedido.findOne({ pedidoId });
    if (pedidoExistente) {
      return res.status(400).json({ error: 'Ya existe un pedido con ese ID' });
    }

    // Validar existencia de usuario
    const usuario = await Usuario.findOne({ usuarioId });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar que haya productos
    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos un producto' });
    }

    // Calcular total
    let total = 0;
    productos.forEach(p => {
      total += p.cantidad * p.precioUnitario;
    });

    const nuevoPedido = new Pedido({
      ...req.body,
      total,
      fecha: new Date()
    });

    await nuevoPedido.save();
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear pedido', detalles: error.message });
  }
});

// PUT - Actualizar pedido completo
router.put('/:id', async (req, res) => {
  try {
    const { productos } = req.body;

    // Si se pasan productos, recalcular total
    if (productos && productos.length > 0) {
      let total = 0;
      productos.forEach(p => {
        total += p.cantidad * p.precioUnitario;
      });
      req.body.total = total;
    }

    const pedidoActualizado = await Pedido.findOneAndUpdate(
      { pedidoId: req.params.id },
      req.body,
      { new: true }
    );

    if (!pedidoActualizado) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(pedidoActualizado);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar pedido', detalles: error.message });
  }
});

// DELETE - Eliminar un pedido
router.delete('/:id', async (req, res) => {
  try {
    const pedidoEliminado = await Pedido.findOneAndDelete({ pedidoId: req.params.id });

    if (!pedidoEliminado) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ mensaje: 'Pedido eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar pedido', detalles: error.message });
  }
});

export default router;