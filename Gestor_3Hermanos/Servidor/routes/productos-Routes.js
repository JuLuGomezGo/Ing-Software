import express from 'express';
import Producto from '../models/Producto-Model.js';

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find()
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

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findOne({ productoId: req.params.id })
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
      generales: ['nombre', 'descripcion', 'precio', 'stock'],
      anidados: ['proveedor', 'historialInventario']
    };

    // Actualizar campos generales
    camposPermitidos.generales.forEach(campo => {
      if (req.body[campo] !== undefined) {
        producto[campo] = req.body[campo];
      }
    });

    // Actualizar proveedor 
    if (req.body.proveedor) {
      producto.proveedor = {
        ...producto.proveedor.toObject(), 
        ...req.body.proveedor
      };
      delete producto.proveedor._id; // Eliminar ID existente para evitar conflicto
    }

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

export default router;

