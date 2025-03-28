import React, { useState, useEffect } from "react";
import PedidosRepartidorC from "../Componentes/PedidosRepartidorC";
import "./PedidosRepartidor.css"; // Tus estilos globales o de la página
import HeaderRepartidor from "../Componentes/HeaderRepartidor";
import SearchBar from "../Componentes/Search";
import MainContainer from "../Componentes/MainContainer";

function PedidosRepartidor() {
  const [busqueda, setBusqueda] = useState("");
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/pedidos");
        if (!response.ok) {
          throw new Error("Error al obtener pedidos");
        }
        const data = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchPedidos();
  }, []);

  // Mapeamos la estructura del backend
  const pedidosMapeados = pedidos.map((p) => ({
    id: p.pedidoId,
    direccion: p.direccionEntrega,
    total: p.total,
    nombreCliente: p.cliente,
    estado: p.estado,
    fecha: p.fecha,
    productos: p.productos,
    metodoPago: p.metodoPago,
  }));

  // Filtra los pedidos por la dirección
  const pedidosFiltrados = pedidosMapeados.filter((pedido) =>
    pedido.direccion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainContainer>
      <HeaderRepartidor />
      <div className="pedidos-content">
        <div className="search-container">
          <SearchBar
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="pedidos-container">
          <PedidosRepartidorC pedidos={pedidosFiltrados} />
        </div>
      </div>
    </MainContainer>
  );
}

export default PedidosRepartidor;
