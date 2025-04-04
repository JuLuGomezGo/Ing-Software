import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';



// Páginas
import LoginGE from './Paginas/LoginGE';
import Home from './Paginas/Home';
import Inventario from './Paginas/Inventario';
import GestionPedidos from './Paginas/GestionPedidos';
import Caja from './Paginas/Caja';
import GestionUsuarios from './Paginas/GestionUsuarios';

import PedidosRepartidor from './Paginas/PedidosRepartidor';
import MainContainer from './Componentes/MainContainer';

// import Error404 from './Paginas/Error404';  // Nueva página de error


function App() {
  const usuarioLogueado = localStorage.getItem("usuario");
  const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;
  const rolUsuario = usuario?.rol; // Extrae el rol correctamente

  return (
    <MainContainer>
      <BrowserRouter>
        <Routes>

          {/* Redirección según usuario logueado */}
          <Route path="/" element={
            !usuarioLogueado ? <Navigate to="/login" /> :
              rolUsuario === "Repartidor" ? <Navigate to="/pedidos" /> :
                <Navigate to="/home" />
          } />

          {/* Rutas de Login */}
          <Route path="/login" element={<LoginGE />} />

          {/* Rutas accesibles SOLO para Gerente y Empleado */}
          {usuarioLogueado && rolUsuario !== "Repartidor" && (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/caja" element={<Caja />} />
              <Route path="/gestion-pedidos" element={<GestionPedidos />} />
            </>
          )}

          {/* Ruta accesible SOLO para el Gerente */}
          {usuarioLogueado && rolUsuario === "Gerente" && (
            <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
          )}

          {/* Rutas accesibles SOLO para el Repartidor */}
          {usuarioLogueado && rolUsuario === "Repartidor" && (
            <Route path="/pedidos" element={<PedidosRepartidor />} />
          )}

          {/* Página de error 404
          <Route path="*" element={<Error404 />} /> */}
        </Routes>
      </BrowserRouter>
    </MainContainer>

  );
}

export default App;
