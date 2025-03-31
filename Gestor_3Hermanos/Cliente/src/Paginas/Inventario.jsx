

import React, { useState } from 'react';
import styled from 'styled-components';
import { Table, Th, Td } from '../Componentes/Table';
import Button from '../Componentes/Button';
import Icon from '../Componentes/Icon';
import { TextBox } from '../Componentes/TextComponent';
import SubTitle from '../Componentes/SubTitle';
import DropBox from '../Componentes/DropBox';

import Header from '../Componentes/Header';
import MainContainer from '../Componentes/MainContainer';
import ModalProducto from '../Componentes/ModalProducto';

// Iconos (puedes reemplazar con tus propios assets)
import searchIcon from '../Componentes/Iconos/buscar.png';
import addIcon from '../Componentes/Iconos/add.png';
import editIcon from '../Componentes/Iconos/edit.png';
import details from '../Componentes/Iconos/details.png';
import idIcon from '../Componentes/Iconos/id.png';
import productoIcon from '../Componentes/Iconos/productoIcon.png';
import stockIcon from '../Componentes/Iconos/stock.png';
import priceIcon from '../Componentes/Iconos/priceIcon.png';
import proveedorIcon from '../Componentes/Iconos/proveedorIcon.png';
import newIcon from '../Componentes/Iconos/preparando.png';
import historyIcon from '../Componentes/Iconos/history.png';


import backIcon from "../Componentes/Iconos/back.png";


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



//  **Estilos del modal**
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
  Border: 4px dashed #b3815d;
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


// Componente principal
function GestionInventario() {
    // Estado para el producto seleccionado
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [producto, setProducto] = useState({
        codigo: "",
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        proveedor: "",
    });



    // Datos de ejemplo basados en tu modelo
    const productos = [
        {
            productoId: 1001,
            nombre: 'Chuleta de Cerdo',
            descripcion: 'Chuleta de cerdo fresca',
            precio: 150.00,
            stock: 20,
            proveedor: {
                nombre: 'Carnes del Norte',
                contacto: 'Juan Pérez - 555-123456'
            },
            historialInventario: [
                {
                    cantidad: 10,
                    tipoMovimiento: 'Entrada',
                    fechaMovimiento: '2025-03-25',
                    usuarioId: 1
                },
                {
                    cantidad: -5,
                    tipoMovimiento: 'Salida',
                    fechaMovimiento: '2025-03-20',
                    usuarioId: 2
                }
            ]
        },
        {
            productoId: 1002,
            nombre: 'Lomo de Cerdo',
            descripcion: 'Lomo de cerdo fresco',
            precio: 120.00,
            stock: 15,
            proveedor: {
                nombre: 'Avícola Sureña',
                contacto: 'María Gómez - 555-654321'
            },
            historialInventario: [
                {
                    cantidad: 15,
                    tipoMovimiento: 'Entrada',
                    fechaMovimiento: '2025-03-22',
                    usuarioId: 1
                }
            ]
        }
    ];

    // Filtrar productos basado en la búsqueda
    const filteredProducts = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.productoId.toString().includes(searchTerm)
    );
    const handleCloseModal = () => {
        setShowModal(false);
    };



    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("nuevo");

    const [mode, setMode] = useState("default");

    const openModal = (newMode) => {
        setMode(newMode);
        setShowModal(true);
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
                            <ModalProducto mode={mode} showModal={showModal} handleCloseModal={handleCloseModal} />
                        )}



                    </FilterSection>
                </HeaderSection>

                <Table>
                    <thead>
                        <tr>
                            <Th>🏷️ ID</Th>
                            <Th>📦 Nombre</Th>
                            <Th>📉 Stock</Th>
                            <Th>💲 Precio</Th>
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
                                <Td>{producto.stock} kg</Td>
                                <Td>${producto.precio.toFixed(2)}</Td>
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
                                <Button size="medium" variant="primary" onClick={() => openModal("editar")}>
                                    <Icon src={editIcon} /> Editar
                                </Button>
                                <Button size="medium" variant="secondary" onClick={() => openModal("agregarStock")}>
                                    <Icon src={stockIcon} /> Agregar Stock
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