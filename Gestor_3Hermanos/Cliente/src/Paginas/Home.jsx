import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import styled from "styled-components";

import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";
import SubTittle from "../Componentes/SubTitle";
import Button from "../Componentes/Button";
import { Table, Td, Th, Tr } from "../Componentes/Table";
import EstadoVisual from "../Componentes/EstadoVisual";
import productoIcon from "../Componentes/Iconos/productoIcon.png";
import vermasIcon from "../Componentes/Iconos/details.png";
import pricelcon from "../Componentes/Iconos/priceIcon.png";
import nuevoPedido from "../Componentes/Iconos/nuevoPedido.png";

// --------------------- ESTILOS ---------------------
const TopSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const SmallTableContainer = styled.div`
  flex: 1;
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9f4ee;
`;

const LargeTableContainer = styled.div`
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9f4ee;
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

const StyledInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;
// --------------------------------------------------

function Home() {
  const navigate = useNavigate();

  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [movimientosCaja, setMovimientosCaja] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  // Productos
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

  // Movimientos de Caja
  useEffect(() => {
    const fetchCajaMovimientos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/usuarios");
        if (!response.ok) throw new Error(`Error al obtener usuarios. Status: ${response.status}`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const allMovimientos = result.data.reduce((acc, usuario) => {
            if (usuario.caja && Array.isArray(usuario.caja)) {
              return acc.concat(usuario.caja);
            }
            return acc;
          }, []);
          allMovimientos.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
          setMovimientosCaja(allMovimientos.slice(0, 2));
        }
      } catch (error) {
        console.error("Error al obtener caja movimientos:", error);
      }
    };
    fetchCajaMovimientos();
  }, []);

  // Pedidos
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/Pedidos");
        if (!response.ok) throw new Error(`Error al obtener pedidos. Status: ${response.status}`);
        const data = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error al obtener pedidos:", error);
      }
    };
    fetchPedidos();
  }, []);

  const handleConsultar = (pedido) => {
    setSelectedPedido(pedido);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPedido(null);
  };

  const productosFiltrados = productosDisponibles.filter((prod) =>
    prod.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainContainer>
      <Header />
      <h2>HOME</h2>

      <TopSection>
        {/* Productos Disponibles */}
        <SmallTableContainer>
          <SubTittle 
            stitle="Productos Disponibles"
            ancho="Completo"
            icono={productoIcon}
            setButton={true}
            btnIcon={vermasIcon}
            buttonText={"Ver más >"}
            onClick={() => navigate('/Inventario')}
          />

          {/* Barra de búsqueda funcional */}
          <StyledInput
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Table>
            <thead>
              <Tr>
                <Th>Producto</Th>
                <Th>Stock</Th>
                <Th>Costo/Kg</Th>
              </Tr>
            </thead>
            <tbody>
              {productosFiltrados.map((prod) => (
                <Tr key={prod._id}>
                  <Td>{prod.nombre}</Td>
                  <Td>{prod.stock} kg</Td>
                  <Td>${prod.precio}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </SmallTableContainer>

        {/* Movimientos de Caja */}
        <SmallTableContainer>
          <SubTittle 
            stitle="Movimientos de Caja"
            ancho="Completo"
            icono={pricelcon}
            setButton={true}
            btnIcon={vermasIcon}
            buttonText={"Ver más >"}
            onClick={() => navigate('/Caja')}
          />
          <Table>
            <thead>
              <Tr>
                <Th>#Referencia</Th>
                <Th>Motivo</Th>
                <Th>Monto</Th>
                <Th>Fecha/Hora</Th>
              </Tr>
            </thead>
            <tbody>
              {movimientosCaja.map((mov) => (
                <Tr key={mov.cajaId}>
                  <Td>{mov.referencia}</Td>
                  <Td>{mov.motivo}</Td>
                  <Td>${mov.monto}</Td>
                  <Td>{mov.fechaHora ? new Date(mov.fechaHora).toLocaleString() : ""}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </SmallTableContainer>
      </TopSection>

      {/* Pedidos */}
      <LargeTableContainer>
        <SubTittle 
          stitle="Pedidos"
          ancho="Completo"
          icono={nuevoPedido}
          setButton={true}
          btnIcon={vermasIcon}
          buttonText={"Ver más >"}
          onClick={() => navigate('/gestion-pedidos')}
        />
        <Table>
          <thead>
            <Tr>
              <Th># Pedido</Th>
              <Th>Cliente</Th>
              <Th>Estado</Th>
              <Th>Total</Th>
              <Th>Fecha</Th>
            </Tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <Tr 
                key={pedido.pedidoId}
                onClick={() => setSelectedPedido(pedido)}
                className={selectedPedido?.pedidoId === pedido.pedidoId ? "selected" : ""}
              >
                <Td>{pedido.pedidoId}</Td>
                <Td>{pedido.cliente}</Td>
                <EstadoVisual estado={pedido.estado} />
                <Td>${pedido.total?.toFixed(2)}</Td>
                <Td>{new Date(pedido.fecha).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </LargeTableContainer>

      {/* Modal Detalle Pedido */}
      {showModal && selectedPedido && (
        <ModalOverlay>
          <ModalContent>
            <h3>Detalles del Pedido</h3>
            <p><strong>Pedido ID:</strong> {selectedPedido.pedidoId}</p>
            <p><strong>Estado:</strong> {selectedPedido.estado}</p>
            <p><strong>Fecha:</strong> {selectedPedido.fecha ? new Date(selectedPedido.fecha).toLocaleString() : "Sin fecha"}</p>
            <p><strong>Cliente:</strong> {selectedPedido.cliente}</p>
            <p><strong>Dirección de Entrega:</strong> {selectedPedido.direccionEntrega}</p>
            <p><strong>Método de Pago:</strong> {selectedPedido.metodoPago}</p>
            <p><strong>Total:</strong> ${selectedPedido.total}</p>

            <h4>Productos en el Pedido</h4>
            {selectedPedido.productos?.length > 0 ? (
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

            <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </MainContainer>
  );
}

export default Home;