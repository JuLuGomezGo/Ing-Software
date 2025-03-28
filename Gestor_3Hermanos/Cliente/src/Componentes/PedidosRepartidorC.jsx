import React, { useState } from "react";

function PedidosRepartidorC({ pedidos = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Método de pago seleccionado por pedido (index => "Efectivo"/"Transferencia")
  const [paymentMethods, setPaymentMethods] = useState({});

  // Datos de transferencia por pedido (index => { cuenta, banco, referencia })
  const [transferData, setTransferData] = useState({});

  // Estado seleccionado por pedido (index => "En proceso", "Entregado", etc.)
  const [selectedStates, setSelectedStates] = useState({});

  // Abre/cierra la vista detalle
  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Cambia el método de pago para un pedido específico
  const handlePaymentMethodChange = (index, method) => {
    setPaymentMethods((prev) => ({ ...prev, [index]: method }));
  };

  // Cambia el valor de un campo de transferencia
  const handleTransferFieldChange = (index, field, value) => {
    setTransferData((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    }));
  };

  // Cambia el estado seleccionado en el <select>
  const handleStateChange = (index, newState) => {
    setSelectedStates((prev) => ({ ...prev, [index]: newState }));
  };

  // Llamada al backend para finalizar entrega
  const handleFinalizarEntrega = async (pedido, index) => {
    try {
      // Si no hay método de pago en el estado local, revisa si viene del pedido
      const metodoPago = paymentMethods[index] ?? pedido.metodoPago ?? "";
      // Si no hay estado local, usa el estado del pedido, o "En proceso" como fallback
      const estadoSeleccionado = selectedStates[index] ?? pedido.estado ?? "En proceso";

      // Datos de transferencia (si aplica)
      const datosTransfer = transferData[index] || {};

      // Construye el cuerpo a enviar (ajusta según tu backend)
      const body = {
        estado: estadoSeleccionado,
        metodoPago: metodoPago,
        transferencia: datosTransfer, 
      };

      // Petición PUT para actualizar el pedido en tu backend
      const response = await fetch(`http://localhost:3000/api/pedidos/${pedido.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el pedido");
      }

      // Cierra la vista detalle después de actualizar
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

        // Método de pago actual: si no está en state, toma lo que venga del pedido
        const selectedMethod = paymentMethods[index] ?? pedido.metodoPago ?? "";
        // Datos de transferencia actual
        const currentTransferData = transferData[index] || {
          cuenta: "",
          banco: "",
          referencia: ""
        };
        // Estado actual: si no está en state, toma el que venga del pedido
        const currentState = selectedStates[index] ?? pedido.estado ?? "En proceso";

        // Formatear la fecha
        const fechaObj = new Date(pedido.fecha);
        const fechaEntrega = fechaObj.toLocaleDateString();
        const horaEntrega = fechaObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (!isExpanded) {
          // === VISTA RESUMEN (cerrada) ===
          return (
            <li key={pedido.id} className="pedido-item summary-card">
              <div className="summary-content">
                <p className="direccion">{pedido.direccion}</p>
                <p className="pedido-id">Pedido {pedido.id}</p>
                <p className="total">Total ${pedido.total}</p>
              </div>
              <div className="summary-footer">
                <p className="cliente">{pedido.nombreCliente}</p>
                <p className="estado">{pedido.estado}</p>
                <span className="flecha" onClick={() => toggleExpand(index)}>
                  ►
                </span>
              </div>
            </li>
          );
        } else {
          // === VISTA DETALLE (abierta) ===
          return (
            <li key={pedido.id} className="pedido-item detail-card">
              {/* ENCABEZADO */}
              <div className="encabezado-detalle">
                <div className="encabezado-izq">
                  <p className="numero-pedido">
                    <strong>No. Pedido:</strong> {pedido.id}
                  </p>
                </div>
                <div className="encabezado-der">
                  <p className="fecha-entrega">
                    Entrega: {fechaEntrega} - {horaEntrega}
                  </p>
                </div>
              </div>

              {/* DIRECCIÓN + ÍCONO MAP */}
              <div className="fila-detalle">
                <p className="direccion-detalle">
                  <strong>Dirección:</strong> {pedido.direccion}
                </p>
                <img src="./Iconos/Home.png" alt="Mapa" className="map-icon" />
              </div>

              {/* CLIENTE + SELECT DE ESTADOS */}
              <div className="fila-detalle">
                <p className="cliente-detalle">
                  <strong>Cliente:</strong> {pedido.nombreCliente}
                </p>
                <select
                  className="estado-select"
                  value={currentState}
                  onChange={(e) => handleStateChange(index, e.target.value)}
                >
                  {/* Reemplazamos con tus 8 estados reales */}
                  <option value="En proceso">En proceso</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Listo para entrega">Listo para entrega</option>
                  <option value="En camino">En camino</option>
                  <option value="Cancelado">Cancelado</option>
                  <option value="Entrega parcial">Entrega parcial</option>
                  <option value="Entregado/no pagado">Entregado/no pagado</option>
                </select>
              </div>

              {/* PRODUCTOS */}
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
                    {pedido.productos?.map((prod, i) => {
                      const subtotal = prod.cantidad * prod.precioUnitario;
                      return (
                        <tr key={i}>
                          <td>{prod.nombre}</td>
                          <td>{prod.cantidad}</td>
                          <td>${prod.precioUnitario}</td>
                          <td>${subtotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{ textAlign: "right" }}>
                        Total:
                      </td>
                      <td>${pedido.total}</td>
                    </tr>
                  </tfoot>
                </table>
                <hr />
              </div>

              {/* MÉTODO DE PAGO */}
              <div className="metodo-pago-bloque"> 
                <h4>Método de Pago</h4>
                <hr />
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
                      value="Transferencia"
                      checked={selectedMethod === "Transferencia"}
                      onChange={() => handlePaymentMethodChange(index, "Transferencia")}
                    />
                    Transferencia
                  </label>
                </div>

                {/* Si es Transferencia, mostrar campos adicionales */}
                {selectedMethod === "Transferencia" && (
                  <div className="datos-transferencia">
                    <label>
                      Cuenta:
                      <input
                        type="text"
                        value={currentTransferData.cuenta}
                        onChange={(e) =>
                          handleTransferFieldChange(index, "cuenta", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      Banco:
                      <input
                        type="text"
                        value={currentTransferData.banco}
                        onChange={(e) =>
                          handleTransferFieldChange(index, "banco", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      Referencia:
                      <input
                        type="text"
                        value={currentTransferData.referencia}
                        onChange={(e) =>
                          handleTransferFieldChange(index, "referencia", e.target.value)
                        }
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* BOTONES: Finalizar Entrega / Cerrar */}
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
            </li>
          );
        }
      })}
    </ul>
  );
}

export default PedidosRepartidorC;
