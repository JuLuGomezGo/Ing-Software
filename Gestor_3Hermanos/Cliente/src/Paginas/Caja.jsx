// @ts-nocheck
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";
import Button from "../Componentes/Button";
import { Table, Th, Td } from "../Componentes/Table";
import DropBox from "../Componentes/DropBox";
import { TextBox } from "../Componentes/TextComponent";
import { DateBox, TimeBox } from "../Componentes/Date-TimePicker";
import { jsPDF } from "jspdf";

/* ---------- Estilos extra ---------- */
const Sidebar = styled.div`
  position: fixed;
  top: 125px;
  right: ${(p) => (p.isOpen ? "0" : "-600px")};
  width: 300px;
  height: 100%;
  background: #f9f4ee;
  border-left: 2px solid #b3815d;
  padding: 1rem;
  transition: 0.3s ease;
  z-index: 1000;
`;
const SidebarButton = styled(Button)`
  top: 160px;
  right: 410px;
  z-index: 1001;
  background: #b3815d;
  color: #fff;
`;
const Container = styled.div`
  border: 2px solid #b3815d;
  padding: 0.5rem;
  border-radius: 20px;
  background: #f9f4ee;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: fit-content;
`;
const Label = styled.label`
  font-weight: bold;
  color: #5d4037;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const Cont_lbl = styled.div`
  display: flex;
  flex-direction: column;
`;
const Cont_inputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
/* --- contenedor colapsable para detalles de pedido --- */
const DetallesWrapper = styled.div`
  max-height: ${(p) => (p.open ? "300px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;
const ToggleArrow = styled.button`
  align-self: flex-end;
  background: transparent;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
`;

/* ================================================================================= */

const Caja = () => {
  /* ------- estados ------- */
  const [movimientosCaja, setMovimientosCaja] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [detallesPedido, setDetallesPedido] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);

  const [formData, setFormData] = useState({
    pedidoId: "",
    amount: "",
    reason: "",
    reference: "",
    nombreProveedorCliente: "",
    producto: "",
    date: "",
    time: "",
  });

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ------- fecha/hora actual -------- */
  useEffect(() => {
    const now = new Date();
    const d = now.toISOString().split("T")[0];
    const t = now.toTimeString().slice(0, 5);
    setDate(d);
    setTime(t);
    setFormData((p) => ({ ...p, date: d, time: t }));
    setFechaInicio(d);
    setFechaFin(d);
  }, []);

  /* ------- pedidos pendientes para el combo ------- */
  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/pedidos");
        const data = await res.json();
        const pendientes = data.filter((p) => p.estado === "Pendiente");
        setPendingOrders(pendientes);
      } catch (e) {
        console.error("No se pudo traer pedidos pendientes", e);
      }
    };
    fetchPendientes();
  }, []);

  /* ------- obtención de toda la caja (tabla inferior) ------- */
  useEffect(() => {
    const fetchCajaMovimientos = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/usuarios");
        const result = await res.json();
        if (result.success) {
          const all = result.data.flatMap((u) =>
            u.caja?.map((m) => ({ ...m, usuario: u.nombre })) || []
          );
          all.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
          setMovimientosCaja(all);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCajaMovimientos();
  }, []);

  /* ---------- handlers ---------- */
  const obtenerDatosPedido = async () => {
    const id = formData.pedidoId;
    if (!id) return alert("Selecciona un pedido pendiente.");

    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/caja/${id}`);
      if (!res.ok) throw new Error();
      const mov = await res.json();

      setFormData((p) => ({
        ...p,
        amount: mov.monto || "",
        reason: mov.motivo || "",
        reference: id,
        nombreProveedorCliente: mov.nombreProveedorCliente || "",
        producto: mov.producto || "",
      }));

      setDetallesPedido(mov);
      setShowDetalles(true);
    } catch (e) {
      alert("No se pudo obtener el pedido");
    }
  };

  const handleRegister = async () => {
    const { amount, reference, reason, nombreProveedorCliente, producto, pedidoId } =
      formData;
    if (!amount || !reference || !reason || !nombreProveedorCliente || !producto)
      return alert("Completa todos los campos.");

    /* usuario logueado */
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const idUsuario = usuario?.usuarioId;
    if (!idUsuario) return alert("Inicia sesión de nuevo.");

    const newMovement = {
      monto: parseFloat(amount),
      referencia: reference,
      motivo: reason,
      nombreProveedorCliente,
      producto,
      fechaHora: new Date(`${formData.date}T${formData.time}`),
    };

    try {
      /* registrar movimiento en caja */
      const res = await fetch(
        `http://localhost:3000/api/usuarios/${idUsuario}/caja`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMovement),
        }
      );
      if (!res.ok) throw new Error();
      const { data: nuevoMovimiento } = await res.json();
      setMovimientosCaja((m) => [...m, { ...nuevoMovimiento, usuario: usuario.nombre }]);

      /* marcar pedido como Pagado */
      await fetch(`http://localhost:3000/api/pedidos/${pedidoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Pagado" }),
      });

      /* feedback visual */
      alert("✅ Pedido Pagado");
      /* quitarlo del combo */
      setPendingOrders((prev) => prev.filter((p) => p.pedidoId !== pedidoId));

      /* limpiar */
      setFormData((p) => ({
        ...p,
        pedidoId: "",
        amount: "",
        reason: "",
        reference: "",
        nombreProveedorCliente: "",
        producto: "",
      }));
      setDetallesPedido(null);
      setShowDetalles(false);
    } catch (e) {
      console.error(e);
      alert("Error al registrar movimiento.");
    }
  };

  const generarPDF = () => {
    /* … tu código existente sin cambios … */
  };

  /* ---------- render ---------- */
  return (
    <MainContainer>
      <Header />
      <Container>
        {/* filtro lateral */}
        <SidebarButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          ☰ Filtrar Rango
        </SidebarButton>
        <Sidebar isOpen={isSidebarOpen}>
          <Cont_lbl>
            <Label>
              📅 Fecha: <DateBox value={date} readOnly />
            </Label>
            <Label>
              ⏰ Hora: <TimeBox value={time} readOnly />
            </Label>
            <Label>
              📆 Desde:{" "}
              <DateBox value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </Label>
            <Label>
              📆 Hasta:{" "}
              <DateBox value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </Label>
            <Button onClick={generarPDF}>📄 Exportar PDF por Rango</Button>
          </Cont_lbl>
        </Sidebar>

        {/* formulario */}
        <Cont_inputs>
          <Label>
            Pedido pendiente:
            <DropBox
              name="pedidoId"
              value={formData.pedidoId}
              onChange={(e) =>
                setFormData((p) => ({ ...p, pedidoId: e.target.value, reference: e.target.value }))
              }
            >
              <option value="">Seleccionar…</option>
              {pendingOrders.map((p) => (
                <option key={p.pedidoId} value={p.pedidoId}>
                  {p.pedidoId} – {p.cliente}
                </option>
              ))}
            </DropBox>
            <Button onClick={obtenerDatosPedido}>🔍 Obtener datos</Button>
          </Label>

        </Cont_inputs>

        <Button variant="primary" onClick={handleRegister}>
          💾 Registrar Movimiento
        </Button>

        {/* detalles de pedido -------------------------- */}
        <ToggleArrow onClick={() => setShowDetalles((s) => !s)}>
          {showDetalles ? "▲" : "▼"}
        </ToggleArrow>
        <DetallesWrapper open={showDetalles}>
          {detallesPedido && (
            <Table>
              <thead>
                <tr>
                  <Th>ID PEDIDO</Th>
                  <Th>PRODUCTO</Th>
                  <Th>NOMBRE</Th>
                  <Th>MOTIVO</Th>
                  <Th>TOTAL</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td>{formData.pedidoId}</Td>
                  <Td>{detallesPedido.producto}</Td>
                  <Td>{detallesPedido.nombreProveedorCliente}</Td>
                  <Td>{detallesPedido.motivo}</Td>
                  <Td>${detallesPedido.monto?.toFixed(2)}</Td>
                </tr>
              </tbody>
            </Table>
          )}
        </DetallesWrapper>

        {/* movimientos de caja (tabla principal) */}
        <Table>
          <thead>
            <tr>
              <Th>Usuario</Th>
              <Th>ID</Th>
              <Th>Motivo</Th>
              <Th>Cliente / Proveedor</Th>
              <Th>Producto</Th>
              <Th>Monto</Th>
              <Th>Fecha/Hora</Th>
            </tr>
          </thead>
          <tbody>
            {movimientosCaja.map((mov, i) => (
              <tr key={i}>
                <Td>{mov.usuario}</Td>
                <Td>{mov.referencia}</Td>
                <Td>{mov.motivo}</Td>
                <Td>{mov.nombreProveedorCliente}</Td>
                <Td>{mov.producto}</Td>
                <Td>${mov.monto.toFixed(2)}</Td>
                <Td>{new Date(mov.fechaHora).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </MainContainer>
  );
};

export default Caja;
