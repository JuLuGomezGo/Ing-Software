import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";
import SubTittle from "../Componentes/SubTitle";
import Button from "../Componentes/Button";
import { Table, Td, Th, Tr, Tbody, Thead, Tcontainer } from "../Componentes/Table";
import EstadoVisual from "../Componentes/EstadoVisual";
import productoIcon from "../Componentes/Iconos/productoIcon.png";
import vermasIcon from "../Componentes/Iconos/details.png";
import pricelcon from "../Componentes/Iconos/priceIcon.png";
import nuevoPedido from "../Componentes/Iconos/nuevoPedido.png";
import iconSearch from "../Componentes/Iconos/buscar.png";

import iconPendiente from "../Componentes/Iconos/pendienteColor.png";
import iconEnProceso from "../Componentes/Iconos/preparandoColor.png";
import iconListo from "../Componentes/Iconos/listoColor.png";
import iconEnCamino from "../Componentes/Iconos/repartoColor.png";
import iconEntregado from "../Componentes/Iconos/entregadoColor.png";
import iconPagado from "../Componentes/Iconos/nopagadoColor.png";

const estadoIconos = {
  Pendiente: iconPendiente,
  "En proceso": iconEnProceso,
  "Listo para entrega": iconListo,
  "En camino": iconEnCamino,
  Entregado: iconEntregado,
  Pagado: iconPagado,
};

// ---------- ESTILOS ----------

const MainLayout = styled.div`
  background-color: #f9f4ee;
  minwidth: 100vw;
  minheight: 120vh;
  display: grid;
  align-items: center;
  justify-content: center;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  padding-left: 0px;



`;

const SideSection = styled.div`
  border-radius: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
  
`;

const TableContainer = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: #f9f4ee;
  width: 90%;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  width: 400px;
  border-radius: 10px;
`;

const EstadoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 8px;
`;

const Botonera = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #444;
  border-radius: 10px;
  padding: 4px 10px;
  margin-bottom: 10px;
`;

const SearchIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 1rem;
  flex: 1;
`;
// -----------------------------

function Home() {
  const navigate = useNavigate();
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [filtroProducto, setFiltroProducto] = useState("");
  const [movimientosCaja, setMovimientosCaja] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/productos")
      .then(res => res.json())
      .then(res => res.success && setProductosDisponibles(res.data));

    fetch("http://localhost:3000/api/usuarios")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          const movimientos = res.data.flatMap(u => u.caja || []);
          movimientos.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
          setMovimientosCaja(movimientos.slice(0, 2));
        }
      });

    fetch("http://localhost:3000/api/Pedidos")
      .then(res => res.json())
      .then(setPedidos);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPedido(null);
  };

  const updateEstado = async (nuevoEstado) => {
    if (!selectedPedido) return;
    try {
      const response = await fetch(`http://localhost:3000/api/pedidos/${selectedPedido.pedidoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (response.ok) {
        const updated = { ...selectedPedido, estado: nuevoEstado };
        setSelectedPedido(updated);
        setPedidos(prev => prev.map(p => p.pedidoId === updated.pedidoId ? updated : p));
        setShowEstadoModal(false);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  const productosFiltrados = productosDisponibles.filter(p =>
    p.nombre.toLowerCase().includes(filtroProducto.toLowerCase())
  );

  return (
    <MainContainer>
      <Header />
        <h2>HOME</h2>

      <MainLayout>
        <TableContainer>
          <SubTittle stitle="Pedidos" ancho="completo" icono={nuevoPedido} setButton={true} btnIcon={vermasIcon} buttonText="Ver mas>" onClick={() => navigate("/gestion-pedidos")} />
          <Tcontainer $scroll={pedidos.length > 7} $rows={7}>
            <Table>
              <Thead>
                <Tr>
                  <Th># Pedido</Th>
                  <Th>Cliente</Th>
                  <Th>Estado</Th>
                  <Th>Total</Th>
                  <Th>Fecha</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pedidos.map((pedido) => (
                  <Tr key={pedido.pedidoId}
                    onClick={() => {
                      setSelectedPedido(pedido);
                      setShowModal(true);
                    }}>
                    <Td>{pedido.pedidoId}</Td>
                    <Td>{pedido.cliente}</Td>
                    <EstadoVisual estado={pedido.estado} />
                    <Td>${pedido.total?.toFixed(2)}</Td>
                    <Td>{new Date(pedido.fecha).toLocaleDateString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Tcontainer>
        </TableContainer>

        <SideSection >
          <TableContainer style={{ height: "350px" }}>
            <SubTittle
              stitle="Productos Disponibles"
              ancho="completo"
              icono={productoIcon}
              setButton={true}
              btnIcon={vermasIcon}
              buttonText="Ver mas>"
              onClick={() => navigate("/Inventario")}
            />

            <SearchBarContainer>
              <SearchIcon src={iconSearch} alt="Buscar" />
              <SearchInput
                type="text"
                placeholder="Buscar producto..."
                value={filtroProducto}
                onChange={(e) => setFiltroProducto(e.target.value)}
              />
            </SearchBarContainer>


            <Tcontainer $scroll={productosFiltrados.length > 4} $rows={4}>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Producto</Th>
                    <Th>Stock</Th>
                    <Th>Costo/Kg</Th>
                  </Tr>
                </Thead>
                <Tbody $scroll={productosFiltrados.length > 4} $rows={4}>
                  {productosFiltrados.map((prod) => (
                    <Tr key={prod._id} $scroll={productosFiltrados.length > 5}>
                      <Td>{prod.nombre}</Td>
                      <Td>{prod.stock} kg</Td>
                      <Td>${prod.precio}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Tcontainer>

          </TableContainer>

          <TableContainer style={{ height: "300px" }}>
            <SubTittle stitle="Movimientos de Caja"
              ancho="completo"
              icono={pricelcon}
              setButton={true}
              btnIcon={vermasIcon}
              buttonText="Ver mas>"
              onClick={() => navigate("/Caja")} />

            <Tcontainer $scroll={movimientosCaja.length > 3} $rows={3}>
              <Table>
                <Thead>
                  <Tr>
                    <Th>#Referencia</Th>
                    <Th>Motivo</Th>
                    <Th>Monto</Th>
                    <Th>Fecha/Hora</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {movimientosCaja.map((mov) => (
                    <Tr key={mov.cajaId} $scroll={movimientosCaja.length > 1}>
                      <Td>{mov.referencia}</Td>
                      <Td>{mov.motivo}</Td>
                      <Td>${mov.monto}</Td>
                      <Td>{new Date(mov.fechaHora).toLocaleString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Tcontainer>

          </TableContainer>
        </SideSection>
      </MainLayout>

      {showModal && selectedPedido && (
        <ModalOverlay>
          <ModalContent>
            <h3>Detalles del Pedido</h3>
            <p><strong>Pedido ID:</strong> {selectedPedido.pedidoId}</p>
            <p><strong>Estado:</strong> {selectedPedido.estado}</p>
            <p><strong>Fecha:</strong> {new Date(selectedPedido.fecha).toLocaleString()}</p>
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
            <Botonera>
              <Button onClick={() => setShowEstadoModal(true)}>Cambiar Estado</Button>
              <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>
            </Botonera>
          </ModalContent>
        </ModalOverlay>
      )}

      {showEstadoModal && (
        <ModalOverlay>
          <ModalContent>
            <h3>Selecciona nuevo estado</h3>
            {Object.entries(estadoIconos).map(([estado, icon]) => (
              <EstadoBox key={estado} onClick={() => updateEstado(estado)}>
                <img src={icon} alt={estado} width="20" height="20" />
                {estado}
              </EstadoBox>
            ))}
            <Button variant="secondary" onClick={() => {
              setShowEstadoModal(false);
              setShowModal(true);
            }}>
              Detalles del Pedido
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </MainContainer>
  );
}

export default Home;
