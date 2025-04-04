import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import styled from "styled-components";

import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";
import SubTittle from "../Componentes/SubTitle";
import Button from "../Componentes/Button";

// --------------------- ESTILOS ---------------------
const TopSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  background-color: #f9f4ee;
`;

const SmallTableContainer = styled.div`
  flex: 1;
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
`;

const LargeTableContainer = styled.div`
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9f4ee;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
`;

const TableHeader = styled.th`
  border-bottom: 2px solid #000;
  text-align: left;
  padding: 8px;
`;

const TableData = styled.td`
  border-bottom: 1px solid #ccc;
  padding: 8px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  width: 400px;
  border-radius: 10px;
`;
// --------------------------------------------------

function Home() {
  const navigate = useNavigate(); // Añade este hook
  // 1) Productos Disponibles (desde /api/productos)
  const [productosDisponibles, setProductosDisponibles] = useState([]);

  // 2) Movimientos de Caja (de todos los usuarios, se mostrarán los 2 últimos)
  const [movimientosCaja, setMovimientosCaja] = useState([]);

  // 3) Pedidos (desde /api/Pedidos)
  const [pedidos, setPedidos] = useState([]);

  // Control del modal para detalles del pedido
  const [showModal, setShowModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  // --------------------------------------------------
  // Cargar Productos Disponibles
  // --------------------------------------------------
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/productos");
        const result = await response.json();
        if (result.success) {
          setProductosDisponibles(result.data);
        } else {
          console.error("Error al obtener productos:", result.error);
        }
      } catch (error) {
        console.error("Error de fetch productos:", error);
      }
    };
    fetchProductos();
  }, []);

  // --------------------------------------------------
  // Cargar Movimientos de Caja sin usar un usuario constante
  // Se obtienen todos los usuarios, se combinan sus movimientos de caja
  // y se ordenan por fecha para mostrar los 2 últimos movimientos
  // --------------------------------------------------
  useEffect(() => {
    const fetchCajaMovimientos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/usuarios");
        if (!response.ok) {
          throw new Error(`Error al obtener usuarios. Status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Respuesta de usuarios:", result);
        if (result.success && Array.isArray(result.data)) {
          // Combinar todos los movimientos de caja de cada usuario
          const allMovimientos = result.data.reduce((acc, usuario) => {
            if (usuario.caja && Array.isArray(usuario.caja)) {
              return acc.concat(usuario.caja);
            }
            return acc;
          }, []);
          // Ordenar por fechaHora descendente (más recientes primero)
          allMovimientos.sort(
            (a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)
          );
          // Mostrar los 2 últimos movimientos (los primeros 2 del array ordenado)
          setMovimientosCaja(allMovimientos.slice(0, 2));
        } else {
          console.error("No se encontró data en usuarios o no es un array");
        }
      } catch (error) {
        console.error("Error al obtener caja movimientos:", error);
      }
    };
    fetchCajaMovimientos();
  }, []);

  // --------------------------------------------------
  // Cargar Pedidos
  // --------------------------------------------------
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/Pedidos");
        if (!response.ok) {
          throw new Error(`Error al obtener pedidos. Status: ${response.status}`);
        }
        const data = await response.json();
        // Asumimos que 'data' es el array de pedidos
        setPedidos(data);
      } catch (error) {
        console.error("Error al obtener pedidos:", error);
      }
    };
    fetchPedidos();
  }, []);

  // --------------------------------------------------
  // Manejo del Modal (detalle de Pedido)
  // --------------------------------------------------
  const handleConsultar = (pedido) => {
    setSelectedPedido(pedido);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPedido(null);
  };

  // --------------------------------------------------
  // Renderizado
  // --------------------------------------------------
  return (
    <MainContainer>
      <Header />
      <h2>HOME</h2>

      {/* Sección superior con 2 tablas pequeñas */}
      <TopSection>
        {/* Tabla de Productos Disponibles */}
        <SmallTableContainer>
          <SubTittle stitle="Productos Disponibles" />
          <Table>
            <thead>
              <tr>
                <TableHeader>Producto</TableHeader>
                <TableHeader>Stock</TableHeader>
                <TableHeader>Costo/Kg</TableHeader>
              </tr>
            </thead>
            <tbody>
              {productosDisponibles.map((prod) => (
                <tr key={prod._id}>
                  <TableData>{prod.nombre}</TableData>
                  <TableData>{prod.stock} kg</TableData>
                  <TableData>${prod.precio}</TableData>
                </tr>
              ))}
            </tbody>
          </Table>
        </SmallTableContainer>

        {/* Tabla de Movimientos de Caja (últimos 2 movimientos) */}
        <SmallTableContainer>
          <SubTittle stitle="Movimientos de Caja" />
          <Table>
            <thead>
              <tr>
                <TableHeader>#Referencia</TableHeader>
                <TableHeader>Motivo</TableHeader>
                <TableHeader>Monto</TableHeader>
                <TableHeader>Fecha/Hora</TableHeader>
              </tr>
            </thead>
            <tbody>
              {movimientosCaja.map((mov) => (
                <tr key={mov.cajaId}>
                  <TableData>{mov.referencia}</TableData>
                  <TableData>{mov.motivo}</TableData>
                  <TableData>${mov.monto}</TableData>
                  <TableData>
                    {mov.fechaHora ? new Date(mov.fechaHora).toLocaleString() : ""}
                  </TableData>
                </tr>
              ))}
            </tbody>
          </Table>
        </SmallTableContainer>
      </TopSection>

      {/* Tabla grande de Pedidos */}
      <LargeTableContainer>
        <SubTittle stitle="Pedidos" />
        <Button variant="primary" size="large" style={{ margin: "10px 0" }} onClick={() => navigate('/gestion-pedidos')}>
          Generar Pedido
        </Button>
        <Table>
          <thead>
            <tr>
              <TableHeader># Pedido</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Productos</TableHeader>
              <TableHeader>Fecha y Hora</TableHeader>
              <TableHeader>Total</TableHeader>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p._id}>
                <TableData>{p.pedidoId}</TableData>
                <TableData>{p.estado}</TableData>
                <TableData>
                  <Button onClick={() => handleConsultar(p)}>
                    Consultar
                  </Button>
                </TableData>
                <TableData>
                  {p.fecha ? new Date(p.fecha).toLocaleString() : ""}
                </TableData>
                <TableData>${p.total}</TableData>
              </tr>
            ))}
          </tbody>
        </Table>
      </LargeTableContainer>

      {/* Modal para Detalles del Pedido */}
      {showModal && selectedPedido && (
        <ModalOverlay>
          <ModalContent>
            <h3>Detalles del Pedido</h3>
            <p><strong>Pedido ID:</strong> {selectedPedido.pedidoId}</p>
            <p><strong>Estado:</strong> {selectedPedido.estado}</p>
            <p>
              <strong>Fecha:</strong>{" "}
              {selectedPedido.fecha
                ? new Date(selectedPedido.fecha).toLocaleString()
                : "Sin fecha"}
            </p>
            <p><strong>Cliente:</strong> {selectedPedido.cliente}</p>
            <p>
              <strong>Dirección de Entrega:</strong> {selectedPedido.direccionEntrega}
            </p>
            <p><strong>Método de Pago:</strong> {selectedPedido.metodoPago}</p>
            <p><strong>Total:</strong> ${selectedPedido.total}</p>

            <h4>Productos en el Pedido</h4>
            {selectedPedido.productos && selectedPedido.productos.length > 0 ? (
              <ul>
                {selectedPedido.productos.map((prod, idx) => (
                  <li key={idx}>
                    <strong>{prod.nombre}</strong> (Cantidad: {prod.cantidad}, Precio Unit.: ${prod.precioUnitario})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay productos</p>
            )}

            <Button variant="secondary" onClick={handleCloseModal}>
              Cerrar
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </MainContainer>
  );
}

export default Home;
