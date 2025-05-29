//IMPORTACIONES
//LIBRERIAS
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";

//COMPONENTES
import Button from "../Componentes/Button";
import Icon from "../Componentes/Icon";
import DropBox from "../Componentes/DropBox";
import { TextBox, TextArea, Label } from "../Componentes/TextComponent";
import SubTitulo from "./SubTitle";

//ICONOS
import addIcon from "../Componentes/Iconos/new.png";
import details from "../Componentes/Iconos/details.png";
import ioProducto from "../Componentes/Iconos/ioProducto.png";
import updateIcon from "../Componentes/Iconos/updateIcon.png";
import productoIcon from "../Componentes/Iconos/productoIcon.png";
import stockIcon from "../Componentes/Iconos/stock.png";
import priceIcon from "../Componentes/Iconos/priceIcon.png";
import proveedorIcon from "../Componentes/Iconos/proveedorIcon.png";
import newIcon from "../Componentes/Iconos/preparando.png";
import backIcon from "../Componentes/Iconos/back.png";
import historyIcon from "../Componentes/Iconos/history.png";


//ESTILOS DE COMPONENTES
const ModalOverlay = styled.div` //Fondo del modal
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

const ModalContent = styled.div` //Contenido del modal
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

  Max-height: 90vh;
  overflow-y: auto;

    /* Scrollbar personalizado (WebKit) */
  &::-webkit-scrollbar {
    width: 8px;
  }

  // &::-webkit-scrollbar-track {
  //   background: #f1f1f1;
  //   border-radius: 4px;
  // }

  &::-webkit-scrollbar-thumb {
    background:rgb(189, 165, 147);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
`;

const Section = styled.div`      //Contenedor de Boton de volver
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-bottom: 1px solid #b3815d;
  padding-bottom: 0.5rem;
`;
const VolverBtn = styled.a`      //Boton de volver
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

const Section2 = styled.div`      //Contenedor de Formulario por Columnas
  display: flex;
//   flex-direction: column;
  gap: 1rem;
`;

const ModalProducto = ({ showModal, handleCloseModal, mode, onSave, productoSeleccionado, productosDisponibles }) => {
    if (!showModal) return null;

    const usuarioLogueado = localStorage.getItem("usuario");
    const usuario = usuarioLogueado ? JSON.parse(usuarioLogueado) : null;
    const UsrID = usuario?.usuarioId;

    const [formData, setFormData] = useState({

        solicitudId: "",
        tipoMovimiento: "Entrada",
        motivoMovimiento: "NuevoProducto"
    });



    const tiposMovimiento = [
        { value: "Entrada", label: "Entrada de Producto" },
        { value: "Salida", label: "Salida de Producto" }
    ];

    const motivosMovimiento = {
        Entrada: [
            { value: "NuevoProducto", label: "Nuevo Producto" },
            { value: "ReStock", label: "ReStock" },
            // { value: "Devolucion", label: "Devolución" }
        ],
        Salida: [
            // { value: "Venta", label: "Venta a Cliente" },
            { value: "Merma o Perdida", label: "Merma/Pérdida" }
        ]
    };

    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);


    const [solicitudes, setSolicitudes] = useState([]);

    useEffect(() => {
        if (mode === "MovStock") {
            fetchSolicitudesPendientes();
        }
    }, [mode]);


    const fetchSolicitudesPendientes = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/solicitudes?estado=Enviado");
            const result = await res.json();
            if (result.success) {
                setSolicitudes(result.data);
            } else {
                console.error("Error en la respuesta:", result.error);
            }
        } catch (err) {
            console.error("Error cargando solicitudes:", err);
        }
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
                stock: productoSeleccionado.stock || 0,
                proveedor: `${productoSeleccionado.proveedor?.proveedorId} - ${productoSeleccionado.proveedor?.nombre}` || "",
            });
        } if (mode === "MovStock" && productoSeleccionado) {
            setFormData({
                solicitudId: "",
                tipoMovimiento: "Entrada",
                motivoMovimiento: "ReStock",
            });
        }
    }, [productoSeleccionado, showModal, mode]);

    const [modalAbierto, setModalAbierto] = useState(false);

    const abrirModalConSolicitud = async (solicitudId) => {
        try {
            const res = await fetch(`http://localhost:3000/api/solicitudes/?${solicitudId}`);
            const result = await res.json();
            if (result.success) {
                setSolicitudSeleccionada(result.data);

                setModalAbierto(true);
            } else {
                console.error("Error al cargar la solicitud:", result.error);
            }
        } catch (err) {
            console.error("Error al cargar la solicitud:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.descripcion || !formData.precio) {
            toast.error("Faltan campos requeridos");
            return;
        }

        if (mode === "nuevo") {
            if (!formData.proveedorId) {
                toast.error("Proveedor no válido");
                return;
            }
            const producto = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: Number(formData.precio),
                stock: Number(formData.stock),
                proveedor: formData.proveedor
            };


            onSave(producto);
        } else if (mode === "MovStock") {
            if (!formData.stock || !formData.solicitudId) {
                toast.error("Debe especificar cantidad y seleccionar una solicitud");
                return;
            }

            const cantidad = Number(formData.stock);

            const movimiento = {
                cantidad: formData.tipoMovimiento === "Salida" ? -cantidad : cantidad,
                tipoMovimiento: formData.tipoMovimiento,
                motivo: formData.motivoMovimiento,
                usuarioId: UsrID,
                fechaMovimiento: new Date().toISOString(),
                solicitudId: formData.solicitudId // Asociar movimiento con la solicitud
            };

            const productoActualizado = {
                productoId: productoSeleccionado.productoId,
                stock: formData.tipoMovimiento === "Salida"
                    ? productoSeleccionado.stock - cantidad
                    : productoSeleccionado.stock + cantidad,
                historialInventario: [...productoActual.historialInventario, movimiento]
            };

            // Enviar producto actualizado
            await onSave(productoActualizado);

            // Opcional: actualizar estado de la solicitud a "Completada"
            try {
                await fetch(`http://localhost:3000/api/solicitudes/${formData.solicitudId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ estado: "Completada" })
                });
            } catch (err) {
                console.error("Error al actualizar estado de solicitud:", err);
            }
        }
        else if (mode === "editar") {
            const producto = {
                productoId: productoSeleccionado?.productoId,
                descripcion: formData.descripcion,
                precio: Number(formData.precio)
            };


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
            case "MovStock":
                return { title: "Movimiento de Stock", buttonText: "Registrar Ingreso", icon: updateIcon };
            default:
                return { title: "Producto", buttonText: "Guardar", icon: newIcon };
        }
    };

    const { title, buttonText, icon } = getModalConfig();

    const campos = [
        { icon: productoIcon, label: "Producto", key: "nombre", disabled: ["editar", "MovStock"] },
        { icon: proveedorIcon, label: "Proveedor", key: "proveedor", disabled: ["editar"] },
        { icon: stockIcon, label: "En Inventario", key: "stock", disabled: ["editar"] },
        { icon: priceIcon, label: "Precio", key: "precio", disabled: ["MovStock"] },
    ];
    const handleTipoMovimientoChange = (e) => {
        const selectedTipo = e.target.value;
        setFormData({
            ...formData,
            tipoMovimiento: selectedTipo,
            motivoMovimiento: motivosMovimiento[selectedTipo]?.[0]?.value || '',
        });
    };

    const handleMotivoMovimientoChange = (e) => {
        setFormData({ ...formData, motivoMovimiento: e.target.value });
    };

    const handleSolicitudChange = (e) => {
        const selectedSolicitudId = Number(e.target.value); // Convierte a número el valor seleccionado
        const selected = solicitudes.find(s => s.solicitudId === selectedSolicitudId);
        if (selected) {
            setSolicitudSeleccionada(selected); // Actualiza el estado con la solicitud seleccionada
            setFormData({
                ...formData,
                solicitudId: selectedSolicitudId,
                solicitud: selected
            });
        } else {
            setSolicitudSeleccionada(null);
        }
    };

    const registrarDesdeSolicitud = async () => {
        if (!solicitudSeleccionada) return toast.error("No hay solicitud seleccionada");

        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const usuarioId = usuario?.usuarioId;

        for (const item of solicitudSeleccionada.productos) {
            const movimiento = {
                cantidad: item.cantidad,
                tipoMovimiento: "Entrada",
                motivo: item.nombreTemporal ? "Nuevo Producto" : "ReStock",
                usuarioId,
                fechaMovimiento: new Date().toISOString(),
                detalles: {
                    solicitudId: solicitudSeleccionada.solicitudId
                }
            };

            if (item.nombreTemporal) {
                // Producto nuevo
                const nuevoProducto = {
                    nombre: item.nombreTemporal,
                    descripcion: "", // vacía por ahora
                    precio: Number((item.costoUnitario * 1.2).toFixed(2)), // 20% margen
                    stock: Number(item.cantidad),
                    proveedor: solicitudSeleccionada.proveedor._id,

                    historialInventario: [movimiento]
                    // historialInventario: [...productoActual.historialInventario, movimiento]   Anterior
                };
                console.log("Proveedor de la solicitud:", solicitudSeleccionada.proveedor);
                console.log("Nuevo producto a guardar:", nuevoProducto);

                await onSave(nuevoProducto); // Esto hace POST

            } else {
                // Producto existente: hacer patch
                const productoActual = productosDisponibles.find(p => p.productoId === item.productoId);
                if (!productoActual) continue;

                const productoActualizado = {
                    productoId: productoActual.productoId,
                    stock: productoActual.stock + item.cantidad,
                    historialInventario: [...productoActual.historialInventario, movimiento]
                };
                console.log("Producto actual:", productoActual);
                console.log("Movimiento a agregar:", movimiento);
                console.log("Producto a actualizar:", productoActualizado);

                await onSave(productoActualizado); // Esto hace PATCH
            }
        }

        // Marcar solicitud como recibida
        await fetch(`http://localhost:3000/api/solicitudes/${solicitudSeleccionada.solicitudId}/recibir`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioRecibe: usuarioId })
        });

        toast.success("Productos registrados y solicitud marcada como Recibida");
        handleCloseModal(); // cerrar modal
    };


    const registrarSalidaPorMerma = async () => {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const usuarioId = usuario?.usuarioId;

        if (!formData.productoId || !formData.cantidad || formData.cantidad <= 0) {
            return toast.error("Seleccione un producto y cantidad válida");
        }

        const producto = productosDisponibles.find(p => p.productoId === formData.productoId);
        if (!producto) return toast.error("Producto no encontrado");

        if (formData.cantidad > producto.stock) {
            return toast.error("Cantidad supera el stock disponible");
        }

        const movimiento = {
            cantidad: formData.cantidad,
            tipoMovimiento: "Salida",
            motivo: formData.motivoMovimiento || "Merma",
            usuarioId,
            fechaMovimiento: new Date().toISOString(),
            detalles: {
                nota: formData.nota || ""
            }
        };

        const productoActualizado = {
            productoId: producto.productoId,
            stock: producto.stock - formData.cantidad,
            historialInventario: [...producto.historialInventario, movimiento]
        };

        await onSave(productoActualizado); // PATCH al producto
        toast.success("Salida registrada correctamente");
        handleCloseModal(); // cerrar modal
    };





    return (
        <ModalOverlay>
            <ModalContent>
                <Section>
                    <VolverBtn onClick={handleCloseModal}>
                        <Icon src={backIcon} /> Volver
                    </VolverBtn>
                </Section>


                <SubTitulo stitle={title} />

                <Section2>

                    {mode === "MovStock" && (

                        <>
                            <Section style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Label>
                                    <Icon src={ioProducto} /> Tipo de Movimiento
                                    <DropBox
                                        value={formData.tipoMovimiento}
                                        onChange={handleTipoMovimientoChange}
                                    >
                                        {tiposMovimiento.map((tipo) => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </option>
                                        ))}
                                    </DropBox>
                                </Label>


                                {formData.tipoMovimiento === "Salida" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        <Label>
                                            <Icon src={details} /> Motivo
                                            <DropBox
                                                value={formData.motivoMovimiento}
                                                onChange={handleMotivoMovimientoChange}
                                            >
                                                {motivosMovimiento.Salida.map((motivo) => (
                                                    <option key={motivo.value} value={motivo.value}>
                                                        {motivo.label}
                                                    </option>
                                                ))}
                                            </DropBox>
                                        </Label>


                                        <Label>
                                            <Icon src={historyIcon} /> Producto retirado:
                                            <DropBox
                                                value={formData.productoId}
                                                onChange={handleSolicitudChange}
                                            >
                                                <option value="">Seleccione producto</option>
                                                {productosDisponibles.map(p => (
                                                    <option key={p.productoId} value={p.productoId}>{p.nombre}</option>
                                                ))}
                                            </DropBox>
                                        </Label>
                                        <Label>
                                            <Icon src={details} /> Cantidad:
                                            <TextBox defaultValue={0} type="number" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })} >

                                            </TextBox>
                                        </Label>
                                        <Label>Nota:
                                            <TextArea value={formData.nota}  onChange={(e) => setFormData({ ...formData, nota: e.target.value })}/>
                                        </Label>
                                        <div>
                                        <Button onClick={console.log(formData)}>
                                            Registrar Salida
                                        </Button>
                                        </div>

                                    </div>
                                )}

                                {formData.tipoMovimiento === "Entrada" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        <Label>
                                            <Icon src={historyIcon} /> Productos Recibidos
                                            <DropBox
                                                value={formData.solicitudId}
                                                onChange={handleSolicitudChange}
                                            >
                                                <option value="">Seleccione una solicitud</option>
                                                {solicitudes.map((sol) => (
                                                    <option key={sol.solicitudId} value={sol.solicitudId}>
                                                        #{sol.solicitudId} - {sol.proveedor?.nombre || 'Proveedor desconocido'}
                                                    </option>
                                                ))}
                                            </DropBox>
                                        </Label>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <Button onClick={registrarDesdeSolicitud}>
                                                Registrar Productos
                                            </Button>
                                        </div>
                                    </div>
                                )}


                            </Section>

                            {solicitudSeleccionada && (

                                <Section style={{
                                    display: "flex",
                                    flexDirection: "column", gap: "10px",
                                    backgroundColor: "rgb(255, 255, 255)",
                                    padding: "1rem",
                                    borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                    border: "2px solid #b3815d"
                                }}>
                                    <h2>Solicitud #{solicitudSeleccionada.solicitudId}</h2>
                                    <div>
                                        <strong>Proveedor:</strong> {solicitudSeleccionada.proveedor?.nombre || 'Desconocido'}
                                    </div>
                                    <div>
                                        <strong>Estado:</strong> {solicitudSeleccionada.estado}
                                    </div>
                                    <div>
                                        <strong>Solicitada por:</strong> Usuario #{solicitudSeleccionada.usuarioSolicita}
                                    </div>
                                    <div>
                                        <strong>Fecha de solicitud:</strong> {new Date(solicitudSeleccionada.fechaSolicitud).toLocaleString()}
                                    </div>
                                    <hr />
                                    <h3>Productos solicitados</h3>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Cantidad</th>
                                                <th>Costo Unitario</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {solicitudSeleccionada.productos?.map((p, index) => (
                                                <tr key={index}>
                                                    <td>{p.producto?.nombre || 'Producto desconocido'}</td>
                                                    <td>{p.cantidad}</td>
                                                    <td>${p.costoUnitario.toFixed(2)}</td>
                                                    <td>${p.subtotal.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ textAlign: "right", marginTop: "1rem" }}>
                                        <strong>Total:</strong> ${solicitudSeleccionada.total.toFixed(2)}
                                    </div>

                                </Section>
                            )}


                        </>

                    )}
                    {mode === "editar" && (
                        <Section>
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
                            <Label key={"descripcion"} >
                                <Icon src={details} /> Descripción
                                <TextArea value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />


                            </Label>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <Button onClick={handleSubmit}>
                                    <Icon src={icon} /> {buttonText}
                                </Button>
                            </div>

                        </Section>)
                    }


                </Section2>

            </ModalContent>
        </ModalOverlay>
    );
};
export default ModalProducto;
