import styled from "styled-components";
import Icon from "./Icon";
import searchIcon from '../Componentes/Iconos/buscar.png'
import xIcon from '../Componentes/Iconos/x.png'


const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  // border: 2px solid #8B572A;
  border-radius: 8px;
  background-color: #F9F4EE;
  // padding: 6px 8px;
  margin-left: 20px;
  width: ${({ ancho }) =>
    ancho === "completo" ? "100%" :
      ancho === "justo" ? "fit-content" :
        ancho || "300px"};

`;
const SearchInput = styled.input.attrs({ type: "search" })`
  border: none;
  background: transparent;
  outline: none;
  flex-grow: 1;
  padding: 8px;
  font-size: 16px;
  transition: all 0.3s ease;

`;

const SearchBar = ({ value, onChange, ancho, children }) => {
  return (
    <SearchContainer ancho={ancho}>
      {children ? (
        children
      ) : (
        <>
          <Icon src={searchIcon} />
          <SearchInput
            placeholder='Buscar...'
            value={value}
            onChange={onChange}
          />
          {value && (
            <Icon
              src={xIcon}
              onClick={() => onChange({ target: { value: "" } })}
              style={{ cursor: "pointer", marginLeft: "8px" }}
            />
          )}
        </>
      )}
    </SearchContainer>
  );
};


export default SearchBar;