import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";
import Button from "../Componentes/Button";
import { Table, Th, Td } from "../Componentes/Table";
import DropBox from "../Componentes/DropBox";
import { TextBox } from "../Componentes/TextComponent";
import { DateBox, TimeBox } from '../Componentes/Date-TimePicker';
import { jsPDF } from "jspdf";

// Estilos para el contenedor lateral (drawer)
const Sidebar = styled.div`
  position: fixed;
  top: 125px;
  right: ${(props) => (props.isOpen ? "0" : "-600px")}; /* Cambia a -300px si también aumentas el ancho */
  width: 300px; /* Aumenta el ancho del menú lateral */
  height: 100%;
  background-color: #f9f4ee;
  border-left: 2px solid #b3815d;
  padding: 1rem;
  transition: 0.3s ease;
  z-index: 1000;
`;


const SidebarButton = styled(Button)`
  
  top: 160px;
  right: 410px;
  z-index: 1001;
  background-color: #b3815d;
  color: white;
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

const Caja = () => {
  const [movimientosCaja, setMovimientosCaja] = useState([]);
  const [formData, setFormData] = useState({
    pedidoId: "",
    amount: "",
    reason: "",
    reference: "",
    nombreProveedorCliente: "",
    producto: "",
    date: "",
    time: ""
  });

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    const formattedTime = now.toTimeString().slice(0, 5);

    setDate(formattedDate);
    setTime(formattedTime);

    setFormData(prev => ({
      ...prev,
      date: formattedDate,
      time: formattedTime
    }));

    setFechaInicio(formattedDate);
    setFechaFin(formattedDate);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const obtenerDatosPedido = async () => {
    const id = formData.pedidoId;

    if (!id) {
      alert("Por favor ingresa un ID de pedido o producto.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/caja/${id}`);
      if (!response.ok) throw new Error("No se encontró el pedido o producto");

      const movimiento = await response.json();

      setFormData(prev => ({
        ...prev,
        amount: movimiento.monto || "",
        reason: movimiento.motivo || "",
        reference: id,
        nombreProveedorCliente: movimiento.nombreProveedorCliente || "",
        producto: movimiento.producto || "",
      }));
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      alert("No se pudo obtener el pedido o producto.");
    }
  };

  const handleRegister = async () => {
    const { amount, reference, reason, nombreProveedorCliente, producto } = formData;
    if (!amount || !reference || !reason || !nombreProveedorCliente || !producto) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const usuarioLogueado = localStorage.getItem("usuario");
    const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;
    const idUsuario = usuario?.usuarioId;

    if (!idUsuario) {
      alert("No se encontró el usuario. Inicia sesión nuevamente.");
      return;
    }

    const newMovement = {
      monto: parseFloat(amount),
      referencia: reference,
      motivo: reason,
      nombreProveedorCliente,
      producto,
      fechaHora: new Date(`${formData.date}T${formData.time}`)
    };

    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${idUsuario}/caja`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovement),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el movimiento");
      }

      const { data: nuevoMovimiento } = await response.json();
      setMovimientosCaja([...movimientosCaja, { ...nuevoMovimiento, usuario: usuario?.nombre }]);

      setFormData({
        pedidoId: "",
        amount: "",
        reason: "",
        reference: "",
        nombreProveedorCliente: "",
        producto: "",
        date,
        time
      });

    } catch (error) {
      console.error("Error al registrar el movimiento:", error);
      alert("Hubo un problema al registrar el movimiento.");
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();
  
    const movimientosFiltrados = movimientosCaja.filter(mov => {
      const fecha = new Date(mov.fechaHora).toISOString().split("T")[0];
      return fecha >= fechaInicio && fecha <= fechaFin;
    });
  
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Soporte Financiero", 105, 20, null, null, "center");
  
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Desde: ${fechaInicio}    Hasta: ${fechaFin}`, 105, 30, null, null, "center");
  
    let y = 45;
    let totalEntradas = 0;
    let totalSalidas = 0;
  
    movimientosFiltrados.forEach((mov) => {
      const tipo = mov.motivo === "Cobro Pedido" ? "📥 Entrada" : "📤 Salida";
  
      if (mov.motivo === "Cobro Pedido") {
        totalEntradas += mov.monto;
      } else if (mov.motivo === "Pago a Proveedor") {
        totalSalidas += mov.monto;
      }
  
      doc.setDrawColor(180);
      doc.setLineWidth(0.1);
      doc.line(14, y - 4, 195, y - 4); // Línea divisoria
  
      doc.setFont("helvetica", "bold");
      doc.text(`${tipo}`, 105, y, null, null, "center");
  
      doc.setFont("helvetica", "normal");
      y += 6;
      doc.text(`Usuario: ${mov.usuario}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Referencia: ${mov.referencia}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Motivo: ${mov.motivo}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Proveedor/Cliente: ${mov.nombreProveedorCliente}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Producto: ${mov.producto}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Monto: $${mov.monto.toFixed(2)}`, 105, y, null, null, "center");
      y += 6;
      doc.text(`Fecha: ${new Date(mov.fechaHora).toLocaleString()}`, 105, y, null, null, "center");
      y += 12;
  
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });
  
    doc.line(14, y - 4, 195, y - 4); // Línea final
  
    // Resumen de totales
    const balance = totalEntradas - totalSalidas;
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Resumen Financiero:", 105, y, null, null, "center");
  
    doc.setFont("helvetica", "normal");
    y += 8;
    doc.text(`Total Entradas (📥): $${totalEntradas.toFixed(2)}`, 105, y, null, null, "center");
    y += 8;
    doc.text(`Total Salidas (📤): $${totalSalidas.toFixed(2)}`, 105, y, null, null, "center");
    y += 8;
    doc.text(`Balance: $${balance.toFixed(2)}`, 105, y, null, null, "center");
  
    // Guardar archivo con nombre personalizado
    doc.save(`Soporte financiero_${fechaInicio} - ${fechaFin}.pdf`);
  };
  

  useEffect(() => {
    const fetchCajaMovimientos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/usuarios");
        if (!response.ok) throw new Error("Error al obtener usuarios");

        const result = await response.json();
        if (result.success) {
          const allMovimientos = result.data.flatMap(usuario =>
            usuario.caja?.map(mov => ({
              ...mov,
              usuario: usuario.nombre
            })) || []
          );

          allMovimientos.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
          setMovimientosCaja(allMovimientos);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchCajaMovimientos();
  }, []);

  return (
    <MainContainer>
      <Header />
      <Container>
        <SidebarButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          ☰ Filtrar Rango
        </SidebarButton>
        <Sidebar isOpen={isSidebarOpen}>
          <Cont_lbl>
            <Label>📅 Fecha: <DateBox value={date} readOnly /></Label>
            <Label>⏰ Hora: <TimeBox value={time} readOnly /></Label>
            <Label>📆 Desde: <DateBox value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} /></Label>
            <Label>📆 Hasta: <DateBox value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} /></Label>
            <Button onClick={generarPDF}>📄 Exportar PDF por Rango</Button>
          </Cont_lbl>
        </Sidebar>

        <Cont_inputs>
          <Label>
            ID Pedido o Producto:
            <TextBox
              name="pedidoId"
              value={formData.pedidoId}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  pedidoId: value,
                  reference: value,
                }));
              }}
              placeholder="ID del Pedido o Producto"
            />
            <Button onClick={obtenerDatosPedido}>🔍 Obtener datos</Button>
          </Label>
          <Label>
            Monto: $
            <TextBox name="amount" value={formData.amount} onChange={handleInputChange} placeholder="0.00" />
          </Label>
          <Label>
            Motivo:
            <DropBox name="reason" value={formData.reason} onChange={handleInputChange}>
              <option value="Default">Seleccionar</option>
              <option value="Cobro Pedido">Cobro Pedido</option>
              <option value="Pago a Proveedor">Pago a Proveedor</option>
            </DropBox>
          </Label>
          <Label>
            Cliente / Proveedor:
            <TextBox name="nombreProveedorCliente" value={formData.nombreProveedorCliente} onChange={handleInputChange} />
          </Label>
          <Label>
            Producto:
            <TextBox name="producto" value={formData.producto} onChange={handleInputChange} />
          </Label>
        </Cont_inputs>

        <Button variant="primary" onClick={handleRegister}>💾 Registrar Movimiento</Button>

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
            {movimientosCaja.map((mov, index) => (
              <tr key={index}>
                <Td>{mov.usuario}</Td>
                <Td>{mov.referencia}</Td>
                <Td>{mov.motivo}</Td>
                <Td>{mov.nombreProveedorCliente}</Td>
                <Td>{mov.producto}</Td>
                <Td>${mov.monto.toFixed(2)}</Td>
                <Td>{mov.fechaHora ? new Date(mov.fechaHora).toLocaleString() : ""}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </MainContainer>
  );
};

export default Caja;
