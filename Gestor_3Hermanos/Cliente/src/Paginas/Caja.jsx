// @ts-nocheck
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";
import Button from "../Componentes/Button";
import { Table, Th, Td, Tr, Tbody, Thead, Tcontainer } from "../Componentes/Table";
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
const StaticTable = styled.div`
  position: sticky;
  top: 0;
  background-color: #f9f4ee;
  z-index: 10;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

/* ================================================================================= */

const Caja = () => {
  // Separar estados para pedidos y solicitudes
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [movimientosCaja, setMovimientosCaja] = useState([]);
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
    // Pedidos pendientes
    const fetchPedidosPendientes = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/pedidos");
        const result = await res.json();
        setPedidosPendientes(result.filter(p => p.estado === "Entregado"));
      } catch (e) {
        console.error("Error al obtener pedidos pendientes:", e);
      }
    };

    const fetchSolicitudesPendientes = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/solicitudes?estado=Recibido");
        const { data } = await res.json();
        setSolicitudesPendientes(data || []);
      } catch (e) {
        console.error("Error al obtener solicitudes pendientes:", e);
      }
    };

    fetchPedidosPendientes();
    fetchSolicitudesPendientes();
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
    if (!id) return alert("Selecciona un pedido o solicitud.");

    try {
      if (id.startsWith("pedido-")) {
        // Es un pedido de cliente
        const pedidoId = id.replace("pedido-", "");
        const res = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}`);
        if (!res.ok) throw new Error("Error al obtener pedido");
        const pedido = await res.json(); // Pedidos devuelve directamente el objeto

        setFormData((p) => ({
          ...p,
          amount: pedido.total || "",
          reason: "Cobro Pedido",
          reference: pedidoId,
          nombreProveedorCliente: pedido.cliente || "",
          producto: pedido.productos
            ? pedido.productos.map(prod => `${prod.nombre} (${prod.cantidad})`).join(", ")
            : "",
        }));

        setDetallesPedido({
          ...pedido,
          monto: pedido.total,
          motivo: "Cobro Pedido",
          nombreProveedorCliente: pedido.cliente || "",
          producto: pedido.productos
            ? pedido.productos.map(prod => `${prod.nombre} (${prod.cantidad})`).join(", ")
            : "",
        });
        setShowDetalles(true);
      } else if (id.startsWith("solicitud-")) {
        // Es una solicitud a proveedor
        const solicitudId = Number(id.replace("solicitud-", ""));
        const res = await fetch(`http://localhost:3000/api/solicitudes/${solicitudId}`);
        if (!res.ok) throw new Error();
        const { data: solicitud } = await res.json();

        setFormData((p) => ({
          ...p,
          amount: solicitud.total || "",
          reason: "Pago a Proveedor",
          reference: solicitudId,
          nombreProveedorCliente: solicitud.proveedor?.nombre || "",
          producto: solicitud.productos
            ? solicitud.productos.map(prod => prod.nombreTemporal || prod.productoId).join(", ")
            : "",
        }));

        setDetallesPedido({
          ...solicitud,
          monto: solicitud.total,
          motivo: "Pago a Proveedor",
          nombreProveedorCliente: solicitud.proveedor?.nombre || "",
          producto: solicitud.productos
            ? solicitud.productos.map(prod => prod.nombreTemporal || prod.productoId).join(", ")
            : "",
        });
        setShowDetalles(true);
      } else {
        alert("ID no válido.");
      }
    } catch (e) {
      alert("No se pudo obtener el pedido o solicitud");
    }
  };

  const handleRegister = async () => {
    const { amount, reference, reason, nombreProveedorCliente, producto, pedidoId } = formData;
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

      // Detectar si es pedido o solicitud
      if (pedidoId.startsWith("pedido-")) {
        const id = pedidoId.replace("pedido-", "");
        await fetch(`http://localhost:3000/api/pedidos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "Pagado" }),
        });
        setPedidosPendientes((prev) => prev.filter((p) => p.pedidoId !== Number(id)));
        alert("✅ Pedido Pagado");
      } else if (pedidoId.startsWith("solicitud-")) {
        const id = pedidoId.replace("solicitud-", "");
        await fetch(`http://localhost:3000/api/solicitudes/${id}/estado`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "Pagado" }),
        });
        setSolicitudesPendientes((prev) => prev.filter((s) => s.solicitudId !== Number(id)));
        alert("✅ Solicitud Pagada");
      }

      // Limpiar formulario
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
    const doc = new jsPDF();
    // Filtra los movimientos que estén dentro del rango de fechas seleccionadas
    const movimientosFiltrados = movimientosCaja.filter(mov => {
      const fecha = new Date(mov.fechaHora).toISOString().split("T")[0];
      return fecha >= fechaInicio && fecha <= fechaFin;  // Filtra por las fechas de corte
    });
    doc.setFontSize(18).setFont("helvetica", "bold");
    doc.text("Soporte Financiero Mensual", 105, 20, null, null, "center");
    doc.setFontSize(12).setFont("helvetica", "normal");
    doc.text(`Desde: ${fechaInicio}    Hasta: ${fechaFin}`, 105, 30, null, null, "center");
    let y = 45;
    let totalEntradas = 0, totalSalidas = 0;
    // Recorre los movimientos filtrados y genera el contenido del PDF
    movimientosFiltrados.forEach((mov) => {
      const tipo = mov.motivo === "Cobro Pedido" ? "📥 Entrada" : "📤 Salida";
      if (mov.motivo === "Cobro Pedido") totalEntradas += mov.monto;
      else totalSalidas += mov.monto;
      doc.setDrawColor(180).setLineWidth(0.1).line(14, y - 4, 195, y - 4);
      doc.setFont("helvetica", "bold").text(tipo, 105, y, null, null, "center");
      doc.setFont("helvetica", "normal");
      y += 6;
      doc.text(`Usuario: ${mov.usuario}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Referencia: ${mov.referencia}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Motivo: ${mov.motivo}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Nombre: ${mov.nombreProveedorCliente}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Producto: ${mov.producto}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Total: $${mov.monto.toFixed(2)}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Fecha: ${new Date(mov.fechaHora).toLocaleString()}`, 105, y, null, null, "center");
      y += 12;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });
    doc.line(14, y - 4, 195, y - 4);
    const balance = totalEntradas - totalSalidas;
    y += 10;
    doc.setFont("helvetica", "bold").text("Resumen Financiero:", 105, y, null, null, "center");
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Total Entradas (📥): $${totalEntradas.toFixed(2)}`, 105, y, null, null, "center");
    y += 8;
    doc.text(`Total Salidas (📤): $${totalSalidas.toFixed(2)}`, 105, y, null, null, "center");
    y += 8;
    doc.text(`Balance: $${balance.toFixed(2)}`, 105, y, null, null, "center");
    doc.save(`Reporte_${fechaInicio}_al_${fechaFin}.pdf`);
  };

  /* ---------- render ---------- */
   return (
    <MainContainer>
      <Header />
      <Container>
        <SidebarButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          ☰ Corte de Caja
        </SidebarButton>
        <Sidebar isOpen={isSidebarOpen}>
          <Cont_lbl>
            <Label>📅 Fecha actual: <DateBox value={date} readOnly /></Label>
            <Label>⏰ Hora actual: <TimeBox value={time} readOnly /></Label>
            <Label>📆 Reporte del: <DateBox value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></Label>
            <Label>📆 al: <DateBox value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></Label>
            <Button onClick={generarPDF}>📄 Generar reporte</Button>
          </Cont_lbl>
        </Sidebar>

        <Cont_inputs>
          <Label>
            Pedido/Solicitud pendiente:
            <DropBox
              name="pedidoId"
              value={formData.pedidoId}
              onChange={e => setFormData(p => ({ ...p, pedidoId: e.target.value }))}
            >
              <option value="">Seleccionar…</option>
              <optgroup label="Pedidos de clientes">
                {pedidosPendientes.map(p => (
                  <option key={`pedido-${p.pedidoId}`} value={`pedido-${p.pedidoId}`}>
                    Pedido {p.pedidoId} – {p.cliente}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Solicitudes a proveedor">
                {solicitudesPendientes.map(s => (
                  <option key={`solicitud-${s.solicitudId}`} value={`solicitud-${s.solicitudId}`}>
                    Solicitud {s.solicitudId} – {s.proveedor?.nombre}
                  </option>
                ))}
              </optgroup>
            </DropBox>
            <Button onClick={obtenerDatosPedido}>🔍 Obtener datos</Button>
          </Label>
        </Cont_inputs>

        <StaticTable>
          <Table>
            <Thead>
              <Tr>
                <Th>ID Pedido</Th><Th>Producto</Th><Th>Nombre</Th><Th>Motivo</Th><Th>Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>{formData.pedidoId || "—"}</Td>
                <Td>{detallesPedido?.producto || "—"}</Td>
                <Td>{detallesPedido?.nombreProveedorCliente || "—"}</Td>
                <Td>{detallesPedido?.motivo || "—"}</Td>
                <Td>{detallesPedido ? `$${detallesPedido.monto}` : "—"}</Td>
              </Tr>
            </Tbody>
          </Table>
        </StaticTable>

        <Button variant="primary" onClick={handleRegister}>💾 Registrar Movimiento</Button>
        
        <Tcontainer $scroll={movimientosCaja.length > 7} $rows={7} >
        <Table>
          <Thead>
            <Tr>
              <Th>ID Pedido</Th><Th>Producto</Th><Th>Motivo</Th><Th>Nombre</Th><Th>Total</Th><Th>Fecha</Th>
            </Tr>
          </Thead>
          <Tbody>
            {movimientosCaja
              .filter(m => {
                const f = new Date(m.fechaHora).toISOString().split("T")[0];
                return f >= fechaInicio && f <= fechaFin;
              })
              .map((mov, i) => (
                <Tr key={i}>
                  <Td>{mov.referencia}</Td>
                  <Td>{mov.producto}</Td>
                  <Td>{mov.motivo}</Td>
                  <Td>{mov.nombreProveedorCliente}</Td>
                  <Td>${mov.monto}</Td>
                  <Td>{new Date(mov.fechaHora).toLocaleString()}</Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
        </Tcontainer>
      </Container>
    </MainContainer>
  );
};

export default Caja;