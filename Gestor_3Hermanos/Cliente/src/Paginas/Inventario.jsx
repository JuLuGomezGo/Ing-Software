

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';

// Componentes Basicos
import { Table, Th, Td } from '../Componentes/Table';
import Button from '../Componentes/Button';
import Icon from '../Componentes/Icon';
import { TextBox } from '../Componentes/TextComponent';
import SubTitle from '../Componentes/SubTitle';

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

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  max-width: 500px;
  
  input {
    flex-grow: 1;
    padding: 8px 12px;
    border: 1px solid #8B572A;
    border-radius: 4px;
  }
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
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Seguridad añadida
                },
                ...(body && { body: JSON.stringify(body) })
            };

            const response = await fetch(`${API_URL}/${endpoint}`, options);
            const data = await response.json();

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

        // Definir si es POST (nuevo) o PATCH (editar/agregar stock)
        const isNuevo = mode === "nuevo";
        const url = isNuevo
            ? "http://localhost:3000/api/productos" // POST sin ID en la URL
            : `http://localhost:3000/api/productos/${producto.productoId}`; // PATCH con ID

        const method = isNuevo ? "POST" : "PATCH";

        try {
            console.log("Enviando producto:", JSON.stringify(producto, null, 2));
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(producto)
            });

            const data = await response.json();
            console.log("Respuesta del servidor:", data); // Agregar este log

            if (!response.ok) throw new Error(data.message || "Error al actualizar");

            // Actualizar la lista de productos
            if (!isNuevo) {
                setProductos(prev =>
                    prev.map(prod => prod.productoId === data.data.productoId ? data.data : prod)
                );
            } else {
                setProductos(prev => [...prev, data.data]);
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




    // ACTUALIZAR STOCK
    // Función para agregar stock con todas las validaciones
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

                    <SearchBar>
                        <Icon src={searchIcon} />
                        <TextBox
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchBar>

                    <FilterSection>
                        <Button size="medium" variant="secondary">Filtros</Button>
                        <Button size="medium" variant="primary" onClick={() => openModal("nuevo")}>
                            <Icon src={addIcon} /> Nuevo Producto
                        </Button>


                        {showModal && (
                            <ModalProducto
                                mode={mode}
                                showModal={showModal}
                                handleCloseModal={handleCloseModal}
                                productoSeleccionado={productoEnModal}
                                onSave={(handleGuardarProducto)}

                            />
                        )}



                    </FilterSection>
                </HeaderSection>

                <Table>
                    <thead>
                        <tr>
                            <Th>🏷️ ID</Th>
                            <Th>📦 Nombre</Th>
                            <Th>💲 Precio</Th>
                            <Th>📉 Stock</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(producto => (
                            <tr
                                key={producto.productoId}
                                onClick={() => setSelectedProduct(producto)}
                                style={{ cursor: 'pointer', backgroundColor: selectedProduct?.productoId === producto.productoId ? '#e5c49f' : 'inherit' }}
                            >
                                <Td>{producto.productoId}</Td>
                                <Td>{producto.nombre}</Td>
                                <Td>${producto.precio.toFixed(2)}</Td>
                                <Td>{producto.stock} kg</Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {selectedProduct ? (
                    <ProductDetailSection>
                        <ProductInfo>
                            <h3>📜 Detalles del Producto</h3>
                            <p><strong>📌 Nombre:</strong> {selectedProduct.nombre}</p>
                            <p><strong>🏷️ ID:</strong> {selectedProduct.productoId}</p>
                            <p><strong>📦 Stock:</strong> {selectedProduct.stock} kg</p>
                            <p><strong>💲 Precio:</strong> ${selectedProduct.precio.toFixed(2)}</p>
                            <p><strong>🚚 Proveedor:</strong> {selectedProduct.proveedor.nombre}</p>
                            <p><strong>📞 Contacto:</strong> {selectedProduct.proveedor.contacto}</p>

                            <ActionButtons>
                                <Button size="medium" variant="primary" onClick={() => {
                                    setProductoEnModal(selectedProduct);
                                    openModal("editar");
                                }}>
                                    <Icon src={editIcon} /> Editar
                                </Button>
                                <Button size="medium" variant="secondary" onClick={() => {
                                    setProductoEnModal(selectedProduct);
                                    openModal("agregarStock")
                                }}>
                                    <Icon src={stockIcon} /> Agregar Stock
                                </Button>
                                <Button size="medium" variant="danger" onClick={() => {
                                    if (window.confirm(`¿Está seguro de eliminar el producto ${selectedProduct.nombre}?`)) {
                                        handleDeleteProducto(selectedProduct.productoId);
                                    }
                                }}>
                                    <Icon src={deleteIcon} /> Eliminar
                                </Button>
                                <Button size="medium" variant="secondary">
                                    <Icon src={historyIcon} /> Ver Solicitudes
                                </Button>
                            </ActionButtons>
                        </ProductInfo>

                        <MovementHistory>
                            <h3>📊 Historial de Movimientos</h3>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>📅 Fecha</Th>
                                        <Th>🔄 Tipo</Th>
                                        <Th>📉 Cantidad</Th>
                                        <Th>👤 Usuario</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProduct.historialInventario.map((movimiento, index) => (
                                        <tr key={index}>
                                            <Td>{movimiento.fechaMovimiento}</Td>
                                            <Td>{movimiento.tipoMovimiento}</Td>
                                            <Td>{movimiento.cantidad > 0 ? `+${movimiento.cantidad}` : movimiento.cantidad} kg</Td>
                                            <Td>{movimiento.usuarioId}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
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
