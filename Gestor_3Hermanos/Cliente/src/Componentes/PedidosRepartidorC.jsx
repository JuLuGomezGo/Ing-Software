import React, { useState } from "react";
import IconMap from "../Componentes/Iconos/map.png"; // <-- Importa el ícono

function PedidosRepartidorC({ pedidos = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [transferData, setTransferData] = useState({});
  const [selectedStates, setSelectedStates] = useState({});

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handlePaymentMethodChange = (index, method) => {
    setPaymentMethods((prev) => ({ ...prev, [index]: method }));
  };

  const handleStateChange = (index, newState) => {
    setSelectedStates((prev) => ({ ...prev, [index]: newState }));
  };

  const handleFinalizarEntrega = async (pedido, index) => {
    try {
      const metodoPago = paymentMethods[index] ?? pedido.metodoPago ?? "";
      const estadoSeleccionado = selectedStates[index] ?? pedido.estado ?? "En proceso";

      const body = {
        estado: estadoSeleccionado,
        metodoPago: metodoPago,
        transferencia: transferData[index] || {},
      };

      const response = await fetch(`http://localhost:3000/api/pedidos/${pedido.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Error al actualizar el pedido");

      toggleExpand(index);
      alert("Pedido actualizado correctamente");
    } catch (error) {
      console.error("Error al finalizar entrega:", error);
      alert("Ocurrió un error al actualizar el pedido");
    }
  };

  return (
    <ul className="pedidos-list">
      {pedidos.map((pedido, index) => {
        const isExpanded = expandedIndex === index;
        const selectedMethod = paymentMethods[index] ?? pedido.metodoPago ?? "";
        const currentTransferData = transferData[index] || {};
        const currentState = selectedStates[index] ?? pedido.estado ?? "En proceso";

        const fechaObj = new Date(pedido.fecha);
        const fechaEntrega = fechaObj.toLocaleDateString("es-MX", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
          timeZone: "America/Mexico_City",
        });

        return (
          <li key={pedido.id} className="pedido-item">
            <div className="summary-card">
              <div className="summary-content">
                <p className="direccion">{pedido.direccion}</p>
                <p className="pedido-id">Pedido {pedido.id}</p>
                <p className="total">Total ${pedido.total}</p>
              </div>
              <div className="summary-footer">
                <p className="cliente">{pedido.nombreCliente}</p>
                <p className="estado">{pedido.estado}</p>
                <span
                  className={`flecha ${isExpanded ? "abierta" : ""}`}
                  onClick={() => toggleExpand(index)}
                >
                  {isExpanded ? "▾" : "➤"}
                </span>
              </div>
            </div>

            <div className={`pedido-expandible ${isExpanded ? "abierto" : ""}`}>
              <div className="detail-card">
                <div className="encabezado-detalle">
                  <div className="encabezado-izq">
                    <p className="numero-pedido">
                      <strong>No. Pedido:</strong> {pedido.id}
                    </p>
                  </div>
                  <div className="encabezado-der">
                    <p className="fecha-entrega">Entrega: {fechaEntrega}</p>
                  </div>
                </div>

                <div className="fila-detalle">
                  <p className="direccion-detalle">
                    <strong>Dirección:</strong> {pedido.direccion}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      pedido.direccion
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={IconMap} alt="Abrir en Google Maps" className="map-icon" />
                  </a>
                </div>

                <div className="fila-detalle">
                  <p className="cliente-detalle">
                    <strong>Cliente:</strong> {pedido.nombreCliente}
                  </p>
                  <select
                    className="estado-select"
                    value={currentState}
                    onChange={(e) => handleStateChange(index, e.target.value)}
                  >
                    <option value="Entregado">Entregado</option>
                    <option value="Pagado">Pagado</option>
                  </select>
                </div>

                <div className="productos-bloque">
                  <h4>Productos</h4>
                  <hr />
                  <table className="productos-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad (Kg)</th>
                        <th>Costo/Kg</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.productos?.map((prod, i) => (
                        <tr key={i}>
                          <td>{prod.nombre}</td>
                          <td>{prod.cantidad}</td>
                          <td>${prod.precioUnitario}</td>
                          <td>${(prod.cantidad * prod.precioUnitario).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" style={{ textAlign: "right" }}>Total:</td>
                        <td>${pedido.total}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <hr />
                </div>

                <div className="metodo-pago-bloque">
                  <h4>Método de Pago</h4>
                  <div className="radio-group-vertical">
                    <label>
                      <input
                        type="radio"
                        name={`metodo-pago-${index}`}
                        value="Efectivo"
                        checked={selectedMethod === "Efectivo"}
                        onChange={() => handlePaymentMethodChange(index, "Efectivo")}
                      />
                      Efectivo
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`metodo-pago-${index}`}
                        value="Tarjeta"
                        checked={selectedMethod === "Tarjeta"}
                        onChange={() => handlePaymentMethodChange(index, "Tarjeta")}
                      />
                      Tarjeta
                    </label>
                  </div>
                </div>

                <div className="detalle-botones">
                  <button
                    className="btn-finalizar"
                    onClick={() => handleFinalizarEntrega(pedido, index)}
                  >
                    Finalizar Entrega
                  </button>
                  <button className="btn-cerrar" onClick={() => toggleExpand(index)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default PedidosRepartidorC;
