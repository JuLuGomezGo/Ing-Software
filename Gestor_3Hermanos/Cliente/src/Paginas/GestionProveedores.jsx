import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Button from "../Componentes/Button";
import SubTitulo from "../Componentes/SubTitle";
import { Table, Th, Td, Tr, Tbody, Thead, Tcontainer } from "../Componentes/Table";
import { TextBox } from "../Componentes/TextComponent";
import DropBox from "../Componentes/DropBox";
import Icon from "../Componentes/Icon";
import proveedorIcon from "../Componentes/Iconos/proveedorIcon.png";
import addIcon from "../Componentes/Iconos/add.png";

import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";

const Container = styled.div`
  width: 70%;
  min-height: 100vh;
  height: 125vh;
  margin: 30px auto;
  padding: 20px;
  background-color: #f9f4ee;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
 width: 60%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
  margin-top: 20px;
`;

const FullWidth = styled.div`
  grid-column: span 2;
`;

const GestionProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', contacto: '', email: '', direccion: '' });


  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const toggleMostrarInactivos = () => {
    setMostrarInactivos(prev => !prev);
  };


  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const handleEditClick = (prov) => {
    setSelectedProveedor(prov);
    setFormData({
      nombre: prov.nombre,
      contacto: prov.contacto,
      email: prov.email,
      direccion: prov.direccion,
    });
  };

  const inactivarProveedor = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/proveedores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...selectedProveedor, activo: false })
      });

      if (res.ok) {
        fetchProveedores();
      }
    } catch (error) {
      console.error("Error al inactivar proveedor:", error);
    }
  };


  const reactivarProveedor = async (proveedorId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/proveedores/${proveedorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, activo: true }),  // ← Aquí lo activas
      });

      if (!res.ok) throw new Error("Error al reactivar proveedor");
      fetchProveedores(); // Recargar la tabla
      setSelectedProveedor(null);
      setFormData({ nombre: "", contacto: "", email: "", direccion: "" });
    } catch (error) {
      console.error("Error al reactivar:", error);
    }
  };



  const fetchProveedores = async () => {
    try {
      const endpoint = mostrarInactivos
        ? "http://localhost:3000/api/proveedores/inactivos"
        : "http://localhost:3000/api/proveedores";

      const res = await fetch(endpoint);
      const data = await res.json();

      if (Array.isArray(data.data)) {
        setProveedores(data.data);
        console.log("Datos desde backend:", data.data);
      } else {
        console.error("Formato de datos inesperado:", data);
      }
    } catch (error) {
      toast.error("Error al cargar proveedores: " + error.message);
    }
  };



  useEffect(() => {
    console.log("Mostrar inactivos ahora:", mostrarInactivos);
    fetchProveedores();
  }, [mostrarInactivos]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = selectedProveedor ? "PUT" : "POST";
    const endpoint = selectedProveedor
      ? `http://localhost:3000/api/proveedores/${selectedProveedor.proveedorId}`
      : "http://localhost:3000/api/proveedores";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        fetchProveedores();
        setFormData({ nombre: "", contacto: "", email: "", direccion: "" });
        toast.success("Proveedor guardado correctamente");
        setSelectedProveedor(null);
      } else {
        toast.error("Error al guardar proveedor: " + data.error);
        console.error("Error al guardar:", data);
      }
    } catch (error) {
      console.error("Error al enviar:", error);
    }
  };


  return (
    <MainContainer>
      <Header />
      <Container>
        <SubTitulo
          ancho={"justo"} 
          stitle="Gestión de Proveedores"
          icono={proveedorIcon}
        />


        <Form onSubmit={handleSubmit}>
          <TextBox name="nombre" placeholder="Nombre del Proveedor" value={formData.nombre} onChange={handleChange} required />
          <TextBox name="contacto" placeholder="Nombre Encargado" value={formData.contacto} onChange={handleChange} required />

          <TextBox name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <DropBox disabled >
            <option >Activo</option>
          </DropBox>
          <TextBox name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} required />



          {selectedProveedor && (
            <Button
              variant={selectedProveedor.activo ? "danger" : "success"}
              onClick={() =>
                selectedProveedor.activo
                  ? inactivarProveedor(selectedProveedor.proveedorId)
                  : reactivarProveedor(selectedProveedor.proveedorId)
              }
            >
              {selectedProveedor.activo ? "Inactivar" : "Reactivar"}
            </Button>
          )}


          <FullWidth>
            <Button type="submit"><Icon src={addIcon} />Guardar Proveedor</Button>
            <br />

          </FullWidth>
        </Form>


        <Button onClick={toggleMostrarInactivos} type="button">
          {mostrarInactivos ? "Ocultar Inactivos" : "Mostrar Inactivos"}
        </Button>
        <Tcontainer $scroll={proveedores.length > 6} $rows={6}>
        <Table>
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Contacto</Th>
              <Th>Email</Th>
              <Th>Dirección</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {proveedores.filter(prov => mostrarInactivos || prov.activo)
              .map((prov) => (
                <Tr
                  key={prov.proveedorId}
                  onClick={() => handleEditClick(prov)}
                  className={selectedProveedor?.proveedorId === prov.proveedorId ? "selected" : ""}

                >
                  <Td>{prov.nombre}</Td>
                  <Td>{prov.contacto}</Td>
                  <Td>{prov.email}</Td>
                  <Td>{prov.direccion}</Td>
                  <Td>{prov.activo ? "Activo" : "Inactivo"}</Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
        </Tcontainer>
      </Container >
    </MainContainer>
  );
};

export default GestionProveedores;
