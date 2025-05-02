import express from 'express';
import Producto from '../models/Producto-Model.js';

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().populate('proveedor')
      .select('-__v')
      .lean();

    res.json({
      success: true,
      count: productos.length,
      data: productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos: ' + error.message
    });
  }
});

// Obtener un producto por ID con proveedor
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findOne({ productoId: req.params.id }).populate('proveedor')
      .select('-__v')
      .lean();

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: `Producto con ID ${req.params.id} no encontrado`
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto: ' + error.message
    });
  }
});

// Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();

    // Eliminar campos internos de la respuesta
    const respuesta = nuevoProducto.toObject();
    delete respuesta.__v;

    res.status(201).json({
      success: true,
      data: respuesta
    });
  } catch (error) {
    const mensajeError = error.message.includes('validation')
      ? 'Datos inválidos: ' + error.message.replace('Validation failed: ', '')
      : error.message;

    res.status(400).json({
      success: false,
      error: mensajeError
    });
  }
});


// Actualizar producto 
router.put('/:id', async (req, res) => {
  try {
    // Buscar el producto por ID 
    const producto = await Producto.findOne({ productoId: req.params.id });

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: `Producto con ID ${req.params.id} no encontrado`
      });
    }

    //campos actualizables
    const camposPermitidos = {
      generales: ['nombre', 'descripcion', 'precio', 'stock', 'proveedor'],
      anidados: ['historialInventario']
    };

    // Actualizar campos generales
    camposPermitidos.generales.forEach(campo => {
      if (req.body[campo] !== undefined) {
        producto[campo] = req.body[campo];
      }
    });


    // nuevos registros al historial
    if (req.body.historialInventario) {
      producto.historialInventario.push(...req.body.historialInventario);
    }

    // Guardar cambios 
    await producto.save();

    // Preparar respuesta
    const respuesta = producto.toObject();
    delete respuesta.__v;

    res.json({
      success: true,
      data: respuesta
    });

  } catch (error) {
    // Manejo mejorado de errores
    let mensajeError = error.message;

    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      mensajeError = `Errores de validación: ${errores.join(', ')}`;
    }

    res.status(400).json({
      success: false,
      error: mensajeError
    });
  }
});

//PATCH para actualizar unicamente los valores necesarios.
router.patch('/:id', async (req, res) => {
  try {

    const producto = await Producto.findOneAndUpdate(
      { productoId: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    ).populate('proveedor');

    if (!producto) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }


    res.json({ success: true, message: "Producto actualizado", data: producto });
  } catch (error) {
    console.error(error); // Muestra el error en consola para más detalles
    res.status(500).json({ success: false, message: "Error interno", error: error.message });
  }
});



// Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const productoEliminado = await Producto.findOneAndDelete({
      productoId: req.params.id
    });

    if (!productoEliminado) {
      return res.status(404).json({
        success: false,
        error: `Producto con ID ${req.params.id} no encontrado`
      });
    }

    res.json({
      success: true,
      data: {
        message: `Producto "${productoEliminado.nombre}" eliminado`,
        productoId: productoEliminado.productoId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar: ' + error.message
    });
  }
});


router.post('/registrar-entrada', async (req, res) => {
  try {
    const { productoId, cantidad, usuarioId, motivo, solicitudId } = req.body;

    // Verificar si todos los campos requeridos están presentes
    if (!productoId || !cantidad || !usuarioId || !motivo) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
      });
    }

    // Buscar el producto
    const producto = await Producto.findOne({ productoId });
    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Crear movimiento de historial
    const nuevoMovimiento = {
      cantidad,
      tipoMovimiento: 'Entrada',
      motivo,
      usuarioId,
      detalles: {
        solicitudId: solicitudId || null, // Si hay solicitudId, lo registramos
      },
      fechaMovimiento: new Date(),
    };

    // Actualizar stock del producto
    producto.stock += cantidad;

    // Agregar movimiento al historial de inventario
    producto.historialInventario.push(nuevoMovimiento);

    // Guardar cambios en el producto
    await producto.save();

    // Si la entrada proviene de una solicitud, actualizar la solicitud a "Recibido"
    if (solicitudId) {
      const solicitud = await SolicitudProducto.findOne({ solicitudId });
      if (solicitud) {
        solicitud.estado = 'Recibido'; // Cambiar estado a 'Recibido'
        await solicitud.save();
      }
    }

    // Responder éxito
    res.status(200).json({
      success: true,
      message: 'Entrada registrada correctamente',
      producto
    });
  } catch (error) {
    // Responder error
    res.status(500).json({
      success: false,
      message: 'Error al registrar entrada',
      error: error.message
    });
  }
});

router.post('/registrar-salida', async (req, res) => {
  try {
    const { productoId, cantidad, usuarioId, motivo, detalles } = req.body;

    if (!productoId || !cantidad || !usuarioId || !motivo) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    const producto = await Producto.findOne({ productoId });
    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    if (producto.stock < cantidad) {
      return res.status(400).json({ success: false, message: 'Stock insuficiente para la salida solicitada' });
    }

    const nuevoMovimiento = {
      cantidad,
      tipoMovimiento: 'Salida',
      motivo,
      usuarioId,
      detalles: detalles || {},
      fechaMovimiento: new Date()
    };

    producto.stock -= cantidad;
    producto.historialInventario.push(nuevoMovimiento);
    await producto.save();

    res.status(200).json({
      success: true,
      message: 'Salida registrada correctamente',
      producto
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al registrar salida', detalles: error.message });
  }
});


export default router;

