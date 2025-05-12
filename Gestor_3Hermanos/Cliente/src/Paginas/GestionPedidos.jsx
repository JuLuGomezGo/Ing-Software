import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '../Componentes/Header';
import MainContainer from '../Componentes/MainContainer';
import Icon from "../Componentes/Icon";
import { Table, Th, Td } from "../Componentes/Table";
import Button from "../Componentes/Button";
import SubTitle from "../Componentes/SubTitle";
import { DateBox, TimeBox } from '../Componentes/Date-TimePicker';
import { TextBox, Label } from '../Componentes/TextComponent';
//import backIcon from "../Componentes/Iconos/back.png";
//import nuevPedido from "../Componentes/Iconos/nuevoPedido.png";
import DropBox from "../Componentes/DropBox";

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  border: 3px solid #b3815d;
  border-radius: 10px;
  background-color: #f9f4ee;
`;

const ProductoRow = styled.div`
  display: grid;
  grid-template-columns: auto 0.3fr 0.5fr 0.5fr auto;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
`;

function GestionPedidos() {
    // Estados
    const [productos, setProductos] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [tipoPedido, setTipoPedido] = useState("domicilio"); // Nuevo estado para el tipo de pedido
    const [formData, setFormData] = useState({
        cliente: '',
        direccionEntrega: '',
        telefono: '',
        metodoPago: 'Efectivo',
        fecha: '',
        hora: '',
        usuarioId: 1
    });
    const [items, setItems] = useState([{
        productoId: '',
        cantidad: 0,
        precioUnitario: 0,
        nombre: '',
        subtotal: 0
    }]);
    const [isLoading, setIsLoading] = useState(false);

    // Obtener productos y pedidos al cargar
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Obtener productos
                const productosRes = await fetch('http://localhost:3000/api/productos');
                const productosData = await productosRes.json();
                if (productosData.success) setProductos(productosData.data);

                // Obtener pedidos (últimos 5)
                const pedidosRes = await fetch('http://localhost:3000/api/pedidos');
                const pedidosData = await pedidosRes.json();
                setPedidos(pedidosData.slice(-5).reverse());

            } catch (error) {
                toast.error('Error al cargar datos: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddItem = () => {
        setItems([...items, {
            productoId: '',
            cantidad: 1,
            precioUnitario: 0,
            nombre: '',
            subtotal: 0
        }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length > 1) {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];

        if (field === 'productoId') {
            const selectedProduct = productos.find(p => p.productoId.toString() === value);
            newItems[index] = {
                ...newItems[index],
                productoId: value,
                nombre: selectedProduct?.nombre || '',
                precioUnitario: selectedProduct?.precio || 0,
                subtotal: (selectedProduct?.precio || 0) * newItems[index].cantidad
            };
        } else if (field === 'cantidad') {
            const cantidad = Number(value) > 0 ? Number(value) : 1;
            newItems[index] = {
                ...newItems[index],
                cantidad,
                subtotal: newItems[index].precioUnitario * cantidad
            };
        }

        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (items.some(item => Number(item.productoId) <= 0 || item.cantidad <= 0)) {
            toast.error('Complete correctamente todos los productos');
            setIsLoading(false);
            return;
        }

        try {
            const pedidoId = Date.now();
            const productosParaEnviar = items.map(item => ({
                productoId: item.productoId,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario
            }));

            const total = items.reduce((sum, item) => sum + item.subtotal, 0);

            const response = await fetch('http://localhost:3000/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pedidoId,
                    ...formData,
                    cliente: tipoPedido === "local" ? "local" : formData.cliente, // Añadir "local" si corresponde
                    direccionEntrega: tipoPedido === "local" ? "local" : formData.direccionEntrega,
                    productos: productosParaEnviar,
                    total,
                    estado: 'Pendiente',
                    fecha: new Date(),
                    fechaEntrega: `${formData.fecha} ${formData.hora}`
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear pedido');
            }

            toast.success('Pedido creado exitosamente');

            // Resetear formulario
            setItems([{
                productoId: '',
                cantidad: 0,
                precioUnitario: 0,
                nombre: '',
                subtotal: 0
            }]);

            setFormData({
                cliente: '',
                direccionEntrega: '',
                telefono: '',
                metodoPago: 'Efectivo',
                fecha: '',
                hora: '',
                usuarioId: 1
            });

            setTipoPedido("domicilio"); // Resetear tipo de pedido

            // Actualizar lista de pedidos
            const pedidosRes = await fetch('http://localhost:3000/api/pedidos');
            const pedidosData = await pedidosRes.json();
            setPedidos(pedidosData.slice(-5).reverse());

        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainContainer>
            <Header />
            <Container>
                <ToastContainer position="bottom-right" autoClose={3000} />

                <SubTitle stitle={"Nuevo Pedido"}></SubTitle>
                <form onSubmit={handleSubmit}>
                    {/* Tipo de Pedido */}
                    <div style={{ marginBottom: '20px' }}>
                        <Label>Tipo de Pedido:</Label>
                        <DropBox
                            value={tipoPedido}
                            onChange={(e) => setTipoPedido(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="domicilio">Domicilio</option>
                            <option value="local">Local</option>
                        </DropBox>
                    </div>

                    {/* Sección de productos */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3>Detalles de Pedido</h3>
                        {items.map((item, index) => (
                            <ProductoRow key={index}>
                                <DropBox
                                    style={{ width: 'fit-content' }}
                                    value={item.productoId}
                                    onChange={(e) => handleItemChange(index, 'productoId', e.target.value)}
                                    required
                                    disabled={isLoading}
                                >
                                    <option value="">Seleccionar producto</option>
                                    {productos.map(producto => (
                                        <option key={producto.productoId} value={producto.productoId}>
                                            {producto.nombre} (${producto.precio})
                                        </option>
                                    ))}
                                </DropBox>

                                <TextBox
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={item.cantidad}
                                    onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                                    required
                                    disabled={isLoading}
                                />

                                <span>${item.precioUnitario.toFixed(2)}</span>
                                <span>${item.subtotal.toFixed(2)}</span>

                                <Button
                                    variant="primary"
                                    onClick={() => handleRemoveItem(index)}
                                    disabled={isLoading || items.length <= 1}
                                >
                                    ×
                                </Button>
                            </ProductoRow>
                        ))}

                        <Button
                            variant="secondary"
                            onClick={handleAddItem}
                            disabled={isLoading}
                            style={{ marginRight: '10px' }}
                        >
                            + Añadir producto
                        </Button>

                        <div style={{ textAlign: 'right', margin: '15px 85px', fontSize: '1.2em' }}>
                            <strong>Total: ${items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}</strong>
                        </div>
                    </div>

                    {/* Sección de datos del cliente */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3>Detalles de Entrega</h3>
                        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                            <div>
                                <Label>Cliente:</Label>
                                <TextBox
                                    placeholder="Nombre del cliente"
                                    value={formData.cliente}
                                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                                    required
                                    disabled={isLoading || tipoPedido === "local"} // Bloquear si es "local"
                                />
                            </div>

                            <div>
                                <Label>Método de Pago:</Label>
                                <DropBox
                                    value={formData.metodoPago}
                                    onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                                    disabled={isLoading}
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                </DropBox>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <Label>Dirección de Entrega:</Label>
                                <TextBox
                                    placeholder="Dirección de entrega"
                                    value={formData.direccionEntrega}
                                    onChange={(e) => setFormData({ ...formData, direccionEntrega: e.target.value })}
                                    required
                                    disabled={isLoading || tipoPedido === "local"} // Bloquear si es "local"
                                />
                            </div>

                            <div>
                                <Label>Teléfono:</Label>
                                <TextBox
                                    placeholder="Teléfono"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    required
                                    disabled={isLoading || tipoPedido === "local"} // Bloquear si es "local"
                                />
                            </div>

                            <div>
                                <Label>Fecha de Entrega:</Label>
                                <DateBox
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    disabled={isLoading || tipoPedido === "local"} // Bloquear si es "local"
                                />
                            </div>

                            <div>
                                <Label>Hora de Entrega:</Label>
                                <TimeBox
                                    value={formData.hora}
                                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                                    disabled={isLoading || tipoPedido === "local"} // Bloquear si es "local"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        style={{ padding: '10px 20px', fontSize: '1em' }}
                    >
                        {isLoading ? 'Procesando...' : 'Generar Pedido'}
                    </Button>
                </form>

                {/* Lista de últimos pedidos */}
                <div style={{ marginTop: '40px' }}>
                    <h3>Últimos Pedidos</h3>
                    {isLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <Th># Pedido</Th>
                                    <Th>Cliente</Th>
                                    <Th>Estado</Th>
                                    <Th>Total</Th>
                                    <Th>Fecha</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map(pedido => (
                                    <tr key={pedido.pedidoId}>
                                        <Td>{pedido.pedidoId}</Td>
                                        <Td>{pedido.cliente}</Td>
                                        <Td>{pedido.estado}</Td>
                                        <Td>${pedido.total?.toFixed(2)}</Td>
                                        <Td>{new Date(pedido.fecha).toLocaleDateString()}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </Container>
        </MainContainer>
    );
}

export default GestionPedidos;