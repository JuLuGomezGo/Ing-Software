
// src/Paginas/PedidosRepartidor.jsx
import React, { useState } from "react";
import PedidosRepartidorC from "../Componentes/PedidosRepartidorC";
import "./PedidosRepartidor.css";

import HeaderRepartidor from "../Componentes/HeaderRepartidor";
import SearchBar from '../Componentes/Search'

// Importa tu nueva imagen (ajusta la ruta si es distinta)
import LogoSinTexto from "../Componentes/Iconos/Logo.png";
import MainContainer from "../Componentes/MainContainer";
function PedidosRepartidor() {
  const [busqueda, setBusqueda] = useState("");

  // Ejemplo de pedidos
  const [pedidos, setPedidos] = useState([
    {
      id: 13,
      direccion: "Mexico Sur #177 Col. Atenas",
      total: 150,
      nombreCliente: "Alejandro",
      estado: "Listo p Entrega",
    },
    {
      id: 5,
      direccion: "Camilo Torres #117 Col. 2 de Agosto",
      total: 100,
      nombreCliente: "Juan Luis",
      estado: "En Reparto",
    },
    {
      id: 10,
      direccion: "Av Siempreviva #742",
      total: 300,
      nombreCliente: "Homer",
      estado: "En Reparto",
    },
    {
      id: 4,
      direccion: "Escobedo #177 Col. Tepeyac",
      total: 150,
      nombreCliente: "Juan Daniel",
      estado: "En Reparto",
    },
  ]);

  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.direccion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainContainer>
      <HeaderRepartidor />

      <div className="pedidos-content">
        <div className="search-container">

          <SearchBar value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}>
          </SearchBar>

        </div>

        <div className="pedidos-container">
          <PedidosRepartidorC pedidos={pedidosFiltrados} />
        </div>
      </div>
    </MainContainer>
  );
}

export default PedidosRepartidor;
