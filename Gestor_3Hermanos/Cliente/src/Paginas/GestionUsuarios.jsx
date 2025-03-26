import React, { useState, useEffect } from "react";

import styled from "styled-components";

// Importar tus Styled Components base
import { TextBox } from "../Componentes/TextComponent";
import Button from "../Componentes/Button";
import { Table, Th, Td } from "../Componentes/Table";
import DropBox from "../Componentes/DropBox";
import SubTitle from "../Componentes/SubTitle";

import Header from "../Componentes/Header";
import MainContainer from "../Componentes/MainContainer";
// Íconos
import pencilIcon from "../Componentes/Iconos/edit.png";
import trashIcon from "../Componentes/Iconos/delete.png";



export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  /* Ajusta como quieras el espacio entre la parte del formulario y la tabla */
`;

export const FormContainer = styled.div`
  width: auto; /* Ajusta según tu preferencia */
  background-color: #f9f4ee;
  border: 2px solid #a96e3b;
  border-radius: 10px;
  padding: 20px;
`;

export const FormTitle = styled.h3`
  margin-bottom: 10px;
`;

export const Message = styled.div`
  margin-bottom: 10px;
  color: ${({ error }) => (error ? "red" : "green")};
  font-weight: bold;
`;

export const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  margin-top: 15px;
`;

export const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
`;

export const Select = styled.select`
  padding: 8px;
  border: 2px solid #a96e3b;
  border-radius: 5px;
  background-color: #fff;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const TableContainer = styled.div`
  flex-grow: 1;
  background-color: #f9f4ee;
  border: 2px solid #a96e3b;
  border-radius: 10px;
  padding: 20px;
`;

export const IconButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;



function GestionUsuarios() {

  const [usuarios, setUsuarios] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [correo, setCorreo] = useState("");

  // Mensaje de retroalimentación y flag para error
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  // Estado para saber si estamos editando o creando
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null); // usuarioId a editar

  // Al montar, obtener la lista de usuarios
  useEffect(() => {
    fetch("http://localhost:3000/api/usuarios")
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setUsuarios(response.data);
        } else {
          console.error("Error al obtener usuarios:", response.error);
        }
      })
      .catch((error) => console.error("Error de red o servidor:", error));
  }, []);

  // Seleccionar/deseleccionar fila
  const handleRowClick = (index) => {
    if (editMode) {
      // Salir del modo edición si se hace click en otro lado
      setEditMode(false);
      setEditUserId(null);
      setNombre("");
      setRol("");
      setContrasena("");
      setCorreo("");
      setMensaje("");
    }
    setSelectedRow(selectedRow === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !rol || !contrasena || !correo) {
      setMensaje("Faltan campos requeridos");
      setError(true);
      return;
    }

    if (!editMode) {
      // ====== MODO CREAR ======
      const nuevoUsuario = { nombre, rol, contraseña: contrasena, correo };

      fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            setUsuarios([...usuarios, response.data]);
            setMensaje("Usuario registrado correctamente");
            setError(false);
            // Limpiar campos
            setNombre("");
            setRol("");
            setContrasena("");
            setCorreo("");
          } else {
            setMensaje("Error: " + response.error);
            setError(true);
          }
        })
        .catch((error) => {
          console.error("Error al crear usuario:", error);
          setMensaje("Error al registrar usuario");
          setError(true);
        });
    } else {
      // ====== MODO EDITAR ======
      const usuarioActualizado = { nombre, rol, contraseña: contrasena, correo };

      fetch(`http://localhost:3000/api/usuarios/${editUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioActualizado),
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            const listaActualizada = usuarios.map((u) => {
              if (u.usuarioId === editUserId) {
                return response.data;
              }
              return u;
            });
            setUsuarios(listaActualizada);
            setMensaje("Datos actualizados correctamente");
            setError(false);
            // Limpiar campos
            setNombre("");
            setRol("");
            setContrasena("");
            setCorreo("");
            setEditMode(false);
            setEditUserId(null);
          } else {
            setMensaje("Error al actualizar: " + response.error);
            setError(true);
          }
        })
        .catch((error) => {
          console.error("Error al actualizar usuario:", error);
          setMensaje("Error al actualizar usuario");
          setError(true);
        });
    }
  };

  const handleEditar = (usuarioId) => {
    const usuario = usuarios.find((u) => u.usuarioId === usuarioId);
    if (!usuario) {
      setMensaje("Usuario no encontrado");
      setError(true);
      return;
    }
    setNombre(usuario.nombre);
    setRol(usuario.rol);
    setContrasena("");
    setCorreo(usuario.correo);
    setEditMode(true);
    setEditUserId(usuarioId);
    setMensaje("");
  };

  const handleEliminar = (usuarioId) => {
    fetch(`http://localhost:3000/api/usuarios/${usuarioId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          const listaActualizada = usuarios.filter((u) => u.usuarioId !== usuarioId);
          setUsuarios(listaActualizada);
          setMensaje("Datos borrados");
          setError(false);
        } else {
          setMensaje("Error al borrar usuario: " + response.error);
          setError(true);
        }
      })
      .catch((error) => {
        console.error("Error al eliminar usuario:", error);
        setMensaje("Error al eliminar usuario");
        setError(true);
      });
  };

  const textoBoton = editMode ? "Actualizar Empleado" : "Registrar Empleado";

  return (
    <MainContainer>
     <Header/>
      <ContentContainer>
        <FormContainer>
          <SubTitle stitle={editMode ? "Editar Empleado" : "Registrar Empleado"} />

          {mensaje && <Message error={error}>{mensaje}</Message>}

          <form onSubmit={handleSubmit}>
            {/* Fila 1: Nombre / Rol */}
            <FormRow>
              <div style={{ flex: 1 }}>
                <Label>Nombre:</Label>
                <TextBox
                  type="text"
                  placeholder="Nombre del empleado"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label>Rol:</Label>
                <DropBox value={rol} onChange={(e) => setRol(e.target.value)}>
                  <option value="">Seleccionar</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Repartidor">Repartidor</option>
                  <option value="Empleado">Empleado</option>
                </DropBox>
              </div>
            </FormRow>

            {/* Fila 2: Contraseña / Correo */}
            <FormRow>
              <div style={{ flex: 1 }}>
                <Label>{editMode ? "Nueva Contraseña:" : "Contraseña:"}</Label>
                <TextBox
                  type="text"
                  placeholder={
                    editMode ? "Nueva Contraseña" : "Contraseña del trabajador"
                  }
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label>Correo:</Label>
                <TextBox
                  type="email"
                  placeholder="Dirección de Correo Electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </FormRow>

            {/* Fila 3: Botón */}
            <FormRow>
              <Button variant="primary" type="submit">
                {textoBoton}
              </Button>
            </FormRow>
          </form>
        </FormContainer>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Empleado</Th>
                <Th>Rol</Th>
                <Th>Correo Electrónico</Th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, index) => {
                const isSelected = selectedRow === index;
                return (
                  <tr key={u.usuarioId} onClick={() => handleRowClick(index)}>
                    <Td>{u.nombre}</Td>
                    <Td>{u.rol}</Td>
                    <Td>{u.correo}</Td>
                    {isSelected && (
                      <td>
                        <IconButtonContainer>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditar(u.usuarioId);
                            }}
                          >
                            <img src={pencilIcon} alt="Editar" style={{ width: 16 }} />
                          </Button>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminar(u.usuarioId);
                            }}
                          >
                            <img src={trashIcon} alt="Eliminar" style={{ width: 16 }} />
                          </Button>
                        </IconButtonContainer>
                      </td>
                    )}
                  </tr>
                );
              })}
              {usuarios.length === 0 && (
                <tr>
                  <Td colSpan="3" style={{ textAlign: "center" }}>
                    No hay usuarios registrados
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </ContentContainer>
    </MainContainer>
  );
}

export default GestionUsuarios;
