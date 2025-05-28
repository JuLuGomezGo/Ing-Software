import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";

import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";
import ModalSolicitud from "../Componentes/ModalSolicitud";

import Button from "../Componentes/Button";
import SubTitulo from "../Componentes/SubTitle";
import { Table, Th, Td, Tr, Tbody, Thead, Tcontainer } from "../Componentes/Table";
import { TextBox, Label } from "../Componentes/TextComponent";
import DropBox from "../Componentes/DropBox";
import Icon from "../Componentes/Icon";

import addIcon from "../Componentes/Iconos/add.png";

const Container = styled.div`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
  max-width: 100vw;
  margin: 30px 100px;
  padding: 20px;
  background-color: #f9f4ee;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
`;

const ProductoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const FullWidth = styled.div`
  grid-column: span 2;

`;

const SolDetalles = styled.div`
  background-color:rgb(239, 215, 199);
  min-width: 400px;
  width: fit-content;

  padding: 10px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
`;

const GestionSolicitudes = () => {
  const [proveedores, setProveedores] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [formData, setFormData] = useState({ proveedor: "", productos: [] });
  const [productoTemp, setProductoTemp] = useState({ productoId: "", cantidad: 1, costoUnitario: 0 });
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);


  const API = "http://localhost:3000/api";

  useEffect(() => {
    fetchProveedores();
    fetchProductos();
    fetchSolicitudes();
  }, []);

  const fetchProveedores = async () => {
    const res = await fetch(`${API}/proveedores`);
    const data = await res.json();
    setProveedores(data.data || []);
  };

  const fetchProductos = async () => {
    const res = await fetch(`${API}/productos`);
    const data = await res.json();
    setProductosDisponibles(data.data || []);
  };

  const fetchSolicitudes = async () => {
    const res = await fetch(`${API}/solicitudes`);
    const data = await res.json();
    setSolicitudes(data.data || []);
  };

  const handleAgregarProducto = () => {
    if (
      (!productoTemp.productoId && !productoTemp.nombreTemporal) ||
      productoTemp.cantidad <= 0
    ) return;

    const nuevoProducto = {
      cantidad: productoTemp.cantidad,
      costoUnitario: productoTemp.costoUnitario,
      subtotal: productoTemp.cantidad * productoTemp.costoUnitario,
    };

    if (productoTemp.productoId === "nuevo") {
      nuevoProducto.nombreTemporal = productoTemp.nombreTemporal;
    } else {
      nuevoProducto.productoId = Number(productoTemp.productoId); // convertir explícitamente a número
    }

    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, nuevoProducto]
    }));

    // Reiniciar
    setProductoTemp({ productoId: "", nombreTemporal: "", cantidad: 1, costoUnitario: 0 });

  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const res = await fetch(`${API}/solicitudes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, usuarioSolicita: usuario?.usuarioId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Solicitud creada correctamente");
        fetchSolicitudes();
        setFormData({ proveedor: "", productos: [] });
      } else {
        toast.error("Error al crear solicitud");
        console.error(data);
      }
    } catch (error) {
      toast.error("Error en el servidor");
      console.error(error);
    }
  };


  const handleAbrirSolicitud = (sol) => {
    setSolicitudSeleccionada(sol);
    setShowModal(true);
  };

  const cambiarEstadoSolicitud = async (nuevoEstado) => {
    const res = await fetch(`http://localhost:3000/api/solicitudes/${solicitudSeleccionada.solicitudId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (res.ok) {
      toast.success("Estado actualizado");
      setShowModal(false);
      fetchSolicitudes(); // refrescar lista
    }
  };

  // Cancelar solicitud
  const cancelarSolicitud = async () => {
    const confirmar = confirm("¿Seguro que deseas cancelar esta solicitud?");
    if (!confirmar) return;

    const res = await fetch(`http://localhost:3000/api/solicitudes/${solicitudSeleccionada.solicitudId}`, {
      method: "DELETE"
    });
    if (res.ok) {
      toast.success("Solicitud cancelada");
      setShowModal(false);
      fetchSolicitudes();
    }
  };



  return (
    <MainContainer>
      <Header />
      <Container>
        <SubTitulo stitle="Gestión de Solicitudes" />
        <Form onSubmit={handleSubmit}>
          <DropBox value={formData.proveedor} onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })} required>
            <option value="">Seleccionar proveedor</option>
            {proveedores.map(prov => (
              <option key={prov.proveedorId} value={prov.proveedorId}>{prov.nombre}</option>
            ))}
          </DropBox>

          <ProductoRow>
            <DropBox
              value={productoTemp.productoId || "def"}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "nuevo") {
                  setProductoTemp({
                    productoId: "nuevo",
                    nombreTemporal: "",
                    cantidad: 1,
                    costoUnitario: 0
                  });
                } else if (value === "def") {
                  setProductoTemp({ productoId: "", cantidad: 1, costoUnitario: 0, nombreTemporal: "" });
                } else {
                  const producto = productosDisponibles.find(p => p.productoId.toString() === value);
                  const precioSugerido = producto ? (producto.precio * 0.8).toFixed(2) : 0;
                  setProductoTemp({
                    productoId: value,
                    nombreTemporal: "",
                    cantidad: 1,
                    costoUnitario: Number(precioSugerido)
                  });
                }
              }}
            >
              <option value="def">Seleccionar producto</option>
              <option value="nuevo">-- Producto nuevo --</option>
              {productosDisponibles.map(p => (
                <option key={p.productoId} value={p.productoId}>{p.nombre}</option>
              ))}
            </DropBox>


            {productoTemp.productoId === "nuevo" && (
              <TextBox
                placeholder="Nombre del nuevo producto"
                value={productoTemp.nombreTemporal}
                onChange={(e) => setProductoTemp({ ...productoTemp, nombreTemporal: e.target.value })}
              />
            )}

            <Label>
              Cantidad Kg:
            </Label>
            <TextBox type="number" step="0.01" value={productoTemp.cantidad} onChange={(e) => setProductoTemp({ ...productoTemp, cantidad: Number(e.target.value) })} />
            <Label>
              Costo Unitario: $
            </Label>
            <TextBox
              disabled={productoTemp.productoId !== "nuevo"}
              type="number"
              step="0.01"
              value={productoTemp.costoUnitario}
              onChange={(e) => setProductoTemp({ ...productoTemp, costoUnitario: Number(e.target.value) })} />

            <Button type="button" onClick={handleAgregarProducto}>Agregar</Button>
          </ProductoRow>

          <FullWidth>
            <ul>
              {formData.productos.map((p, i) => {
                const productoInfo = p.productoId
                  ? productosDisponibles.find(prod => prod.productoId.toString() === p.productoId.toString())
                  : null;
                return (

                  <SolDetalles>
                    <li key={i} style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      {`${productoInfo?.nombre || p.nombreTemporal || "Producto desconocido"} - ${p.cantidad}Kg - $${p.costoUnitario} c/u`}
                      <Button size="5px" onClick={() => {
                        setProductoTemp(p);
                        setFormData(prev => ({
                          ...prev,
                          productos: prev.productos.filter((_, index) => index !== i)
                        }));
                      }}><Icon src="./src/Componentes/Iconos/edit.png" /></Button>
                      <Button size="5px" onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          productos: prev.productos.filter((_, index) => index !== i)
                        }))
                      }><Icon src="./src/Componentes/Iconos/delete.png" /></Button>
                    </li>
                  </SolDetalles>
                );
              })}
            </ul>


          </FullWidth>

          <FullWidth>
            <Button type="submit"><Icon src={addIcon} />Generar Solicitud</Button>
          </FullWidth>
        </Form>

        <Table>
          <Thead>
            <Tr>
              <Th># Solicitud</Th>
              <Th>Proveedor</Th>
              <Th>Fecha</Th>
              <Th>Estado</Th>
              <Th>Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {[...solicitudes].reverse().map(s => (
              <Tr key={s.solicitudId} onClick={() => handleAbrirSolicitud(s)}>
                <Td>{s.solicitudId}</Td>
                <Td>{s.proveedor?.nombre}</Td>
                <Td>{new Date(s.fechaSolicitud).toLocaleDateString()}</Td>
                <Td>{s.estado}</Td>
                <Td>${s.total}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Container>
      {showModal && (
        <ModalSolicitud
          solicitud={solicitudSeleccionada}
          onClose={() => setShowModal(false)}
          onChangeEstado={cambiarEstadoSolicitud}
          onCancelar={cancelarSolicitud}
        />
      )}
    </MainContainer >
  );
};
export default GestionSolicitudes;
