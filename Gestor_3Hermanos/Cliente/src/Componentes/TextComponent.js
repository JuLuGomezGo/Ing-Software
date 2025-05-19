
// TextComponent.js
import styled, { keyframes } from "styled-components";

const popIn = keyframes`
  from { transform: scale(0.98); opacity: 0.9; }
  to { transform: scale(1); opacity: 1; }
`;

const Label = styled.label`
  font-weight: bold;
  color: #5d4037;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TextBox = styled.input`
  padding: 12px;
  border: 2px solid #a96e3b;
  border-radius: 12px;
  font-size: 16px;
  background-color: #f2e6d7;
  color:rgb(23, 15, 6);
  transition: all 0.3s ease;
  font-family: 'Segoe UI', system-ui, sans-serif;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  &:hover {
    background-color: #f1e9df;
  }

  &:focus {
    border-color: #8b572a;
    outline: none;
    background-color: white;
    animation: ${popIn} 0.2s ease-out;
    box-shadow: 0 0 0 3px rgba(169, 110, 59, 0.15);
  }
    &:disabled {
      background-color: #f2e6d7;
      border-color:rgb(169, 59, 59);
      color:rgb(147, 75, 4);
      cursor: not-allowed;
    }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #a96e3b;
  border-radius: 12px;
  font-size: 16px;
  height: 90px;
  background-color: #f2e6d7;
  color: #3d2a14;
  resize: none;
  transition: all 0.3s ease;
  font-family: 'Segoe UI', system-ui, sans-serif;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  &:hover {
    background-color: #f1e9df;
  }

  &:focus {
    border-color: #8b572a;
    outline: none;
    background-color: white;
    animation: ${popIn} 0.2s ease-out;
    box-shadow: 0 0 0 3px rgba(169, 110, 59, 0.15);
  }
`;

export {Label, TextBox, TextArea };
