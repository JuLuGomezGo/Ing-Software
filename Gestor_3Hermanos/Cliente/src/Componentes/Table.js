
import styled, { keyframes } from "styled-components";

// Animaciones
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { background-position: 100% 50%; }
  100% { background-position: -100% 50%; }
`;

const Tcontainer = styled.div`
  padding-left: 10%;

  display: table;
  display: block;
  margin-top: 25px;
  align-items: center;
  justify-content: center;
  
  max-height: ${({ $rows }) => ($rows ? `${57 * ($rows)}px` : 'auto')};
  overflow-y: ${({ $scroll }) => ($scroll ? "auto" : "visible")};

  /* Scrollbar estilizada opcional */
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: none;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }

`;

const Tbody = styled.tbody`
  display: table-row-group;
`;

const Thead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 1;
`;


const Table = styled.table`
  width: 90%;
  border-collapse: separate;
  border-spacing: 0;
  border: 2px solid #a96e3b;
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  font-size: 15px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background-color: white;
  position: relative;
  
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

`;

const Th = styled.th`
  // width: 25%;
  background: linear-gradient(180deg, #a96e3b, #8b572a);
  color: white;
  padding: 16px 12px;
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 0.95em;
  top: 0;
  transition: all 0.3s ease;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 5;

  &:first-child {
    border-top-left-radius: 10px;
  }

  &:last-child {
    border-top-right-radius: 10px;
  }

  &:hover {
    background: linear-gradient(180deg, #8b572a, #6d4422);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
    
`;

const Td = styled.td`
  padding: 14px 12px;
  background-color: ${({ $index }) => ($index % 2 === 0 ? "#f9f4ee" : "#f1e9df")};
  transition: all 0.25s ease;
  text-align: center;
  position: relative;
  font-weight: ${({ $selected }) => ($selected ? "500" : "normal")};
  color: ${({ $selected }) => ($selected ? "#5a3a1f" : "#333")};

  &:hover {
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to right,
        rgba(169, 110, 59, 0.05),
        rgba(229, 196, 159, 0.15),
        rgba(169, 110, 59, 0.05)
      );
      z-index: -1;
    }
  }

  &:first-child {
    border-left: 2px solid transparent;
  }

  &:last-child {
    border-right: 2px solid transparent;
  }
`;

const Tr = styled.tr`

  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.5s ease forwards;
  opacity: 0;

  &:hover {
    background-color: rgba(229, 196, 159, 0.25) !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);

    ${Td} {
      background-color: transparent;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &.selected {
    background-color: #e5c49f !important;
    transform: scale(1.005);
    box-shadow: 0 4px 12px rgba(169, 110, 59, 0.2);

    ${Td} {
      border-top: 1px solid #d4b68a;
      border-bottom: 1px solid #d4b68a;
      color: #3d2a14;
      font-weight: 500;
    }

    ${Td}:first-child {
      border-left: 2px solid #a96e3b;
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }

    ${Td}:last-child {
      border-right: 2px solid #a96e3b;
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
    }
  }

  &:last-child {
        ${Td}:first-child {
      border-bottom-left-radius: 10px;
    }

    ${Td}:last-child {
      border-bottom-right-radius: 10px;
    }
  }

`;

export { Table, Th, Td, Tr, Thead, Tbody, Tcontainer };