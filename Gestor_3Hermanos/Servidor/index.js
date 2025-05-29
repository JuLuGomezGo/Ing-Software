import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';

// Cargar variables de entorno desde .env
dotenv.config();

// Importación de rutas
import usuarioRoutes from './routes/usuarios-Routes.js';
import pedidoRoutes from './routes/pedidos-Routes.js';
import productoRoutes from './routes/productos-Routes.js';
import solicitudRoutes from './routes/solicitudes-Routes.js';
import proveedoresRoutes from './routes/proveedores-Routes.js';
import corteCajaRoutes from './routes/corteCaja-Routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
connectDB();

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/cortes', corteCajaRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend jalando al 100' });
});

// Ruta base
app.get('/', (req, res) => {
  res.send('Gestor 3Hermanos - API');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor backend en ejecución: http://localhost:${PORT}`);
});