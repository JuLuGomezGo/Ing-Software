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
  z-index: 9999;
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

const ModalProducto = ({ showModal, handleCloseModal, mode, onSave, productoSeleccionado }) => {
    if (!showModal) return null;

    const [formData, setFormData] = useState({
        productoId: "",
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        tipoMovimiento: "Entrada",
        motivoMovimiento: "Compra"
    });



    const tiposMovimiento = [
        { value: "Entrada", label: "Entrada de Stock" },
        { value: "Salida", label: "Salida de Stock" }
    ];

    const motivosMovimiento = {
        Entrada: [
            { value: "NuevoProducto", label: "Nuevo Producto" },
            { value: "ReStock", label: "ReStock" },
            { value: "Devolucion", label: "Devolución" }
        ],
        Salida: [
            { value: "Venta", label: "Venta a Cliente" },
            { value: "Merma", label: "Merma/Pérdida" }
        ]
    };



    const handleChange = (e) => {
        setProducto({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (mode === "nuevo") {
            setFormData({
                productoId: "",
                nombre: "",
                descripcion: "",
                precio: "",
                tipoMovimiento: "Entrada",
                motivoMovimiento: "NuevoProducto",
                stock: "",
                proveedor: "",
            });
        }


        else if (mode === "editar") {
            setFormData({
                productoId: productoSeleccionado.productoId || "",
                nombre: productoSeleccionado.nombre || "",
                descripcion: productoSeleccionado.descripcion || "",
                precio: productoSeleccionado.precio || "",
                stock: mode === "agregarStock" ? "" : productoSeleccionado.stock || "",
                proveedor: productoSeleccionado.proveedor?.nombre || "",
            });
        } if (mode === "agregarStock" && productoSeleccionado) {
            setFormData({
                productoId: productoSeleccionado.productoId || "",
                nombre: productoSeleccionado.nombre || "",
                descripcion: productoSeleccionado.descripcion || "",
                precio: productoSeleccionado.precio || "",
                stock: mode === "agregarStock" ? "" : productoSeleccionado.stock || "",
                tipoMovimiento: "Entrada",
                motivoMovimiento: "ReStock",
                stock: "",
                proveedor: productoSeleccionado.proveedor?.nombre || ""
            });
        }
    }, [productoSeleccionado, showModal, mode]);



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.descripcion || !formData.precio) {
            toast.error("Faltan campos requeridos");
            return;
        }

        if (mode === "nuevo") {
            const proveedorId = await seleccionarProveedor(formData.proveedor?.nombre);
            if (!proveedorId) {
                toast.error("Proveedor no válido");
                return;
            }
            const producto = {
                productoId: Number(formData.productoId),
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: Number(formData.precio),
                stock: Number(formData.stock),
                proveedor: formData.proveedorId
            };

            onSave(producto);
        } else if (mode === "agregarStock") {
            if (!formData.stock) {
                toast.error("Debe especificar la cantidad");
                return;
            }

            const cantidad = Number(formData.stock);
            const movimiento = {
                cantidad: formData.tipoMovimiento === "Salida" ? -cantidad : cantidad,
                tipoMovimiento: formData.tipoMovimiento,
                motivo: formData.motivoMovimiento,
                usuarioId: 1, // Aquí deberías usar el ID del usuario real
                fechaMovimiento: new Date().toISOString()
            };

            const productoActualizado = {
                productold: productoSeleccionado.productold,
                stock: formData.tipoMovimiento === "Salida"
                    ? productoSeleccionado.stock - cantidad
                    : productoSeleccionado.stock + cantidad,
                historialInventario: [movimiento]
            };

            onSave(productoActualizado);

        } else if (mode === "editar") {
            const producto = {
                productoId: productoSeleccionado?.productoId,
                descripcion: formData.descripcion,
                precio: Number(formData.precio)
            };

            console.log("Enviando producto:", producto);
            onSave(producto);
        }
    };





    const [proveedores, setProveedores] = useState([]);
    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/proveedores");
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                setProveedores(result.data); // state
            } else {
                console.error("Formato de datos inesperado:", result);
            }
        } catch (err) {
            console.error("Error cargando proveedores:", err);
        }
    };



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
        // { icon: idIcon, label: "Código de Producto", key: "productoId", disabled: ["editar", "agregarStock"] },
        { icon: productoIcon, label: "Producto", key: "nombre", disabled: ["editar", "agregarStock"] },
        { icon: details, label: "Descripción", key: "descripcion", disabled: ["agregarStock"] },
        { icon: priceIcon, label: "Precio", key: "precio", disabled: ["agregarStock"] },
        { icon: stockIcon, label: mode === "agregarStock" ? "Cantidad Kg" : "Stock", key: "stock", disabled: ["editar"] },
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
                {mode === "agregarStock" && (
                    <>
                        <Label>
                            <Icon src={stockIcon} /> Tipo de Movimiento
                            <DropBox
                                value={formData.tipoMovimiento}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        tipoMovimiento: e.target.value,
                                        motivoMovimiento: motivosMovimiento[e.target.value][0].value
                                    });
                                }}
                            >
                                {tiposMovimiento.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </DropBox>
                        </Label>

                        <Label>
                            <Icon src={details} /> Motivo
                            <DropBox
                                value={formData.motivoMovimiento}
                                onChange={(e) => setFormData({ ...formData, motivoMovimiento: e.target.value })}
                            >
                                {motivosMovimiento[formData.tipoMovimiento].map((motivo) => (
                                    <option key={motivo.value} value={motivo.value}>
                                        {motivo.label}
                                    </option>
                                ))}
                            </DropBox>
                        </Label>
                    </>
                )}

                <Label>
                    <Icon src={proveedorIcon} /> Proveedor
                    <DropBox
                        name="proveedorId"
                        disabled={mode === "editar"}
                        value={formData.proveedorId || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, proveedorId: Number(e.target.value) })
                        }
                    >
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map((prov) => (
                            <option key={prov.proveedorId} value={prov.proveedorId}>
                                {prov.nombre}
                            </option>
                        ))}
                    </DropBox>


                </Label>



                <Button onClick={handleSubmit}>
                    <Icon src={icon} /> {buttonText}
                </Button>


            </ModalContent>
        </ModalOverlay>
    );
};


export default ModalProducto;
