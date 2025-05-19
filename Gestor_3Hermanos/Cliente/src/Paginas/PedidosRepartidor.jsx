import React, { useState, useEffect } from "react";
import PedidosRepartidorC from "../Componentes/PedidosRepartidorC";
import "./PedidosRepartidor.css";
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
        console.error("Error al obtener pedidos:", error);
      }
    };

    fetchPedidos();
  }, []);

  const normalizar = (texto) =>
    texto?.toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, " ")
      .trim();

  const pedidosMapeados = pedidos.map((pedido) => ({
    id: pedido.pedidoId,
    direccion: pedido.direccionEntrega,
    estado: pedido.estado,
    total: pedido.total,
    nombreCliente: pedido.cliente,
    productos: pedido.productos,
    fecha: pedido.fecha,
    metodoPago: pedido.metodoPago
  }));

  const pedidosFiltrados = pedidosMapeados
    // ✅ SOLO pedidos a domicilio (no "local")
    .filter((pedido) => {
      const direccion = (pedido.direccion || "").toLowerCase().trim();
      return direccion !== "local" && direccion.length > 3;
    })
    // ✅ Estados válidos para repartidor
    .filter((pedido) => {
      const estado = normalizar(pedido.estado);
      return ["en camino", "listo para entrega", "en proceso"].includes(estado);
    })
    // ✅ Búsqueda
    .filter((pedido) => {
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
          {pedidosFiltrados.length > 0 ? (
            <PedidosRepartidorC pedidos={pedidosFiltrados} />
          ) : (
            <p style={{ padding: "1rem", fontSize: "1.1rem", color: "#555" }}>
              No hay pedidos a domicilio para mostrar.
            </p>
          )}
        </div>
      </div>
    </MainContainer>
  );
}

export default PedidosRepartidor;
