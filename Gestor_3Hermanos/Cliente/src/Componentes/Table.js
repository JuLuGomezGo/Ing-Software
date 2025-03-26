import styled from "styled-components";

const Table = styled.table`
  width: 90%;
  margin: 12px;
  border-collapse: collapse;
  border: 2px solid #a96e3b;
  font-size: 16px;
`;

const Th = styled.th`
  background-color: #e5c49f;
  padding: 12px;
  text-align: Center;
  font-weight: bold;
  border: 2px solid #a96e3b;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #a96e3b;
  background-color: ${({ index }) => (index % 2 === 0 ? "#f9f4ee" : "#eee4da")};
`;

export { Table, Th, Td };
