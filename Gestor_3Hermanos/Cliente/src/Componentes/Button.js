import styled from "styled-components";

const Button = styled.button`
  padding: ${({ size }) => (size === "large" ? "12px 24px" : "8px 16px")};
  border-radius: 15px;
  border: 2px solid #a96e3b;
  font-size: ${({ size }) => (size === "large" ? "18px" : "16px")};
  background-color: ${({ variant }) =>
        variant === "primary" ? "#8B572A" : "#C19A6B"};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
  height: fit-content;

  &:hover {
    background-color: ${({ variant }) =>
        variant === "primary" ? "#6E4221" : "#A87D52"};
  }
`;

export default Button;
