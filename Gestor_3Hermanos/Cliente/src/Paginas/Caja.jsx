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
  align-items: space-between;
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

//  **Estilos del modal**
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
  Border: 4px dashed #b3815d;
  padding: 1.5rem;
  gap: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
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
const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
`;
const Caja = () => {


  const [movements, setMovements] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    reason: "",
    reference: "",
    date: "",
    time: "",
    user: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleRegister = async () => {
    if (!formData.amount || !formData.reference || !formData.reason) {
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
      monto: parseFloat(formData.amount),
      referencia: formData.reference,
      motivo: formData.reason,
      fechaHora: new Date()
    };

    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${idUsuario}/caja`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMovement),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el movimiento");
      }

      const data = await response.json();
      console.log("Movimiento registrado con éxito:", data);

      // Actualizar la lista de movimientos
      setMovimientosCaja([...movimientosCaja, data]);

      // Reiniciar el formulario
      setFormData({
        amount: "",
        reason: "",
        reference: "",
        date: "",
        time: ""
      });

    } catch (error) {
      console.error("Error al registrar el movimiento:", error);
      alert("Hubo un problema al registrar el movimiento.");
    }
  };
  const [movimientosCaja, setMovimientosCaja] = useState([]);
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
              usuario: usuario.nombre,
              usuarioId: usuario.usuarioId
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


  // --------------------------------------------------
  // Manejo del Modal (Reporte)
  // --------------------------------------------------
  // Estados para la fecha y hora actual
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    const formattedTime = now.toTimeString().slice(0, 5);

    setDate(formattedDate);
    setTime(formattedTime);

    setFormData((prevFormData) => ({
      ...prevFormData,
      date: formattedDate,
      time: formattedTime
    }));
  }, []);

  // Estado para mostrar u ocultar el modal
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <MainContainer>

      <Header />

      <Container>

        <FlexRow>

          <Button onClick={() => setShowModal(true)}>📄 Generar Reporte</Button>

          {/*  **Ventana Emergente para generar Reporte** */}
          {showModal && (
            <ModalOverlay>
              <ModalContent>
                <Section>
                  <VolverBtn > <Icon onClick={handleCloseModal} src={backIcon} />  </VolverBtn>
                  <SubTitulo stitle=" 📅 Por Periodo de Tiempo" />
                  <DateContainer>
                    <Label>Del: <DateBox /></Label>
                    <Label>Al: <DateBox /></Label>
                  </DateContainer>
                </Section>

                <Section>
                  <SubTitulo stitle="📆 Por Día" />
                  <Label>Fecha: <DateBox /></Label>
                </Section>

                <Button>📄 Generar</Button>
              </ModalContent>
            </ModalOverlay>
          )}



          <Cont_lbl>

            <Label>
              📅 Fecha:
              <DateBox value={date} onChange={handleInputChange} readOnly />
            </Label>
            <Label>
              ⏰ Hora:
              <TimeBox value={time} onChange={handleInputChange} readOnly />
            </Label>
          </Cont_lbl>
        </FlexRow>

        <Cont_inputs>
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
            Referencia:
            <TextBox name="reference" value={formData.reference} onChange={handleInputChange}
              placeholder="# Pedido/ID Solicitud" />
          </Label>
        </Cont_inputs>
        <Button variant="primary" onClick={handleRegister} >💾 Registrar Movimiento</Button>

        <Table>
          <thead>
            <tr>
              <Th>Usuario</Th>
              <Th>#Referencia</Th>
              <Th>Motivo</Th>
              <Th>Monto</Th>
              <Th>Fecha/Hora</Th>
            </tr>
          </thead>
          <tbody>
            {movimientosCaja.map((mov) => (
              <tr key={mov.Id}>

                <Td>{mov.usuario}</Td>
                <Td>{mov.referencia}</Td>
                <Td>{mov.motivo}</Td>
                <Td>${mov.monto}</Td>
                <Td>
                  {mov.fechaHora ? new Date(mov.fechaHora).toLocaleString() : ""}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </MainContainer>
  );
};

export default Caja;