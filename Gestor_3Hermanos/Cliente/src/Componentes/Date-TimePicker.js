import styled from "styled-components";
import { keyframes } from "styled-components";

const popIn = keyframes`
  0% { transform: scale(0.98); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;
const move = keyframes`
0% { transform: translateY(0); }
50% { transform: translateY(-2px); }

`;

const BasePicker = styled.input`
  padding: 12px;
  border-top: none;
  border-left: none;
  border-bottom: 3px solid #a96e3b;
  border-right: 3px solid #a96e3b;
  border-radius: 20px;
  font-size: 16px;
  background-color: #f2e6d7;
  color: #3d2a14;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Segoe UI', system-ui, sans-serif;
  cursor: pointer;
  text-align: center;
  appearance: none;
  margin: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: #a96e3b;
    background-color: #f1e9df;
    animation: ${move} 0.5s ;

  }

  &:focus {
    border-color: #8b572a;
    outline: none;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(169, 110, 59, 0.2);
    animation: ${popIn} 0.2s ease-out;
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    filter: invert(0.5) sepia(1) saturate(5) hue-rotate(10deg);
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      filter: invert(0.4) sepia(1) saturate(8) hue-rotate(10deg);
    }
  }
`;

const DateBox = styled(BasePicker).attrs({ type: "date" })`
  min-width: 180px;
`;

const TimeBox = styled(BasePicker).attrs({ type: "time" })`
  min-width: 140px;
`;

export { DateBox, TimeBox };
