// DropBox.js
import styled from "styled-components";

const DropBox = styled.select`
  height: fit-content;
  padding: 12px;
  border: 2px solid #a96e3b;
  border-radius: 12px;
  font-size: 16px;
  background-color: #f2e6d7;
  color: #3d2a14;
  font-family: 'Segoe UI', system-ui, sans-serif;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  &:hover {
    background-color: #f1e9df;
  }

  &:focus {
    border-color: #8b572a;
    outline: none;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(169, 110, 59, 0.15);
  }
`;

export default DropBox;
