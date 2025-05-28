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
import GestionProveedores from './Paginas/GestionProveedores';
import SolicitudProductos from "./Paginas/SolicitudProductos";
// import PedidosRepartidor from './Paginas/PedidosRepartidor';
import MainContainer from './Componentes/MainContainer';


function App() {
  const usuarioLogueado = localStorage.getItem("usuario");
  const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;
  const rolUsuario = usuario?.rol;

  return (
    <MainContainer>
      <BrowserRouter>
        <Routes>

          {/* Redirección según usuario logueado */}
          <Route path="/" element={
            !usuarioLogueado ? <Navigate to="/login" /> :
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
              <Route path="/gestion-proveedores" element={<GestionProveedores />} />
              <Route path='/SolicitudProducto' element={<SolicitudProductos />} />
            </>
          )}

          {/* Ruta accesible SOLO para el Gerente */}
          {usuarioLogueado && rolUsuario === "Gerente" && (
            <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
          )}

          {/* Rutas accesibles SOLO para el Repartidor */}
          {usuarioLogueado && rolUsuario === "Repartidor" && (
            <>
            <Route path="/home" element={<Home />} />
            {/* <Route path="/pedidos" element={<PedidosRepartidor />} /> */}
            </>
          )}

          {/* Página de error 404
          <Route path="*" element={<Error404 />} /> */}
        </Routes>
      </BrowserRouter>
    </MainContainer>

  );
}

export default App;
