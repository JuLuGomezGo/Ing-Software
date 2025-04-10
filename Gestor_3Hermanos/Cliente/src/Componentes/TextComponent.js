// import styled from "styled-components";

// const TextBox = styled.input`
//   padding: 10px;
//   border: 2px solid #a96e3b;
//   border-radius: 10px;
//   font-size: 16px;
//   // width: 100%;
//   background-color: #ecd8bf;
//   color: black;

//   &:focus {
//     border-color: #8b572a;
//     outline: none;
//   }
// `;

// const TextArea = styled.textarea`
//   padding: 10px;
//   border: 2px solid #a96e3b;
//   border-radius: 10px;
//   font-size: 16px;
//   // width: 100%;
//   height: 80px;
//   background-color: #f9f4ee;
//   color: black;
//   resize: none;

//   &:focus {
//     border-color: #8b572a;
//     outline: none;
//   }
// `;

// export { TextBox, TextArea };


// TextComponent.js
import styled, { keyframes } from "styled-components";

const popIn = keyframes`
  from { transform: scale(0.98); opacity: 0.9; }
  to { transform: scale(1); opacity: 1; }
`;

const TextBox = styled.input`
  padding: 12px;
  border: 2px solid #a96e3b;
  border-radius: 12px;
  font-size: 16px;
  background-color: #f2e6d7;
  color: #3d2a14;
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

export { TextBox, TextArea };
