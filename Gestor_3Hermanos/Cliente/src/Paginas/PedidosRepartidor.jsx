import React, { useState, useEffect } from "react";
import PedidosRepartidorC from "../Componentes/PedidosRepartidorC";
import "./PedidosRepartidor.css";
import HeaderRepartidor from "../Componentes/HeaderRepartidor";
import SearchBar from "../Componentes/Search";
import MainContainer from "../Componentes/MainContainer";
import IconMap from "../Componentes/Iconos/map.png";

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
        console.error("Error al obtener pedidos:", error);
      }
    };

    fetchPedidos();
  }, []);

  const normalizar = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

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

  const pedidosFiltrados = pedidosMapeados.filter((pedido) => {
    const filtro = normalizar(busqueda);
    return (
      normalizar(pedido.direccion).includes(filtro) ||
      normalizar(pedido.nombreCliente).includes(filtro)
    );
  });

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