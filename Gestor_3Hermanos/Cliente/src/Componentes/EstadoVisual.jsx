import styled from "styled-components";
import Icon from "./Icon";

// Iconos actualizados
import iconPendiente from "./Iconos/pendienteColor.png";
import iconEnProceso from "./Iconos/preparandoColor.png";
import iconListo from "./Iconos/listoColor.png";
import iconEnCamino from "./Iconos/repartoColor.png";
import iconEntregado from "./Iconos/entregadoColor.png";
import iconPagado from "./Iconos/NOpagadoColor.png"; // ✅ Este es el nuevo que debes agregar


const estadoColores = {
  Pendiente: "#fff3cd",
  "En proceso": "#d1ecf1",
  "Listo para entrega": "#d4edda",
  "En camino": "#cfe2ff",
  Entregado: "#e2f0d9",
  Pagado: "#e0ffe0"
};

const estadoIconos = {
  Pendiente: iconPendiente,
  "En proceso": iconEnProceso,
  "Listo para entrega": iconListo,
  "En camino": iconEnCamino,
  Entregado: iconEntregado,
  Pagado: iconPagado
};

const TdEstado = styled.td`
  padding: 14px 12px;
  text-align: center;
  background-color: ${({ estado }) => estadoColores[estado] || "#f1e9df"};
  font-weight: 500;
  border-bottom: 1px solid #e0d4c6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const EstadoVisual = ({ estado }) => {
  return (
    <TdEstado estado={estado}>
      <Icon src={estadoIconos[estado]} tamaño="1.5rem" />
      {estado}
    </TdEstado>
  );
};

export default EstadoVisual;
 