import styled from "styled-components";

const TextBox = styled.input`
  padding: 10px;
  border: 2px solid #a96e3b;
  border-radius: 10px;
  font-size: 16px;
  // width: 100%;
  background-color: #ecd8bf;
  color: black;

  &:focus {
    border-color: #8b572a;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 2px solid #a96e3b;
  border-radius: 10px;
  font-size: 16px;
  // width: 100%;
  height: 80px;
  background-color: #f9f4ee;
  color: black;
  resize: none;

  &:focus {
    border-color: #8b572a;
    outline: none;
  }
`;

export { TextBox, TextArea };
