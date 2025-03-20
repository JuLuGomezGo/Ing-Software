import express from 'express';
import cors from 'cors';
import connectDB from './db.js';

// Importa todas las rutas
import usuarioRoutes from './routes/usuarios-Routes.js';
import pedidoRoutes from './routes/pedidos-Routes.js';
import productoRoutes from './routes/productos-Routes.js';
import solicitudRoutes from './routes/solicitudes-Routes.js';

const app = express();
const PORT = process.env.PORT || 3000; 

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
connectDB();

//rutas CRUD
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/solicitudes', solicitudRoutes);

// Ruta de prueba (opcional)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend jalando al 100' });
});

// Ruta base
app.get('/', (req, res) => {
  res.send('Gestor 3Hermanos - API');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend en: http://localhost:${PORT}`);
});