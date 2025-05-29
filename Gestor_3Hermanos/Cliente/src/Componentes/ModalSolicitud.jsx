
import React from "react";
import styled from "styled-components";
import Button from "./Button";
import { Table, Tr, Th, Td } from "./Table";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import priceI from "./Iconos/priceIcon.png";

const ModalBackground = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Encabezado = styled.h2`
  text-align: center;
`;

const Info = styled.p`
  margin: 4px 0;
`;

const Acciones = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const ModalSolicitud = ({ solicitud, onClose, onChangeEstado, onCancelar }) => {
    if (!solicitud) return null;
    const navigate = useNavigate();
    const estadoActual = solicitud.estado;

    return (
        <ModalBackground onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <Encabezado>📄 Detalles de Solicitud #{solicitud.solicitudId}</Encabezado>
                <Info><strong>Proveedor:</strong> {solicitud.proveedor?.nombre || "Desconocido"}</Info>
                <Info><strong>Contacto:</strong> {solicitud.proveedor?.contacto || "—"} ({solicitud.proveedor?.email || "—"})</Info>
                <Info><strong>Fecha:</strong> {new Date(solicitud.fechaSolicitud).toLocaleString()}</Info>
                <Info><strong>Estado:</strong> {estadoActual}</Info>

                <Table>
                    <thead>
                        <Tr>
                            <Th>Producto</Th>
                            <Th>Cantidad</Th>
                            <Th>Costo</Th>
                            <Th>Subtotal</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {solicitud.productos.map((p, i) => (
                            <Tr key={i}>
                                <Td>{p.producto?.nombre || p.nombreTemporal || "—"}</Td>
                                <Td>{p.cantidad} Kg</Td>
                                <Td>${p.costoUnitario}</Td>
                                <Td>${p.subtotal}</Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>

                <Info><strong>Total:</strong> ${solicitud.total}</Info>

                <Acciones>
                    {estadoActual === "Pendiente" && (
                        <>
                            <Button variant="primary" onClick={() => navigate("/Caja")}><Icon src={priceI}/> Ir a Pagar</Button>
                            <Button variant="danger" onClick={onCancelar}>❌ Cancelar</Button>
                        </>
                    )}
                    {estadoActual === "Enviado" && (
                        <Button variant="warning" disabled>⏳ Esperando registro de recepción</Button>
                    )}
                    {estadoActual === "Recibido" && (
                        <Button variant="secondary" disabled>✅ Solicitud Recibida</Button>
                    )}
                    <Button onClick={onClose}>Cerrar</Button>
                </Acciones>
            </ModalContent>
        </ModalBackground>
    );
};

export default ModalSolicitud;
