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
    });

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
                stock: "",
                proveedor: "",
            });
        }
        else if (mode === "editar" || mode === "agregarStock") {
            setFormData({
                productoId: productoSeleccionado.productoId || "",
                nombre: productoSeleccionado.nombre || "",
                descripcion: productoSeleccionado.descripcion || "",
                precio: productoSeleccionado.precio || "",
                stock: mode === "agregarStock" ? "" : productoSeleccionado.stock || "",
                proveedor: productoSeleccionado.proveedor?.nombre || "",
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
            const proveedor = await seleccionarProveedor(formData.proveedor?.nombre); // Esperar el resultado
    
            const producto = {
                productoId: Number(formData.productoId),
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: Number(formData.precio),
                stock: Number(formData.stock),
                proveedor: proveedor // Ya tiene el objeto proveedor completo
            };
    
            onSave(producto);
        } else if (mode === "agregarStock") {
            formData.stock = Number(formData.stock) + Number(productoSeleccionado.stock);
    
            const producto = {
                productoId: formData.productoId,
                stock: Number(formData.stock)
            };
            onSave(producto);
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
    






    // useEffect(() => {
    //     fetchProveedoresUnicos();
    //     //     fetchProductosConProveedores();
    // }, []);


    //FETCH DE PROVEEDORES ORIGINALES
    // const fetchProveedoresUnicos = async () => {
    //     try {
    //         const response = await fetch(`http://localhost:3000/api/productos`);
    //         const result = await response.json();

    //         if (result.success && Array.isArray(result.data)) {
    //             // Extrae los nombres de los proveedores
    //             setProveedores(result.data.map(producto => producto.proveedor.nombre));
    //         } else {
    //             console.error("El formato de los datos no es el esperado:", result);
    //         }
    //     } catch (error) {
    //         console.error("Error cargando proveedores:", error);
    //     }
    // };





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
    //                 ? productoSeleccionado.proveedores
    //                 : [productoSeleccionado.proveedor.nombre];


    //             console.log("Proveedores del producto:", proveedores);
    //         } else {
    //             console.error("Formato de datos inesperado:", result);
    //         }
    //     } catch (error) {
    //         console.error("Error obteniendo proveedores:", error);
    //     }
    // };
    
    useEffect(() => {
        const cargarProveedores = async () => {
            const data = await fetchProveedoresUnicos();
            if (data) {
                setProveedores(data);
            }
        };
    
        cargarProveedores();
    }, []);

    const [proveedores, setProveedores] = useState([]);

    const fetchProveedoresUnicos = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/productos`);
            const result = await response.json();
    
    
            if (result.success && Array.isArray(result.data)) {
                const proveedores = result.data
                    .filter(producto => producto.proveedor && typeof producto.proveedor === 'object') 
                    .map(producto => producto.proveedor);
    
    
                const proveedoresUnicos = [];
                const nombresUnicos = new Set();
    
                proveedores.forEach(proveedor => {
                    if (!nombresUnicos.has(proveedor.nombre)) {
                        nombresUnicos.add(proveedor.nombre);
                        proveedoresUnicos.push(proveedor);
                    }
                });
    
                return proveedoresUnicos;
            } else {
                console.error("El formato de los datos no es el esperado:", result);
                return [];
            }
        } catch (error) {
            console.error("Error cargando proveedores:", error);
            return [];
        }
    };
    
    


    const fetchProductosConProveedores = async (productoId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/productos`);
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                // Filtramos el producto por su ID
                const productoSeleccionado = result.data.find(p => p.productoId === productoId);

                if (!productoSeleccionado) {
                    console.error("Producto no encontrado");
                    return;
                }

                // Extraemos el arreglo de proveedores completos
                const proveedores = Array.isArray(productoSeleccionado.proveedores)
                    ? productoSeleccionado.proveedores  // Ahora devuelve el objeto completo
                    : [];

                return proveedores;
            } else {
                console.error("Formato de datos inesperado:", result);
            }
        } catch (error) {
            console.error("Error obteniendo proveedores:", error);
        }
    };

    const seleccionarProveedor = async (nombreProveedor) => {
        const proveedores = await fetchProveedoresUnicos();

        const proveedorSeleccionado = proveedores.find(p => p.nombre === nombreProveedor);

        if (!proveedorSeleccionado) {
            console.error("Proveedor no encontrado");
            return null;
        }

        return proveedorSeleccionado;
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
        { icon: idIcon, label: "Código de Producto", key: "productoId", disabled: ["editar", "agregarStock"] },
        { icon: productoIcon, label: "Producto", key: "nombre", disabled: ["editar", "agregarStock"] },
        { icon: details, label: "Descripción", key: "descripcion", disabled: ["agregarStock"] },
        { icon: priceIcon, label: "Precio", key: "precio", disabled: ["agregarStock"] },
        { icon: stockIcon, label: mode === "agregarStock" ? "Stock Recibido" : "Stock", key: "stock", disabled: ["editar"] },
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
    value={formData.proveedor?.nombre || ""}
    onChange={(e) => {
        console.log("Proveedor seleccionado en el DropBox:", e.target.value);
        const proveedorSeleccionado = proveedores.find(p => p.nombre === e.target.value);

        if (!proveedorSeleccionado) {
            console.error("Proveedor no encontrado en la lista de proveedores:", proveedores);
        } else {
            setFormData({ ...formData, proveedor: proveedorSeleccionado });
        }
    }}
>
    <option value="">Seleccione un proveedor</option>
    {proveedores.map((proveedor, index) => (
        <option key={index} value={proveedor.nombre}>{proveedor.nombre}</option>
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
