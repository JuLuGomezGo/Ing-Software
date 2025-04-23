import React, { useState, useEffect } from "react";
import styled from "styled-components";

import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";
import Button from "../Componentes/Button";
import { Table, Th, Td } from "../Componentes/Table";
import DropBox from "../Componentes/DropBox";
import { TextBox } from "../Componentes/TextComponent";
import { DateBox, TimeBox } from '../Componentes/Date-TimePicker';
import SubTitulo from "../Componentes/SubTitle";
import Icon from "../Componentes/Icon";
import backIcon from "../Componentes/Iconos/back.png";

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

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #f9f4ee;
  border: 4px dashed #b3815d;
  padding: 1.5rem;
  gap: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-bottom: 1px solid #b3815d;
  padding-bottom: 0.5rem;
`;

const DateContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const VolverBtn = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  margin: fit-content;
  padding: 10px;
  text-decoration: none;
  color: #8B572A;
  cursor: pointer;
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
  const [showModal, setShowModal] = useState(false);

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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const obtenerDatosPedido = async () => {
    if (!formData.pedidoId) {
      alert("Por favor ingresa un ID de pedido.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${formData.pedidoId}`);
      if (!response.ok) throw new Error("No se encontró el pedido");

      const result = await response.json();
      const pedido = result.data;

      setFormData({
        ...formData,
        amount: pedido.total || "",
        reason: pedido.tipo === "venta" ? "Cobro Pedido" : "Pago de proveedor",
        nombreProveedorCliente: pedido.nombreProveedorCliente || "",
        producto: pedido.producto || "",
      });

    } catch (error) {
      console.error("Error al obtener pedido:", error);
      alert("No se pudo obtener el pedido.");
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
        <Cont_lbl>
          <Label>📅 Fecha: <DateBox value={date} readOnly /></Label>
          <Label>⏰ Hora: <TimeBox value={time} readOnly /></Label>
        </Cont_lbl>

        <Cont_inputs>
          <Label>
            ID Pedido:
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
              placeholder="ID del Pedido"
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
              <option value="Pago de proveedor">Pago de proveedor</option>
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
              <Th>ID Pedido</Th>
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