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
import detallesIcon from "../Componentes/Iconos/details.png";
import IconMap from "../Componentes/Iconos/map.png"; // Ícono de Google Maps

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
const flujoEstados = {
  general: {
    Pendiente: ["En proceso"],
    "En proceso": ["Listo para entrega"],
    "Listo para entrega": ["Entregado"],
    Entregado: [],
  },
  repartidor: {
    "Listo para entrega": ["En camino"],
    "En camino": ["Entregado", "Listo para entrega"],
    Entregado: [],
  }
};

function getEstadosValidos(rol, estadoActual, esLocal) {
  //Si el pedido es de un local, el repartidor no puede cambiar el estado
  if (rol !== "Repartidor" && esLocal.toLowerCase() !== "local" && estadoActual === "Listo para entrega") {
    return [];
  }
  const flujo = rol === "Repartidor" ? flujoEstados.repartidor : flujoEstados.general;
  return flujo[estadoActual] || [];
}



// ---------- ESTILOS ----------
const Label = styled.label`
  font-weight: bold;
  color: #5d4037;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const MainLayout = styled.div`
  // align-items: center;
  justify-content: center;
  // padding-left: 0px;



  background-color: #f9f4ee;
  min-width: 100vw;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  padding: 0 10px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 0 16px;
    height: auto;
  }
  


`;

const SideSection = styled.div`
  border-radius: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  // justify-content: center;
  gap: 20px;
  padding: 20px 0;
  
`;

const TableContainer = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: #f9f4ee;
  width: 90%;
  height: 90%;

    @media (max-width: 768px) {
    padding: 10px;
  }
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
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 20px 10px 10px 20px;
  padding;: 20px;

  /* Scrollbar personalizado (WebKit) */
  &::-webkit-scrollbar {
    width: 8px;
  }

  // &::-webkit-scrollbar-track {
  //   background: #f1f1f1;
  //   border-radius: 4px;
  // }

  &::-webkit-scrollbar-thumb {
    background:rgb(189, 165, 147);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }

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
  transition: 0.2s;
  &:hover {
    transform: scale(1.02);
    background-color: #f2f2f2;

  }
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

    @media (max-width: 768px) {
    padding: 10px;
  }
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

    @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;
// -----------------------------

function Home() {

  const usuarioLogueado = localStorage.getItem("usuario");
  const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;
  const rolUsuario = usuario?.rol;

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

    const fetchPedidos = () => {
      fetch("http://localhost:3000/api/Pedidos")
        .then(res => res.json())
        .then(setPedidos);
    };
    fetchPedidos();
    const interval = setInterval(() => {
      fetchPedidos();
    }, 5000); // cada 10 segundos

    // Limpieza del intervalo al desmontar
    return () => clearInterval(interval);

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

      <MainLayout>
        <TableContainer>
          <SubTittle stitle="Pedidos" ancho="completo" icono={nuevoPedido}
            setButton={rolUsuario !== "Repartidor" ? true : false} btnIcon={vermasIcon} buttonText="Ver mas>"
            onClick={() => navigate("/gestion-pedidos")}
          />

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
                {[...pedidos]
                  .filter((pedido) => {

                    if (rolUsuario === "Repartidor") {
                      const direccion = (pedido.direccionEntrega || "").toLowerCase().trim();
                      if (direccion === "local" || direccion.length <= 3) return false;

                      const estado = (pedido.estado || "")
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "");
                      if (!["en camino", "listo para entrega"].includes(estado)) return false;
                    }

                    return true;
                  })
                  .reverse()
                  .map((pedido) => (
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
        {rolUsuario !== "Repartidor" && (
          <>
            <SideSection >
              <TableContainer >
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
                    <Tbody>
                      {productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((prod) => (
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

              <TableContainer>
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
          </>
        )}
      </MainLayout>

      {showModal && selectedPedido && (



        <ModalOverlay>
          {showModal && rolUsuario === "Repartidor" ? (
            <>
              <ModalContent>
                <SubTittle stitle="Detalles del Pedido" ancho="completo" icono={detallesIcon} >Detalles del Pedido</SubTittle>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <p><strong>No. Pedido:</strong> {selectedPedido.pedidoId}</p>
                  <p><strong>Entregar:</strong> {new Date(selectedPedido.fecha).toLocaleString('es-MX', {
                    dateStyle: 'medium'
                  })}</p>
                </div>
                <p><strong>Estado:</strong> {selectedPedido.estado}</p>
                <p><strong>Dirección:</strong> {selectedPedido.direccionEntrega}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      selectedPedido.direccion
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={IconMap} alt="Abrir en Google Maps" className="map-icon" />
                  </a>
                </p>
                <p><strong>Cliente:</strong> {selectedPedido.cliente}</p>
                <SubTittle stitle="Productos" Icon icono={productoIcon} />
                <Tcontainer>
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Producto</Th>
                        <Th>Cantidad (Kg)</Th>
                        <Th>Costo/Kg</Th>
                        <Th>Subtotal</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedPedido.productos?.sort((a, b) => a.producto?.nombre.localeCompare(b.producto?.nombre)).map((p, i) => (
                        <Tr key={i}>
                          <Td>{p.nombre || "—"}</Td>
                          <Td>{p.cantidad} Kg</Td>
                          <Td>${p.precioUnitario}</Td>
                          <Td>${p.cantidad * p.precioUnitario}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                    <Tr>
                      <Td colSpan="3" style={{ textAlign: "right", fontWeight: "bold" }}>Total:</Td>
                      <Td>${selectedPedido.total}</Td>
                    </Tr>
                  </Table>
                </Tcontainer>

                <Botonera>
                  <Button onClick={() => setShowEstadoModal(true)}>Cambiar Estado</Button>
                  <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>
                </Botonera>
              </ModalContent>
            </>
          ) : (
            <>

              <ModalContent>
                <SubTittle stitle="Detalles del Pedido" ancho="completo" icono={detallesIcon} >Detalles del Pedido</SubTittle>
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
            </>
          )}
        </ModalOverlay>
      )}


      {showEstadoModal && (
        <ModalOverlay>
          <ModalContent>
            <SubTittle stitle="Cambiar Estado del Pedido" />

            <EstadoBox disabled style={{ opacity: "0.5", backgroundColor: "rgb(231, 202, 135)" }}>
              <img src={estadoIconos[selectedPedido.estado]} alt={selectedPedido.estado} width="20" height="20" />
              {selectedPedido.estado}
            </EstadoBox>

            {getEstadosValidos(rolUsuario, selectedPedido.estado, selectedPedido.cliente).map((estado) => (
              <EstadoBox key={estado} onClick={() => updateEstado(estado)}>
                <img src={estadoIconos[estado]} alt={estado} width="20" height="20" />
                {estado}
              </EstadoBox>
            ))}
            <Button variant="secondary" onClick={() => {
              setShowEstadoModal(false);
              setShowModal(true);
            }}>
              Cancelar
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </MainContainer>
  );
}

export default Home;
