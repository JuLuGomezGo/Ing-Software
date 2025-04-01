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

const usuarioLogueado = localStorage.getItem("usuario");
const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;
const idUsuario = usuario?.usuarioId;


const ModalProducto = ({ showModal, handleCloseModal, mode, onSave, selectedProduct }) => {
    const [formData, setFormData] = useState({
        productoId: "",
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        proveedor: ""
    });


    // Cargar datos del producto seleccionado cuando el modal se abre en modo edición
    useEffect(() => {
        if ((mode === "editar" || mode === "agregarStock") && selectedProduct) {
            setFormData({
                productoId: selectedProduct.productoId,
                nombre: selectedProduct.nombre,
                descripcion: selectedProduct.descripcion,
                precio: selectedProduct.precio,
                stock: mode === "agregarStock" ? "" : selectedProduct.stock,
                proveedor: selectedProduct.proveedor?.proveedorId || ""
            });
        } else if (mode === "nuevo") {
            setFormData({
                productoId: "",
                nombre: "",
                descripcion: "",
                precio: "",
                stock: "",
                proveedor: ""
            });
        }
    }, [mode, selectedProduct]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (mode !== "agregarStock" && (!formData.nombre || !formData.precio)) {
            toast.error("Nombre y precio son campos requeridos");
            return;
        }

        if (mode === "agregarStock" && !formData.stock) {
            toast.error("Debe especificar la cantidad de stock");
            return;
        }

        // Preparar datos según el modo
        let datosEnviar;
        if (mode === "agregarStock") {
            datosEnviar = {
                productoId: formData.productoId,
                stock: Number(formData.stock),
                historialInventario: [{
                    cantidad: Number(formData.stock),
                    tipoMovimiento: "Entrada",
                    usuarioId: idUsuario
                }]
            };
        } else {
            datosEnviar = {
                ...formData,
                precio: Number(formData.precio),
                stock: Number(formData.stock || 0)
            };
        }

        const success = await onSave(datosEnviar);
        if (success) {
            handleCloseModal();
        }
    };


    const handleSave = () => {
        if (mode === "nuevo") {
            // Aquí iría la llamada al backend o la actualización del estado global
            toast.info("Guardando nuevo producto:", formData);

            // Ejemplo de petición POST si usas Fetch:
            fetch("/productos", {
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
                        <option value="Default">Seleccionar</option>
                        <option value="Proveedor1">Proveedor 1</option>
                        <option value="Proveedor2">Proveedor 2</option>
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
