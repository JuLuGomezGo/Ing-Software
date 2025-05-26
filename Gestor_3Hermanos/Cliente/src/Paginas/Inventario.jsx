

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { useNavigate } from "react-router-dom";

// Componentes Basicos
import { Table, Th, Td, Tr, Tbody, Thead, Tcontainer } from '../Componentes/Table';
import Button from '../Componentes/Button';
import Icon from '../Componentes/Icon';
import { TextBox } from '../Componentes/TextComponent';
import SubTitle from '../Componentes/SubTitle';
import SearchBar from '../Componentes/Search';

// Componentes Compuestos
import Header from '../Componentes/Header';
import MainContainer from '../Componentes/MainContainer';
import ModalProducto from '../Componentes/ModalProducto';

// Iconos
import searchIcon from '../Componentes/Iconos/buscar.png';
import addIcon from '../Componentes/Iconos/add.png';
import editIcon from '../Componentes/Iconos/edit.png';
import stockIcon from '../Componentes/Iconos/stock.png';
import historyIcon from '../Componentes/Iconos/history.png';
import deleteIcon from '../Componentes/Iconos/delete.png';
import proveedorIcon from "../Componentes/Iconos/proveedorIcon.png";


// Estilos principales
const InventarioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: #f9f4ee;
  border-radius: 8px;
  border: 2px solid #8B572A;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
`;


const FilterSection = styled.div`
  display: flex;
  gap: 10px;
`;

const ProductDetailSection = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 300px;
  background-color: #eee4da;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #a96e3b;
`;

const MovementHistory = styled.div`
  flex: 1;
  min-width: 300px;
  background-color: #eee4da;
  padding: 15px;
  margin: 0;
  border-radius: 8px;
  border: 1px solid #a96e3b;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
`;


// Componente principal
function GestionInventario() {
    const navigate = useNavigate();

    // Estado para el producto seleccionado
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [productoEnModal, setProductoEnModal] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [producto, setProducto] = useState({
        codigo: "",
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        proveedor: "",
    });

    // Datos de ejemplo basados en el modelo
    const [productos, setProductos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("nuevo");
    const [mode, setMode] = useState("default");


    // Filtrar productos basado en la búsqueda
    const filteredProducts = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.productoId.toString().includes(searchTerm)
    );
    const handleCloseModal = () => {
        setShowModal(false);
    };
    const openModal = (newMode) => {
        setMode(newMode);
        setShowModal(true);
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

    // Función genérica para peticiones
    const apiRequest = async (method, endpoint, body = null) => {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                ...(body && { body: JSON.stringify(body) })
            };

            const response = await fetch(`${API_URL}/${endpoint}`, options);
            const data = await response.json();
            console.log(data); // Para ver la respuesta completa y el mensaje de error


            if (!response.ok) {
                throw new Error(data.error || "Error en la solicitud");
            }

            return data;
        } catch (error) {
            console.error(`Error ${method} ${endpoint}:`, error);
            throw error;
        }
    };



    // OBTENER PRODUCTOS
    const fetchProductos = async () => {
        try {
            const data = await apiRequest("GET", "productos");
            setProductos(data.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };




    const handleGuardarProducto = async (producto) => {
        if (!producto) {
            console.error("Producto no definido en handleGuardarProducto");
            return;
        }

        const isNuevo = !producto.productoId;

        const url = isNuevo
            ? "http://localhost:3000/api/productos"
            : `http://localhost:3000/api/productos/${producto.productoId}`;

        const method = isNuevo ? "POST" : "PATCH";

        // Si es restock, asegurarse de que se acumula historial
        let body = producto;

        if (!isNuevo && producto.historialInventario?.length) {
            // Buscar el producto actual para preservar historial existente
            const productoActual = productos.find(p => p.productoId === producto.productoId);
            if (productoActual) {
                body = {
                    ...producto,
                    historialInventario: [
                        ...(productoActual.historialInventario || []),
                        ...producto.historialInventario
                    ]
                };
            }
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(body)
            });
            console.log("Datos a enviar:", response);

            const data = await response.json();
            console.log(data);
            if (!response.ok) throw new Error(data.message || "Error al actualizar");

            // Actualizar lista de productos localmente
            if (isNuevo) {
                setProductos(prev => [...prev, data.data]);
            } else {
                setProductos(prev =>
                    prev.map(p => p.productoId === data.data.productoId ? data.data : p)
                );

                // Actualizar producto seleccionado si corresponde
                if (selectedProduct?.productoId === data.data.productoId) {
                    setSelectedProduct(data.data);
                }
            }

            toast.success(data.message || "Producto actualizado");
            handleCloseModal();

        } catch (error) {
            toast.error(error.message);
            console.error("Detalles del error:", error);
        }
    };




    const handleDeleteProducto = async (productoId) => {
        try {
            await apiRequest("DELETE", `productos/${productoId}`);
            setProductos(prev => prev.filter(p => p.productoId !== productoId));
            setSelectedProduct(null);
            toast.success("Producto eliminado exitosamente");
        } catch (error) {
            toast.error(error.message || "Error al eliminar producto");
        }
    };



    const handleAgregarStock = async (productoId, cantidad, usuarioId) => {
        try {
            // 1. Buscar producto actual en el estado
            const productoActual = productos.find(p => p.productoId === productoId);
            if (!productoActual) throw new Error("Producto no encontrado");

            // 2. Calcular nuevo stock
            const nuevoStock = productoActual.stock + cantidad;
            if (nuevoStock < 0) throw new Error("Stock no puede ser negativo");

            // 3. Crear movimiento
            const movimiento = {
                cantidad,
                tipoMovimiento: "Entrada",
                usuarioId,
                fechaMovimiento: new Date().toISOString()
            };

            // 4. Enviar petición
            const response = await apiRequest("PUT", `productos/${productoId}`, {
                stock: nuevoStock,
                historialInventario: [movimiento]
            });

            // 5. Actualizar estado local de forma optimista
            setProductos(prev =>
                prev.map(p => p.productoId === productoId ? {
                    ...p,
                    stock: response.data.stock,
                    historialInventario: [
                        ...p.historialInventario,
                        ...response.data.historialInventario
                    ]
                } : p)
            );

            // 6. Notificación al usuario
            toast.success("Stock actualizado correctamente");

        } catch (error) {
            console.error("Error al actualizar stock:", error);
            toast.error(error.message);
        }
    };


    return (
        <MainContainer>

            <Header />
            <InventarioContainer>
                <HeaderSection>
                    <SubTitle stitle="Gestión de Inventario" />

                    <SearchBar ancho="90px">

                        <Icon src={searchIcon} />
                        <TextBox
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchBar>

                    <FilterSection>
                        
                        <Button size="medium" variant="secondary" 
                        onClick={() => {
                            setProductoEnModal(selectedProduct);
                            openModal("MovStock")
                        }}>
                            <Icon src={stockIcon} /> Mov. Productos
                        </Button>
                        <Button onClick={() => navigate('/solicitudProducto')}>
                            <Icon src={historyIcon} /> Solicitudes
                        </Button>
                        <Button onClick={() => navigate('/gestion-proveedores')}>
                            <Icon src={proveedorIcon} />Proveedores
                        </Button>


                        {showModal && (
                            <ModalProducto
                                mode={mode}
                                showModal={showModal}
                                handleCloseModal={handleCloseModal}
                                productoSeleccionado={productoEnModal}
                                onSave={(handleGuardarProducto)}
                                productosDisponibles={productos}

                            />
                        )}



                    </FilterSection>
                </HeaderSection>

                <Tcontainer $scroll={filteredProducts.length > 6} $rows={6}>
                    <Table >
                        <Thead>
                            <Tr>
                                <Th>🏷️ ID</Th>
                                <Th>📦 Nombre</Th>
                                <Th>💲 Precio</Th>
                                <Th>📉 Stock</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredProducts.map((producto, index) => (
                                <Tr
                                    key={producto.productoId}
                                    onClick={() => setSelectedProduct(producto)}
                                    className={selectedProduct?.productoId === producto.productoId ? "selected" : ""}
                                    index={index}
                                >
                                    <Td>{producto.productoId}</Td>
                                    <Td>{producto.nombre}</Td>
                                    <Td>${producto.precio.toFixed(2)}</Td>
                                    <Td>{producto.stock} kg</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Tcontainer>

                {selectedProduct ? (
                    <ProductDetailSection>
                        <ProductInfo>
                            <h3>📜 Detalles del Producto</h3>
                            <p><strong>🏷️ ID:</strong> {selectedProduct.productoId}</p>
                            <p><strong>📌 Nombre:</strong> {selectedProduct.nombre}</p>
                            <p><strong>📝 Descripción:</strong> {selectedProduct.descripcion}</p>
                            <p><strong>💲 Precio:</strong> ${selectedProduct.precio.toFixed(2)}</p>
                            <p><strong>📦 Stock:</strong> {selectedProduct.stock} kg</p>
                            <p><strong>🚚 Proveedor:</strong> {selectedProduct.proveedor.nombre}</p>
                            <p><strong>📞 Contacto:</strong> {selectedProduct.proveedor.contacto} - {selectedProduct.proveedor.email}</p>

                            <ActionButtons>
                                <Button size="medium" variant="primary" onClick={() => {
                                    setProductoEnModal(selectedProduct);
                                    openModal("editar");
                                    console.log("Producto seleccionado:", selectedProduct);
                                }}>
                                    <Icon src={editIcon} /> Editar
                                </Button>
                                <Button size="medium" variant="danger" onClick={() => {
                                    if (window.confirm(`¿Está seguro de eliminar el producto ${selectedProduct.nombre}?`)) {
                                        handleDeleteProducto(selectedProduct.productoId);
                                    }
                                }}>
                                    <Icon src={deleteIcon} /> Eliminar
                                </Button>
                            </ActionButtons>
                        </ProductInfo>

                        <MovementHistory>
                            <h3>📊 Historial de Movimientos</h3>
                            <Tcontainer style={{ paddingLeft: "15px" }}
                                $scroll={selectedProduct.historialInventario.length > 5}
                                $rows={5}>
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th>📅 Fecha</Th>
                                            <Th>💬 Motivo</Th>
                                            <Th>📉 Cant.</Th>
                                            <Th>👤 Usuario</Th>
                                            <Th>🔗 Relación</Th>
                                            <Th>📝 Notas</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {selectedProduct.historialInventario.map((mov, index) => (
                                            <Tr key={index}>
                                                <Td>{new Date(mov.fechaMovimiento).toLocaleString()}</Td>
                                                <Td>{mov.motivo}</Td>
                                                <Td style={{ color: mov.motivo === "Venta a Cliente" ? "red" : "green", fontWeight: 600 }}>
                                                    {mov.motivo === "Venta a Cliente" ? `-${mov.cantidad}` : `+${mov.cantidad}`} kg
                                                </Td>
                                                <Td>{mov.usuarioId}</Td>
                                                <Td>
                                                    {mov.motivo === "Venta a Cliente" && <div>Pedido# {mov.detalles.pedidoId}</div>}
                                                    {(mov.motivo === "ReStock" || mov.motivo === "Nuevo Producto") && <div>Solicitud# {mov.detalles.solicitudId}</div>}
                                                    {/* {mov.cliente && <div>👥 {mov.cliente}</div>} */}
                                                </Td>
                                                <Td>{mov.notas || "—"}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Tcontainer>
                        </MovementHistory>
                    </ProductDetailSection>
                ) : (
                    <p style={{ textAlign: 'center', fontStyle: 'italic' }}>
                        ▶️ Seleccionar un producto para ver detalles
                    </p>
                )}
            </InventarioContainer>
        </MainContainer>
    );
}
export default GestionInventario;
