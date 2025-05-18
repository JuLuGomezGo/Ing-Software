import express from 'express';
import SolicitudProducto from '../models/SolicitudProducto-Model.js';
import Producto from '../models/Producto-Model.js';
import Proveedor from '../models/Proveedor-Model.js';


const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = estado ? { estado } : {};

    const solicitudes = await SolicitudProducto.find(filtro).lean();
    if (!Array.isArray(solicitudes)) {
      throw new Error('Error inesperado: el resultado de find no es un arreglo');
    }

    const productos = await Producto.find({}, 'productoId nombre precio').lean();
    const proveedores = await Proveedor.find({}, 'proveedorId nombre contacto email').lean();
    const solicitudesConDetalles = solicitudes.map((sol) => {
      const proveedorInfo = proveedores.find(p => p.proveedorId === sol.proveedor);
      const productosDetallados = sol.productos.map((p) => {
        const prodInfo = productos.find(prod => prod.productoId === p.productoId);
        return {
          ...p,
          producto: prodInfo
            ? { nombre: prodInfo.nombre, precio: prodInfo.precio }
            : { nombre: p.nombreTemporal || 'Producto no registrado', precio: p.costoUnitario }
        };
      });

      return {
        ...sol,
        proveedor: proveedorInfo || { nombre: 'Proveedor desconocido' },
        productos: productosDetallados
      };
    });

    res.json({ success: true, data: solicitudesConDetalles });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener solicitudes',
      detalles: error.message
    });
  }
});


// router.get('/', async (req, res) => {
//   try {
//     // Obtener todas las solicitudes

//     const solicitudes = await SolicitudProducto.find().lean(); // <-- importante para poder modificar el objeto directamente
//     // Obtener todos los productos (solo los necesarios para el detalle)
//     const productos = await Producto.find({}, 'productoId nombre precio').lean();
//     const proveedores = await Proveedor.find({}, 'proveedorId nombre contacto email').lean();

//     // Enriquecer cada solicitud con detalles del producto
//     const solicitudesConDetalles = solicitudes.map((sol) => {
//       const proveedorInfo = proveedores.find(p => p.proveedorId === sol.proveedor);
//       const productosDetallados = sol.productos.map((p) => {
//         const prodInfo = productos.find(prod => prod.productoId === p.productoId);
//         return {
//           ...p,
//           producto: prodInfo || { nombre: 'Producto desconocido', precio: 0 }
//         };
//       });

//       return {
//         ...sol,
//         proveedor: proveedorInfo || { nombre: 'Proveedor desconocido' },
//         productos: productosDetallados
//       };
//     });

//     res.json({ success: true, data: solicitudesConDetalles });

//   } catch (error) {
//     console.error("Error al obtener solicitudes:", error);
//     res.status(500).json({
//       success: false,
//       error: 'Error al obtener solicitudes',
//       detalles: error.message
//     });
//   }
// });




// Obtener una solicitud por ID
router.get('/:id', async (req, res) => {
  try {
    // Buscar la solicitud por solicitudId (que es un número)
    const solicitud = await SolicitudProducto.findOne({ solicitudId: Number(req.params.id) }).lean();

    if (!solicitud) {
      return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
    }

    // Buscar proveedor por proveedorId
    const proveedor = await Proveedor.findOne({ proveedorId: solicitud.proveedor }).lean();

    // Buscar todos los productos relacionados
    const productos = await Producto.find({}, 'productoId nombre precio').lean();

    // Enriquecer detalles de productos
    const productosDetallados = solicitud.productos.map((p) => {
      const prodInfo = productos.find(prod => prod.productoId === p.productoId);
      return {
        ...p,
        producto: prodInfo
          ? { nombre: prodInfo.nombre, precio: prodInfo.precio }
          : { nombre: p.nombreTemporal || 'Producto no registrado', precio: p.costoUnitario }
      };
    });

    // Retornar solicitud con detalles completos
    res.json({
      success: true,
      data: {
        ...solicitud,
        proveedor: proveedor || { nombre: 'Proveedor desconocido' },
        productos: productosDetallados
      }
    });

  } catch (error) {
    console.error("Error al buscar solicitud:", error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar solicitud',
      detalles: error.message
    });
  }
});


//OBTENER SOLICITUDES RELACIONADAS A UN PRODUCTO
router.get('/producto/:productoId', async (req, res) => {
  try {
    const solicitudes = await SolicitudProducto.find({ "productos.productoId": req.params.productoId })
      .populate('proveedor', 'nombre')
      .populate('productos.productoId', 'nombre');

    res.json({ success: true, data: solicitudes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al buscar solicitudes', detalles: error.message });
  }
});

// SOLICITUDES POR ESTADO


// router.get('/', async (req, res) => {
//   try {
//     const { estado } = req.query;

//     const filtro = estado ? { estado } : {};

//     const solicitudes = await SolicitudProducto.find(filtro)
//       .populate('proveedor')  // si tienes referencias a proveedores
//       .populate('productos.producto'); // si incluyes referencias a productos

//     res.json(solicitudes);

//   } catch (err) {
//     console.error('Error al obtener solicitudes:', err);
//     res.status(500).json({ error: 'Error al obtener solicitudes' });
//   }
// });


// Crear una nueva solicitud con múltiples productos. Calcula subtotales y total automáticamente.
router.post('/', async (req, res) => {
  try {
    const { proveedor, productos, usuarioSolicita } = req.body;

    if (!proveedor || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ success: false, error: "Datos incompletos" });
    }

    // Calcular subtotales
    const productosConSubtotal = productos.map(p => ({
      ...p,
      subtotal: p.cantidad * p.costoUnitario
    }));

    const total = productosConSubtotal.reduce((sum, p) => sum + p.subtotal, 0);

    const nuevaSolicitud = new SolicitudProducto({
      proveedor,
      productos: productosConSubtotal,
      total,
      usuarioSolicita
    });

    await nuevaSolicitud.save();
    res.status(201).json({ success: true, data: nuevaSolicitud });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al crear solicitud', detalles: error.message });
  }
});


// Actualizar el estado a Recibido, asignar usuario y fecha
router.patch('/:id/recibir', async (req, res) => {
  try {
    const { usuarioRecibe } = req.body;

    const solicitud = await SolicitudProducto.findOneAndUpdate(
      { solicitudId: req.params.id },
      {
        estado: 'Recibido',
        usuarioRecibe,
        fechaRecepcion: new Date()
      },
      { new: true }
    );

    if (!solicitud) {
      return res.status(404).json({ success: false, error: "Solicitud no encontrada" });
    }

    res.json({ success: true, data: solicitud });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al actualizar solicitud', detalles: error.message });
  }
});




// Actualizar solo el estado de una solicitud
router.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body;

  if (!['Pendiente', 'Enviado', 'Recibido', 'Cancelado', 'Pagado'].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  const solicitud = await SolicitudProducto.findOneAndUpdate(
    { solicitudId: req.params.id },
    { estado },
    { new: true }
  );

  if (!solicitud) {
    return res.status(404).json({ error: 'Solicitud no encontrada' });
  }

  res.json(solicitud);
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
