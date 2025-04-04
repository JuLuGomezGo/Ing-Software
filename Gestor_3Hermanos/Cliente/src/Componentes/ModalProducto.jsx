import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";

import Button from "../Componentes/Button";
import Icon from "../Componentes/Icon";
import DropBox from "../Componentes/DropBox";
import { TextBox } from "../Componentes/TextComponent";
import SubTitulo from "./SubTitle";

import addIcon from "../Componentes/Iconos/new.png";
import details from "../Componentes/Iconos/details.png";
import idIcon from "../Componentes/Iconos/id.png";
import productoIcon from "../Componentes/Iconos/productoIcon.png";
import stockIcon from "../Componentes/Iconos/stock.png";
import priceIcon from "../Componentes/Iconos/priceIcon.png";
import proveedorIcon from "../Componentes/Iconos/proveedorIcon.png";
import newIcon from "../Componentes/Iconos/preparando.png";
import backIcon from "../Componentes/Iconos/back.png";

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
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-bottom: 1px solid #b3815d;
  padding-bottom: 0.5rem;
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

const Label = styled.label`
  font-weight: bold;
  color: #5d4037;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalProducto = ({ showModal, handleCloseModal, mode, onSave }) => {
    if (!showModal) return null;

    const [formData, setFormData] = useState({
        productoId: "",
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        // proveedorId: ""
    });

    const handleChange = (e) => {
        setProducto({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        onSave(producto);
        handleCloseModal();
    };

    const handleSave = () => {
        if (mode === "nuevo") {
            // Aquí iría la llamada al backend o la actualización del estado global
            toast.info("Guardando nuevo producto:", formData);

            // Ejemplo de petición POST si usas Fetch:
            fetch("http://localhost:3000/api/productos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json, ",

                },
                body: JSON.stringify(formData)

            })

                .then(response => response.json())
                .then(data => {

                    console.log("Enviando:", JSON.stringify(formData));

                    toast.info("Producto agregado:", data);
                    handleCloseModal(); // Cierra el modal después de guardar
                })
                .catch(error => toast.error("Error al guardar:", error));
        }
    };

    useEffect(() => {
        fetchProveedoresUnicos();
    //     fetchProductosConProveedores();
    }, []);


    const [proveedores, setProveedores] = useState([]);

    const fetchProveedoresUnicos = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/productos`);
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                // Extrae los nombres de los proveedores
                setProveedores(result.data.map(producto => producto.proveedor.nombre));
            } else {
                console.error("El formato de los datos no es el esperado:", result);
            }
        } catch (error) {
            console.error("Error cargando proveedores:", error);
        }
    };

    fetchProveedoresUnicos();



    // CÓDIGO PARA OBTENER LOS PROVEEDORES DE UN PRODUCTO ESPECÍFICO
    // const fetchProductosConProveedores = async (productoId) => {
    //     try {
    //         const response = await fetch(`http://localhost:3000/api/productos`);
    //         const result = await response.json();

    //         if (result.success && Array.isArray(result.data)) {
    //             // Filtramos el producto seleccionado
    //             const productoSeleccionado = result.data.find(p => p.productoId === productoId);

    //             if (!productoSeleccionado) {
    //                 console.error("Producto no encontrado");
    //                 return;
    //             }

    //             // Extraemos los proveedores (ajustar si el modelo cambia)
    //             const proveedores = Array.isArray(productoSeleccionado.proveedores)
    //                 ? productoSeleccionado.proveedores.map(proveedor => proveedor.nombre)
    //                 : [productoSeleccionado.proveedor.nombre];


    //             console.log("Proveedores del producto:", proveedores);
    //         } else {
    //             console.error("Formato de datos inesperado:", result);
    //         }
    //     } catch (error) {
    //         console.error("Error obteniendo proveedores:", error);
    //     }
    // };



    // Definir título y botón según la acción


    const getModalConfig = () => {
        switch (mode) {
            case "nuevo":
                return { title: "Nuevo Producto", buttonText: "Guardar", icon: addIcon };
            case "editar":
                return { title: "Editar Producto", buttonText: "Actualizar", icon: details };
            case "agregarStock":
                return { title: "Agregar Stock", buttonText: "Añadir", icon: stockIcon };
            default:
                return { title: "Producto", buttonText: "Guardar", icon: newIcon };
        }
    };

    const { title, buttonText, icon } = getModalConfig();

    const campos = [
        { icon: idIcon, label: "Código de Producto", key: "productoId", disabled: ["editar", "agregarStock"] },
        { icon: productoIcon, label: "Producto", key: "nombre", disabled: ["editar", "agregarStock"] },
        { icon: details, label: "Descripción", key: "descripcion", disabled: ["agregarStock"] },
        { icon: priceIcon, label: "Precio", key: "precio", disabled: ["agregarStock"] },
        { icon: stockIcon, label: mode === "agregarStock" ? "Stock Recibido" : "Stock", key: "stock", disabled: [] },
    ];


    return (
        <ModalOverlay>
            <ModalContent>
                <Section>
                    <VolverBtn onClick={handleCloseModal}>
                        <Icon src={backIcon} /> Volver
                    </VolverBtn>
                </Section>

                <SubTitulo stitle={title} />

                {campos.map((campo) => (
                    <Label key={campo.label}>
                        <Icon src={campo.icon} /> {campo.label}
                        <TextBox
                            disabled={campo.disabled.includes(mode)}
                            value={formData[campo.key]}
                            onChange={(e) => setFormData({ ...formData, [campo.key]: e.target.value })}
                        />
                    </Label>
                ))}

                <Label>
                    <Icon src={proveedorIcon} /> Proveedor
                    <DropBox
                        disabled={mode === "editar"}
                        name="Proveedor"
                        value={formData.proveedor}
                        onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    >
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map((nombre, index) => (
                            <option key={index} value={nombre}>{nombre}</option>
                        ))}
                    </DropBox>

                </Label>



                <Button onClick={handleSave}>
                    <Icon src={icon} /> {buttonText}
                </Button>


            </ModalContent>
        </ModalOverlay>
    );
};


export default ModalProducto;
