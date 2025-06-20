import express from 'express';
import Usuario from '../models/Usuario-Model.js';
import Pedido from '../models/Pedido-Model.js';
import Producto from '../models/Producto-Model.js';




const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select('-contraseña -__v')
      .lean();

    res.json({ 
      success: true,
      data: usuarios 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ usuarioId: req.params.id })
      .select('-contraseña -__v');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: `Usuario con ID ${req.params.id} no encontrado`
      });
    }

    res.json({ 
      success: true,
      data: usuario 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, contraseña, rol, correo, caja } = req.body;

    // Validar campos requeridos
    const camposRequeridos = [];
    if (!nombre) camposRequeridos.push('nombre');
    if (!contraseña) camposRequeridos.push('contraseña');
    if (!rol) camposRequeridos.push('rol');
    if (!correo) camposRequeridos.push('correo');

    if (camposRequeridos.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Faltan campos requeridos: ${camposRequeridos.join(', ')}`
      });
    }

    // Crear usuario
    const nuevoUsuario = new Usuario({
      nombre,
      contraseña,
      rol,
      correo,
      caja: caja || []
    });

    const usuarioGuardado = await nuevoUsuario.save();

    // Preparar respuesta
    const respuesta = usuarioGuardado.toJSON();
    
    res.status(201).json({ 
      success: true,
      data: respuesta 
    });

  } catch (error) {
    let mensajeError = error.message;
    
    // Manejar errores de duplicados
    if (error.code === 11000) {
      if (error.keyPattern.correo) {
        mensajeError = 'El correo electrónico ya está registrado';
      } else if (error.keyPattern.usuarioId) {
        mensajeError = 'Error generando ID único (reintente)';
      }
    }

    res.status(400).json({ 
      success: false,
      error: mensajeError 
    });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.usuarioId;
    delete updates.correo;

    const usuarioActualizado = await Usuario.findOneAndUpdate(
      { usuarioId: req.params.id },
      updates,
      { 
        new: true,
        runValidators: true 
      }
    ).select('-contraseña -__v');

    if (!usuarioActualizado) {
      return res.status(404).json({
        success: false,
        error: `Usuario con ID ${req.params.id} no encontrado`
      });
    }

    res.json({ 
      success: true,
      data: usuarioActualizado 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Agregar movimiento de caja
router.post('/:id/caja', async (req, res) => {
  try {
      const idUsuario = Number(req.params.id); // Convertir a número
      const movimiento = req.body;

      const usuario = await Usuario.findOneAndUpdate(
          { usuarioId: req.params.id },
          { $push: { caja: movimiento } },
          { new: true, select: '-contraseña -__v' }
      );

      if (!usuario) {
          return res.status(404).json({
              success: false,
              error: 'Usuario no encontrado'
          });
      }

      res.json({
          success: true,
          data: movimiento
      });

  } catch (error) {
      res.status(500).json({
          success: false,
          error: error.message
      });
  }
});
//borrar caja
// Endpoint para borrar todo el array de caja de un usuario
router.delete('/:id/caja', async (req, res) => {
  try {
    const usuarioId = req.params.id;

    // Verificar si el usuario existe
    const usuarioExistente = await Usuario.findById(usuarioId);
    if (!usuarioExistente) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    // Actualizar el usuario, estableciendo el array caja a vacío
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      { $set: { caja: [] } }, // Esto vaciará completamente el array
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Todos los movimientos de caja han sido eliminados',
      data: {
        usuarioId: usuarioActualizado._id,
        nombre: usuarioActualizado.nombre,
        movimientosEliminados: usuarioExistente.caja.length,
        cajaActual: usuarioActualizado.caja // Debería ser un array vacío []
      }
    });

  } catch (error) {
    console.error('Error al borrar movimientos de caja:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al borrar los movimientos de caja',
      detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findOneAndDelete({ 
      usuarioId: req.params.id 
    });

    if (!usuarioEliminado) {
      return res.status(404).json({
        success: false,
        error: `Usuario con ID ${req.params.id} no encontrado`
      });
    }

    res.json({ 
      success: true,
      data: {
        message: `Usuario ${usuarioEliminado.nombre} eliminado`,
        usuarioId: usuarioEliminado.usuarioId
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/////////////////////////////////////////////Kevin 
// Ruta de Login
router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ success: false, error: 'Correo y contraseña son requeridos' });
    }

    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Verificar contraseña
    // const contraseña = req.body.contraseña;
    // const contraseña = await Usuario.findOne({ contraseña });
    // const contraseña = usuario.contraseña;
    // const passwordValida = contraseña === usuario.contraseña;

    // if (!passwordValida) {
    //   return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    // }

    // Preparar respuesta sin contraseña
    const userResponse = usuario.toObject();
    delete userResponse.contraseña;

    res.json({ success: true, message: 'Inicio de sesión exitoso', data: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
///////////////////////////fin de kevin


// Obtener pedidos y productos por ID
router.get('/caja/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar si el ID corresponde a un pedido
    const pedido = await Pedido.findOne({ pedidoId: Number(id) });
    if (pedido) {
      const nombresProductos = pedido.productos.map(p => p.nombre).join(', ');
      const total = pedido.total;

      return res.json({
        referencia: pedido.pedidoId,
        motivo: "Cobro Pedido",
        nombreProveedorCliente: pedido.cliente,
        producto: nombresProductos,
        monto: total
      });
    }

    // Buscar si el ID corresponde a un producto
    const producto = await Producto.findOne({ productoId: Number(id) }).populate('proveedor');
    if (producto) {
      return res.json({
        referencia: producto.productoId,
        motivo: "Pago a Proveedor",
        nombreProveedorCliente: producto.proveedor?.nombre || "",
        producto: producto.nombre,
        monto: producto.precio
      });
    }

    // Si no se encontró
    return res.status(404).json({ message: 'No se encontró ni pedido ni producto con ese ID' });
  } catch (error) {
    console.error("Error en búsqueda de ID:", error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

//
export default router;